
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
   */
  const sanitizeRpcParams = (input: any): any => {
    // Handle null/undefined
    if (input === null || input === undefined) {
      return input;
    }
    
    // Handle strings - remove problematic characters
    if (typeof input === 'string') {
      let sanitized = input.replace(/\n/g, '').replace(/[\x00-\x1F\x7F-\x9F]/g, '').trim();
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
   * Makes a secure RPC call to Supabase with enhanced error handling
   */
  const callRpcEndpoint = async (
    functionName: string, 
    params: Record<string, any>
  ): Promise<any> => {
    try {      
      // Sanitize parameters
      const sanitizedParams = sanitizeRpcParams(params);
      
      // Convert parameters to a sanitized JSON string
      const safeJsonParams = safeJsonStringify(sanitizedParams);
      
      console.log(`Calling RPC ${functionName} with params:`, safeJsonParams);
      
      // Make direct fetch call
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
   */
  const setPriorityMatch = async (
    founderId: string,
    investorId: string,
    priority: MatchPriority,
    setBy: string
  ) => {
    console.log("Setting priority match:", { founderId, investorId, priority, setBy });
    
    try {
      // Validate priority value
      let safePriority: MatchPriority = null;
      if (typeof priority === 'string') {
        const cleanPriority = priority.replace(/\n/g, '').replace(/\r/g, '').trim();
        
        if (cleanPriority === 'high' || cleanPriority === 'medium' || cleanPriority === 'low') {
          safePriority = cleanPriority as MatchPriority;
        } else {
          console.warn(`Invalid priority value: "${priority}" → defaulting to null`);
        }
      } else {
        safePriority = priority;
      }
      
      return await callRpcEndpoint('set_priority_match', {
        p_founder_id: founderId,
        p_investor_id: investorId,
        p_priority: safePriority,
        p_set_by: setBy
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
      return await callRpcEndpoint('set_not_interested', {
        p_founder_id: founderId,
        p_investor_id: investorId,
        p_set_by: setBy
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
      return await callRpcEndpoint('delete_priority_match', {
        p_founder_id: founderId,
        p_investor_id: investorId
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
