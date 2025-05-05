
import { safeJsonStringify } from '@/lib/utils';
import type { Database } from '@/integrations/supabase/types';

// Define the priority match type
type MatchPriority = Database['public']['Enums']['match_priority'] | null;

// Constants for Supabase connection
const SUPABASE_URL = "https://qveetrrarbqedkcuwrcz.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2ZWV0cnJhcmJxZWRrY3V3cmN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkzMjExMDMsImV4cCI6MjA1NDg5NzEwM30.NTciPlMER1I9D5os0pLEca-Nbq_ri6ykM7ekYYfkza8";

/**
 * A hook for managing priority match operations
 * Centralizes all RPC calls and parameter sanitization
 */
export function usePriorityMatchService() {
  /**
   * Sanitizes RPC parameters to prevent issues with special characters
   * With enhanced handling for newline and control characters
   */
  const sanitizeRpcParams = (input: any): any => {
    // Handle null/undefined
    if (input === null || input === undefined) {
      return input;
    }
    
    // Handle strings - aggressively remove all problematic characters
    if (typeof input === 'string') {
      // First target the 0x0A newline character specifically that's causing issues
      let sanitized = input.replace(/\n/g, '');
      
      // Also remove carriage returns
      sanitized = sanitized.replace(/\r/g, '');
      
      // Then remove all control characters and other problematic characters
      sanitized = sanitized.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
      
      // Final trim
      sanitized = sanitized.trim();
      
      return sanitized;
    }
    
    // Handle arrays
    if (Array.isArray(input)) {
      return input.map(item => sanitizeRpcParams(item));
    }
    
    // Handle objects
    if (typeof input === 'object') {
      const result: Record<string, any> = {};
      for (const key in input) {
        if (Object.prototype.hasOwnProperty.call(input, key)) {
          result[key] = sanitizeRpcParams(input[key]);
        }
      }
      return result;
    }
    
    // Return other types as-is
    return input;
  };

  /**
   * Makes a secure RPC call to Supabase with enhanced error handling and JSON sanitization
   */
  const callRpcEndpoint = async (
    functionName: string, 
    params: Record<string, any>
  ): Promise<any> => {
    try {
      // First, sanitize parameters to remove problematic characters 
      const sanitizedParams = sanitizeRpcParams(params);
      
      // Then stringify with extra safety
      let safeJsonParams;
      try {
        // Use a custom stringify function with replacer function to handle special cases
        safeJsonParams = JSON.stringify(sanitizedParams, (key, value) => {
          if (typeof value === 'string') {
            // Extra sanitization during stringify to ensure all newlines are gone
            return value.replace(/\n/g, '').replace(/\r/g, '');
          }
          return value;
        });
      } catch (stringifyError) {
        console.error('Failed to stringify params:', stringifyError);
        // Fallback to our safe stringify utility
        safeJsonParams = safeJsonStringify(sanitizedParams);
      }
      
      console.log(`Calling RPC ${functionName} with params:`, safeJsonParams);
      
      // Make direct fetch call with sanitized JSON
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${functionName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Prefer': 'return=minimal'
        },
        body: safeJsonParams
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`RPC call failed with status ${response.status}:`, errorText);
        throw new Error(`RPC call failed: ${response.statusText} - ${errorText}`);
      }
      
      // For minimal responses, return success status
      if (response.status === 204) {
        return { success: true };
      }
      
      // Parse response with safety checks
      try {
        const data = await response.json();
        return { data };
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        return { success: true }; // Assume success since the request didn't fail
      }
    } catch (error) {
      console.error(`Error in RPC call to ${functionName}:`, error);
      throw error;
    }
  };

  /**
   * Sets a priority match between a founder and investor
   * With enhanced parameter sanitization
   */
  const setPriorityMatch = async (
    founderId: string,
    investorId: string,
    priority: MatchPriority,
    setBy: string
  ) => {
    console.log("Setting priority match:", { founderId, investorId, priority, setBy });
    
    try {
      // Aggressively sanitize all parameters
      const safeFounderId = typeof founderId === 'string' ? founderId.replace(/[\n\r\t]/g, '') : founderId;
      const safeInvestorId = typeof investorId === 'string' ? investorId.replace(/[\n\r\t]/g, '') : investorId;
      const safeSetBy = typeof setBy === 'string' ? setBy.replace(/[\n\r\t]/g, '') : setBy;
      
      // Validate and sanitize priority value
      let safePriority: MatchPriority = null;
      if (typeof priority === 'string') {
        // Clean up the priority string
        const cleanPriority = priority.replace(/\n/g, '').replace(/\r/g, '').trim();
        
        // Only assign if it's a valid match priority type
        if (cleanPriority === 'high' || cleanPriority === 'medium' || cleanPriority === 'low') {
          safePriority = cleanPriority as MatchPriority;
        } else {
          console.warn(`Invalid priority value: "${priority}" → defaulting to low`);
          safePriority = 'low';
        }
      } else {
        // If null, use 'low' since the database requires a non-null value
        safePriority = priority || 'low';
      }
      
      console.log(`Using sanitized values:`, {
        founderId: safeFounderId,
        investorId: safeInvestorId,
        priority: safePriority,
        setBy: safeSetBy
      });
      
      return await callRpcEndpoint('set_priority_match', {
        p_founder_id: safeFounderId,
        p_investor_id: safeInvestorId,
        p_priority: safePriority,
        p_set_by: safeSetBy
      });
    } catch (error) {
      console.error("Error in setPriorityMatch:", error);
      throw error;
    }
  };

  /**
   * Marks a match as "not interested"
   */
  const setNotInterested = async (
    founderId: string,
    investorId: string,
    setBy: string
  ) => {
    try {
      // Sanitize all parameters
      const safeFounderId = typeof founderId === 'string' ? founderId.replace(/[\n\r\t]/g, '') : founderId;
      const safeInvestorId = typeof investorId === 'string' ? investorId.replace(/[\n\r\t]/g, '') : investorId;
      const safeSetBy = typeof setBy === 'string' ? setBy.replace(/[\n\r\t]/g, '') : setBy;
      
      return await callRpcEndpoint('set_not_interested', {
        p_founder_id: safeFounderId,
        p_investor_id: safeInvestorId,
        p_set_by: safeSetBy
      });
    } catch (error) {
      console.error("Error in setNotInterested:", error);
      throw error;
    }
  };

  /**
   * Removes a priority match
   */
  const deletePriorityMatch = async (
    founderId: string,
    investorId: string
  ) => {
    try {
      // Sanitize parameters
      const safeFounderId = typeof founderId === 'string' ? founderId.replace(/[\n\r\t]/g, '') : founderId;
      const safeInvestorId = typeof investorId === 'string' ? investorId.replace(/[\n\r\t]/g, '') : investorId;
      
      return await callRpcEndpoint('delete_priority_match', {
        p_founder_id: safeFounderId,
        p_investor_id: safeInvestorId
      });
    } catch (error) {
      console.error("Error in deletePriorityMatch:", error);
      throw error;
    }
  };

  return {
    setPriorityMatch,
    setNotInterested,
    deletePriorityMatch
  };
}
