
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type MatchPriority = Database['public']['Enums']['match_priority'] | null;

/**
 * Advanced sanitization for RPC parameters
 * Handles all types with special focus on removing problematic characters from strings
 */
function sanitizeRpcParams(input: any): any {
  // Handle null/undefined
  if (input === null || input === undefined) {
    return input;
  }
  
  // Handle strings - aggressively remove all problematic characters
  if (typeof input === 'string') {
    // First, specifically target the 0x0A newline character that's causing issues
    let sanitized = input.replace(/\n/g, '');
    
    // Then remove all control characters and other problematic characters
    sanitized = sanitized.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
    
    // One final trim for good measure
    sanitized = sanitized.trim();
    
    console.log(`Sanitized string: "${input}" → "${sanitized}"`);
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
  
  // Return other types as-is (numbers, booleans)
  return input;
}

/**
 * Sets a priority match between a founder and investor
 * with enhanced error handling and debugging
 */
export async function setPriorityMatch(
  founderId: string,
  investorId: string,
  priority: MatchPriority,
  setBy: string
) {
  console.log("setPriorityMatch called with:", {
    founderId,
    investorId,
    priority,
    setBy
  });
  
  try {
    // Create params object first
    const params = {
      p_founder_id: founderId,
      p_investor_id: investorId,
      p_priority: priority,
      p_set_by: setBy
    };
    
    // Special handling for the priority value that's causing issues
    // TYPE FIX: Ensure priority is treated as a valid enum value or null
    let safePriority: MatchPriority = null;
    if (typeof priority === 'string') {
      // Validate that the string is one of the allowed enum values
      const cleanPriority = priority.replace(/\n/g, '').replace(/\r/g, '').trim();
      
      // Only assign if it's a valid match priority type
      if (cleanPriority === 'high' || cleanPriority === 'medium' || cleanPriority === 'low') {
        safePriority = cleanPriority;
      } else {
        console.warn(`Invalid priority value: "${priority}" → defaulting to null`);
      }
      
      console.log(`Priority value sanitized: "${priority}" → "${safePriority}"`);
    } else {
      // If it's already null or a valid type, use it directly
      safePriority = priority;
    }
    
    // Build a new params object with the sanitized priority
    const initialParams = {
      ...params,
      p_priority: safePriority
    };
    
    // Apply our aggressive sanitization to ALL parameters
    const sanitizedParams = sanitizeRpcParams(initialParams);
    
    // Log both the initial and sanitized parameters for comparison
    console.log("RPC params before sanitization:", JSON.stringify(initialParams));
    console.log("RPC params after sanitization:", JSON.stringify(sanitizedParams));
    
    // Verify the params can be safely stringified
    try {
      JSON.stringify(sanitizedParams);
      console.log("Params can be safely stringified to JSON");
    } catch (e) {
      console.error("JSON stringification test failed:", e);
      throw new Error("Could not convert parameters to JSON");
    }
    
    console.log("Making RPC call with sanitized params");
    
    // Make the RPC call with fully sanitized parameters
    const { data, error, status } = await supabase.rpc(
      'set_priority_match', 
      sanitizedParams
    );
    
    console.log("RPC response:", { status, data, error });
    
    if (error) {
      // Provide detailed error logging
      console.error("RPC error:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      throw error;
    }
    
    console.log("setPriorityMatch completed successfully");
    return { data, error };
  } catch (error) {
    console.error("Error in setPriorityMatch:", error);
    console.error("Error details:", {
      name: error?.name,
      message: error?.message,
      code: error?.code,
      details: error?.details,
      hint: error?.hint
    });
    throw error;
  }
}

/**
 * Marks a match as "not interested"
 */
export async function setNotInterested(
  founderId: string,
  investorId: string,
  setBy: string
) {
  try {
    console.log("setNotInterested called with:", {
      founderId,
      investorId,
      setBy
    });
    
    // Create params and sanitize
    const params = {
      p_founder_id: founderId,
      p_investor_id: investorId,
      p_set_by: setBy
    };
    
    const sanitizedParams = sanitizeRpcParams(params);
    
    console.log("Making RPC call to set_not_interested with sanitized params:", 
      JSON.stringify(sanitizedParams));
    
    // Use the sanitized params for the RPC call
    const { data, error, status } = await supabase.rpc(
      'set_not_interested', 
      sanitizedParams
    );
    
    console.log("RPC Response from set_not_interested:", { status, data, error });
    
    if (error) {
      console.error("Error from setNotInterested:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      throw error;
    }
    
    console.log("setNotInterested completed successfully");
    return { data, error };
  } catch (error) {
    console.error("Error in setNotInterested:", error);
    console.error("Error details:", {
      name: error?.name,
      message: error?.message,
      code: error?.code,
      details: error?.details,
      hint: error?.hint
    });
    throw error;
  }
}

/**
 * Removes a priority match
 */
export async function deletePriorityMatch(
  founderId: string,
  investorId: string
) {
  try {
    console.log("deletePriorityMatch called with:", {
      founderId,
      investorId
    });
    
    // Create params and sanitize
    const params = {
      p_founder_id: founderId,
      p_investor_id: investorId
    };
    
    const sanitizedParams = sanitizeRpcParams(params);
    
    console.log("Making RPC call to delete_priority_match with sanitized params:", 
      JSON.stringify(sanitizedParams));
    
    // Use the sanitized params for the RPC call
    const { data, error, status } = await supabase.rpc(
      'delete_priority_match', 
      sanitizedParams
    );
    
    console.log("RPC Response from delete_priority_match:", { status, data, error });
    
    if (error) {
      console.error("Error from deletePriorityMatch:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      throw error;
    }
    
    console.log("deletePriorityMatch completed successfully");
    return { data, error };
  } catch (error) {
    console.error("Error in deletePriorityMatch:", error);
    console.error("Error details:", {
      name: error?.name,
      message: error?.message,
      code: error?.code,
      details: error?.details,
      hint: error?.hint
    });
    throw error;
  }
}
