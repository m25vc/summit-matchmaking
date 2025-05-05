
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
   * Makes a secure RPC call to Supabase with enhanced error handling and JSON sanitization
   * Critical fix: Uses fetch with manually controlled JSON to prevent newline character issues
   */
  const callRpcEndpoint = async (
    functionName: string, 
    params: Record<string, any>
  ): Promise<any> => {
    try {
      // Manually sanitize each parameter to ensure all newlines and control chars are removed
      const sanitizedParams: Record<string, any> = {};
      
      for (const key in params) {
        if (Object.prototype.hasOwnProperty.call(params, key)) {
          const value = params[key];
          if (typeof value === 'string') {
            // Remove ALL control characters including newlines and carriage returns
            sanitizedParams[key] = value.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
          } else {
            sanitizedParams[key] = value;
          }
        }
      }
      
      // Convert to a JSON string manually to avoid any automatic serialization issues
      const jsonBody = JSON.stringify(sanitizedParams);
      
      // Log the exact payload for debugging
      console.log(`Calling RPC ${functionName} with exact payload:`, jsonBody);
      
      // Make the fetch call with sanitized JSON
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${functionName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Prefer': 'return=minimal'
        },
        body: jsonBody
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`RPC call failed with status ${response.status}:`, errorText);
        throw new Error(`RPC call failed: ${response.statusText} - ${errorText}`);
      }
      
      // For minimal responses, just return success status
      if (response.status === 204) {
        return { success: true };
      }
      
      // Parse response but handle parsing errors
      try {
        const data = await response.json();
        return { data };
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        return { success: true }; // Assume success since status was OK
      }
    } catch (error) {
      console.error(`Error in RPC call to ${functionName}:`, error);
      throw error;
    }
  };

  /**
   * Sets a priority match between a founder and investor
   * With improved parameter validation
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
        // Ensure the priority string contains no control characters
        const cleanPriority = priority.replace(/[\x00-\x1F\x7F-\x9F]/g, '').trim();
        
        // Only assign if it's a valid match priority
        if (cleanPriority === 'high' || cleanPriority === 'medium' || cleanPriority === 'low') {
          safePriority = cleanPriority as MatchPriority;
        } else {
          console.warn(`Invalid priority value: "${priority}" → defaulting to low`);
          safePriority = 'low';
        }
      } else {
        // If null, default to 'low' since the database expects a non-null value
        safePriority = priority || 'low';
      }
      
      // Directly clean the inputs (this is critical to prevent the 0x0a error)
      const cleanFounderId = typeof founderId === 'string' ? founderId.replace(/[\x00-\x1F\x7F-\x9F]/g, '') : founderId;
      const cleanInvestorId = typeof investorId === 'string' ? investorId.replace(/[\x00-\x1F\x7F-\x9F]/g, '') : investorId;
      const cleanSetBy = typeof setBy === 'string' ? setBy.replace(/[\x00-\x1F\x7F-\x9F]/g, '') : setBy;
      
      return await callRpcEndpoint('set_priority_match', {
        p_founder_id: cleanFounderId,
        p_investor_id: cleanInvestorId,
        p_priority: safePriority,
        p_set_by: cleanSetBy
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
      // Directly clean the inputs (critical to prevent the 0x0a error)
      const cleanFounderId = typeof founderId === 'string' ? founderId.replace(/[\x00-\x1F\x7F-\x9F]/g, '') : founderId;
      const cleanInvestorId = typeof investorId === 'string' ? investorId.replace(/[\x00-\x1F\x7F-\x9F]/g, '') : investorId;
      const cleanSetBy = typeof setBy === 'string' ? setBy.replace(/[\x00-\x1F\x7F-\x9F]/g, '') : setBy;
      
      return await callRpcEndpoint('set_not_interested', {
        p_founder_id: cleanFounderId,
        p_investor_id: cleanInvestorId,
        p_set_by: cleanSetBy
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
      // Directly clean the inputs (critical to prevent the 0x0a error)
      const cleanFounderId = typeof founderId === 'string' ? founderId.replace(/[\x00-\x1F\x7F-\x9F]/g, '') : founderId;
      const cleanInvestorId = typeof investorId === 'string' ? investorId.replace(/[\x00-\x1F\x7F-\x9F]/g, '') : investorId;
      
      return await callRpcEndpoint('delete_priority_match', {
        p_founder_id: cleanFounderId,
        p_investor_id: cleanInvestorId
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
