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
   * Safely clean a string by removing all control characters
   */
  const cleanString = (str: string): string => {
    return str.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
  };

  /**
   * Make a direct API call to Supabase RPC endpoint
   */
  const callRpc = async (
    functionName: string,
    params: Record<string, any>
  ): Promise<any> => {
    try {
      // Clean all string values in the params
      const cleanParams: Record<string, any> = {};
      
      for (const key in params) {
        const value = params[key];
        cleanParams[key] = typeof value === 'string' ? cleanString(value) : value;
      }
      
      // Log the params for debugging
      console.log(`Calling RPC ${functionName} with params:`, cleanParams);
      
      // Convert params to JSON with care
      const body = JSON.stringify(cleanParams);
      
      // Make the request
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${functionName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        },
        body
      });
      
      // Handle errors
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`RPC call failed: ${response.status} - ${errorText}`);
      }
      
      // If status is 204 No Content, return success
      if (response.status === 204) {
        return { success: true };
      }
      
      // Otherwise parse and return the response
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
    // Validate and clean priority
    let cleanPriority = priority;
    
    // Default to low if null or invalid
    if (priority === null || (typeof priority === 'string' && 
        !['high', 'medium', 'low'].includes(priority))) {
      cleanPriority = 'low';
    }
    
    return await callRpc('set_priority_match', {
      p_founder_id: founderId,
      p_investor_id: investorId,
      p_priority: cleanPriority,
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
