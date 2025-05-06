
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
   * Deeply sanitize all string values in an object to remove control characters
   * that can cause JSON serialization issues
   */
  const sanitizeDeep = (value: any): any => {
    // Base cases
    if (value === null || value === undefined) {
      return value;
    }
    
    // Handle string values directly - primary sanitization target
    if (typeof value === 'string') {
      // Remove ALL control characters including newlines, tabs, etc.
      const sanitized = value.replace(/[\x00-\x1F\x7F-\x9F]/g, "");
      console.log(`Sanitized string: "${value}" → "${sanitized}"`);
      return sanitized;
    }
    
    // Handle arrays
    if (Array.isArray(value)) {
      return value.map(item => sanitizeDeep(item));
    }
    
    // Handle objects recursively
    if (typeof value === 'object') {
      const sanitized: Record<string, any> = {};
      for (const key in value) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
          sanitized[key] = sanitizeDeep(value[key]);
        }
      }
      return sanitized;
    }
    
    // Other types (number, boolean) pass through unchanged
    return value;
  };

  /**
   * Call Supabase RPC function with enhanced error handling and debugging
   */
  const callRpc = async (
    functionName: string,
    params: Record<string, any>
  ): Promise<any> => {
    try {
      // Log the raw parameters first for debugging
      console.log(`RPC ${functionName} - RAW PARAMS:`, params);
      
      // Deep sanitize all parameters
      const sanitizedParams = sanitizeDeep(params);
      console.log(`RPC ${functionName} - SANITIZED PARAMS:`, sanitizedParams);
      
      // Special handling for priority parameter to ensure it's properly quoted in JSON
      if (functionName === 'set_priority_match' && 'p_priority' in sanitizedParams) {
        // If priority is a string, ensure it's treated properly as a string in JSON
        if (typeof sanitizedParams.p_priority === 'string') {
          console.log(`Priority parameter before special handling: ${sanitizedParams.p_priority}`);
          // No need to modify the value, just ensure proper JSON serialization
        }
      }
      
      // Format the body with manual control over JSON serialization
      const bodyJson = JSON.stringify(sanitizedParams);
      
      console.log(`RPC ${functionName} - REQUEST BODY:`, bodyJson);
      
      // Make the RPC call with manually sanitized JSON
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${functionName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Prefer': 'return=minimal'
        },
        body: bodyJson
      });
      
      // Enhanced error handling
      if (!response.ok) {
        let errorData = "";
        try {
          errorData = await response.text();
        } catch (e) {
          errorData = "Could not read error response";
        }
        
        console.error(`RPC ${functionName} failed (${response.status}):`, errorData);
        throw new Error(`RPC call to ${functionName} failed: ${response.status} - ${errorData}`);
      }
      
      // Successfully processed with no content
      if (response.status === 204) {
        console.log(`RPC ${functionName} - SUCCESS (204 No Content)`);
        return { success: true };
      }
      
      // Parse response JSON
      try {
        const data = await response.json();
        console.log(`RPC ${functionName} - SUCCESS:`, data);
        return { success: true, data };
      } catch (parseError) {
        console.warn(`RPC ${functionName} - Could not parse response, but request succeeded`);
        return { success: true };
      }
    } catch (error) {
      console.error(`RPC ${functionName} - ERROR:`, error);
      throw error;
    }
  };

  /**
   * Sets a priority match between a founder and investor
   * with enhanced input sanitization to match the SQL function
   */
  const setPriorityMatch = async (
    founderId: string,
    investorId: string,
    priority: MatchPriority,
    setBy: string
  ) => {
    try {
      console.log('setPriorityMatch - INPUT:', { founderId, investorId, priority, setBy });
      
      // Pre-validate and clean priority values to align with SQL function
      let cleanPriority: MatchPriority = null;
      
      if (priority !== null) {
        const validPriorities = ['high', 'medium', 'low'];
        
        if (typeof priority === 'string') {
          // First clean the string
          const trimmedPriority = priority.trim().toLowerCase().replace(/[\x00-\x1F\x7F-\x9F]/g, "");
          
          // Only use if it's a valid value
          if (validPriorities.includes(trimmedPriority)) {
            cleanPriority = trimmedPriority as MatchPriority;
          } else {
            console.warn(`Invalid priority value "${priority}" cleaned to "${trimmedPriority}" - defaulting to "low"`);
            cleanPriority = 'low';
          }
        } else {
          console.warn(`Non-string priority value received: ${priority} - defaulting to "low"`);
          cleanPriority = 'low';
        }
      } else {
        // Default to 'low' when null is passed (matches SQL function behavior)
        cleanPriority = 'low';
      }
      
      console.log(`setPriorityMatch - CLEAN PRIORITY: "${cleanPriority}"`);
      
      const result = await callRpc('set_priority_match', {
        p_founder_id: founderId,
        p_investor_id: investorId,
        p_priority: cleanPriority,
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
      console.log('setNotInterested - INPUT:', { founderId, investorId, setBy });
      
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
      console.log('deletePriorityMatch - INPUT:', { founderId, investorId });
      
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
