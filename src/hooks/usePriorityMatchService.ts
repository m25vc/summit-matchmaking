
import type { Database } from '@/integrations/supabase/types';

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
   * Make a direct API call to Supabase RPC endpoint with proper JSON escaping
   */
  const callRpc = async (
    functionName: string,
    params: Record<string, any>
  ): Promise<any> => {
    try {
      // Properly sanitize and escape all string values
      const sanitizedParams: Record<string, any> = {};
      
      for (const key in params) {
        if (typeof params[key] === 'string') {
          // Remove all newlines and control characters
          sanitizedParams[key] = params[key].replace(/[\x00-\x1F\x7F-\x9F]/g, '');
        } else {
          sanitizedParams[key] = params[key];
        }
      }
      
      // Convert to JSON using dollar-quoted string to handle special characters
      const body = JSON.stringify(sanitizedParams);
      
      console.log(`Calling RPC ${functionName} with sanitized params:`, sanitizedParams);
      
      // Make the API call
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${functionName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Prefer': 'return=minimal'
        },
        body
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`RPC call to ${functionName} failed:`, errorText);
        throw new Error(`RPC call failed: ${response.status} - ${errorText}`);
      }
      
      // Handle 204 No Content responses
      if (response.status === 204) {
        return { success: true };
      }
      
      // Parse response
      const data = await response.json();
      return { data };
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
    // Validate priority value
    let validPriority = priority;
    
    // Default to low if null or invalid
    if (priority === null || (typeof priority === 'string' && 
        !['high', 'medium', 'low'].includes(priority))) {
      validPriority = 'low';
    }
    
    return await callRpc('set_priority_match', {
      p_founder_id: founderId,
      p_investor_id: investorId,
      p_priority: validPriority,
      p_set_by: setBy
    });
  };

  /**
   * Marks a match as "not interested"
   */
  const setNotInterested = async (
    founderId: string,
    investorId: string,
    setBy: string
  ) => {
    return await callRpc('set_not_interested', {
      p_founder_id: founderId,
      p_investor_id: investorId,
      p_set_by: setBy
    });
  };

  /**
   * Removes a priority match
   */
  const deletePriorityMatch = async (
    founderId: string,
    investorId: string
  ) => {
    return await callRpc('delete_priority_match', {
      p_founder_id: founderId,
      p_investor_id: investorId
    });
  };

  return {
    setPriorityMatch,
    setNotInterested,
    deletePriorityMatch
  };
}
