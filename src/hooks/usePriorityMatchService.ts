
import type { Database } from '@/integrations/supabase/types';
import { toast } from "sonner";

// Define the priority match type
type MatchPriority = Database['public']['Enums']['match_priority'] | null;

/**
 * A hook for managing priority match operations with Supabase RPC calls
 */
export function usePriorityMatchService() {
  // Supabase connection constants
  const SUPABASE_URL = "https://qveetrrarbqedkcuwrcz.supabase.co";
  const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2ZWV0cnJhcmJxZWRrY3V3cmN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkzMjExMDMsImV4cCI6MjA1NDg5NzEwM30.NTciPlMER1I9D5os0pLEca-Nbq_ri6ykM7ekYYfkza8";

  /**
   * Safely prepare parameters for RPC by sanitizing all values
   */
  const sanitizeParams = (params: Record<string, any>): Record<string, any> => {
    const sanitized: Record<string, any> = {};
    
    for (const key in params) {
      if (typeof params[key] === 'string') {
        // Remove ALL control characters including newlines
        sanitized[key] = params[key].replace(/[\x00-\x1F\x7F-\x9F]/g, "");
      } else {
        sanitized[key] = params[key];
      }
    }
    
    return sanitized;
  };

  /**
   * Make a direct API call to Supabase RPC endpoint using application/json
   * with properly serialized parameters
   */
  const callRpc = async (
    functionName: string,
    params: Record<string, any>
  ): Promise<any> => {
    try {
      // Clean all parameters to remove control characters
      const cleanParams = sanitizeParams(params);
      
      console.log(`RPC call to ${functionName} with sanitized params:`, cleanParams);
      
      // Use the URLSearchParams approach for more reliable parameter passing
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${functionName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Prefer': 'return=minimal'
        },
        // Stringify with replacer function to handle any remaining control characters
        body: JSON.stringify(cleanParams, (key, value) => {
          if (typeof value === 'string') {
            return value.replace(/[\x00-\x1F\x7F-\x9F]/g, "");
          }
          return value;
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error in RPC call to ${functionName}:`, errorText);
        throw new Error(`RPC call failed: ${response.status} - ${errorText}`);
      }
      
      // Handle 204 No Content successfully
      if (response.status === 204) {
        return { success: true };
      }
      
      // Parse the response JSON
      const data = await response.json();
      return { success: true, data };
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
    try {
      // Validate priority value
      let validPriority: MatchPriority = priority;
      
      // Default to low if null or invalid
      if (priority === null || (typeof priority === 'string' && 
          !['high', 'medium', 'low'].includes(priority))) {
        validPriority = 'low';
      }

      // Use the updated callRpc function
      const result = await callRpc('set_priority_match', {
        p_founder_id: founderId,
        p_investor_id: investorId,
        p_priority: validPriority,
        p_set_by: setBy
      });
      
      return result;
    } catch (error) {
      toast.error("Failed to set priority match");
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
      const result = await callRpc('set_not_interested', {
        p_founder_id: founderId,
        p_investor_id: investorId,
        p_set_by: setBy
      });
      
      return result;
    } catch (error) {
      toast.error("Failed to mark as not interested");
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
      const result = await callRpc('delete_priority_match', {
        p_founder_id: founderId,
        p_investor_id: investorId
      });
      
      return result;
    } catch (error) {
      toast.error("Failed to delete priority match");
      throw error;
    }
  };

  return {
    setPriorityMatch,
    setNotInterested,
    deletePriorityMatch
  };
}
