
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type MatchPriority = Database['public']['Enums']['match_priority'] | null;

/**
 * Thoroughly sanitizes input to prevent JSON parsing issues with special characters
 * This version is more aggressive about removing problematic characters
 */
function sanitizeInput(input: any): any {
  console.log(`SANITIZE - Input type: ${typeof input}, value:`, input);
  
  // Handle null/undefined
  if (input === null || input === undefined) {
    console.log("SANITIZE - Returning null/undefined as is");
    return input;
  }
  
  // Handle strings - completely remove all control characters
  if (typeof input === 'string') {
    // Replace all control characters including newlines, tabs, etc.
    const sanitized = input.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
    console.log(`SANITIZE - String sanitized from "${input}" to "${sanitized}"`);
    return sanitized;
  }
  
  // Handle arrays
  if (Array.isArray(input)) {
    console.log("SANITIZE - Processing array");
    return input.map(item => {
      const sanitized = sanitizeInput(item);
      console.log(`SANITIZE - Array item sanitized:`, { before: item, after: sanitized });
      return sanitized;
    });
  }
  
  // Handle objects
  if (typeof input === 'object') {
    console.log("SANITIZE - Processing object:", input);
    const result: Record<string, any> = {};
    
    for (const key in input) {
      if (Object.prototype.hasOwnProperty.call(input, key)) {
        console.log(`SANITIZE - Processing object field: ${key}`);
        result[key] = sanitizeInput(input[key]);
        console.log(`SANITIZE - Object field sanitized: ${key}`, { 
          before: input[key], 
          after: result[key] 
        });
      }
    }
    
    return result;
  }
  
  // Return other types as-is (numbers, booleans)
  console.log(`SANITIZE - Returning non-string primitive as is: ${input}`);
  return input;
}

/**
 * Checks if an object can be safely stringified to JSON
 */
function canStringifyToJson(obj: any): boolean {
  try {
    JSON.stringify(obj);
    return true;
  } catch (error) {
    console.error("JSON Stringify Check Failed:", error);
    return false;
  }
}

/**
 * Sets a priority match between a founder and investor
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
    // Detailed logging of raw inputs
    console.log("RAW INPUTS - PRE-SANITIZATION:", {
      founderId: { value: founderId, type: typeof founderId, length: founderId?.length },
      investorId: { value: investorId, type: typeof investorId, length: investorId?.length },
      priority: { value: priority, type: typeof priority },
      setBy: { value: setBy, type: typeof setBy, length: setBy?.length }
    });
    
    // Sanitize inputs
    const sanitizedFounderId = sanitizeInput(founderId);
    const sanitizedInvestorId = sanitizeInput(investorId);
    // If priority is null, default to 'low' since the column is NOT NULL
    const sanitizedPriority = priority ? sanitizeInput(priority) : 'low';
    const sanitizedSetBy = sanitizeInput(setBy);
    
    console.log("Sanitized inputs:", {
      founderId: sanitizedFounderId,
      investorId: sanitizedInvestorId,
      priority: sanitizedPriority,
      setBy: sanitizedSetBy
    });
    
    // Extra validation for JSON safety
    const params = {
      p_founder_id: sanitizedFounderId,
      p_investor_id: sanitizedInvestorId,
      p_priority: sanitizedPriority,
      p_set_by: sanitizedSetBy
    };
    
    // Try to stringify and parse to catch any remaining JSON issues
    if (!canStringifyToJson(params)) {
      throw new Error("Invalid input data cannot be converted to JSON");
    }
    
    console.log("MAKING RPC CALL with params:", JSON.stringify(params));
    
    // Use a more detailed error-handling approach
    const { data, error, status, statusText } = await supabase.rpc('set_priority_match', params);
    
    // Log detailed response information
    console.log("RPC Response:", {
      status,
      statusText,
      data,
      error
    });
    
    if (error) {
      console.error("Error details:", {
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
    console.error("Error stack:", error.stack);
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
    // Detailed logging of raw inputs
    console.log("setNotInterested called with raw inputs:", {
      founderId: { value: founderId, type: typeof founderId, length: founderId?.length },
      investorId: { value: investorId, type: typeof investorId, length: investorId?.length },
      setBy: { value: setBy, type: typeof setBy, length: setBy?.length }
    });
    
    // Sanitize all inputs
    const sanitizedFounderId = sanitizeInput(founderId);
    const sanitizedInvestorId = sanitizeInput(investorId);
    const sanitizedSetBy = sanitizeInput(setBy);
    
    console.log("setNotInterested sanitized inputs:", {
      founderId: sanitizedFounderId,
      investorId: sanitizedInvestorId,
      setBy: sanitizedSetBy
    });
    
    // Extra validation for JSON safety
    const params = {
      p_founder_id: sanitizedFounderId,
      p_investor_id: sanitizedInvestorId,
      p_set_by: sanitizedSetBy
    };
    
    // Try to stringify and parse to catch any remaining JSON issues
    if (!canStringifyToJson(params)) {
      console.error("JSON stringify check failed for params:", params);
      throw new Error("Invalid input data cannot be converted to JSON");
    }
    
    console.log("MAKING RPC CALL to set_not_interested with params:", JSON.stringify(params));
    
    // Use a more detailed error-handling approach
    const { data, error, status, statusText } = await supabase.rpc('set_not_interested', params);
    
    // Log detailed response information
    console.log("RPC Response from set_not_interested:", {
      status,
      statusText,
      data,
      error
    });
    
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
    console.error("Error stack:", error.stack);
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
    // Detailed logging of raw inputs
    console.log("deletePriorityMatch called with raw inputs:", {
      founderId: { value: founderId, type: typeof founderId, length: founderId?.length },
      investorId: { value: investorId, type: typeof investorId, length: investorId?.length }
    });
    
    // Sanitize all inputs
    const sanitizedFounderId = sanitizeInput(founderId);
    const sanitizedInvestorId = sanitizeInput(investorId);
    
    console.log("deletePriorityMatch sanitized inputs:", {
      founderId: sanitizedFounderId,
      investorId: sanitizedInvestorId
    });
    
    // Extra validation for JSON safety
    const params = {
      p_founder_id: sanitizedFounderId,
      p_investor_id: sanitizedInvestorId
    };
    
    // Try to stringify and parse to catch any remaining JSON issues
    if (!canStringifyToJson(params)) {
      console.error("JSON stringify check failed for params:", params);
      throw new Error("Invalid input data cannot be converted to JSON");
    }
    
    console.log("MAKING RPC CALL to delete_priority_match with params:", JSON.stringify(params));
    
    // Use a more detailed error-handling approach
    const { data, error, status, statusText } = await supabase.rpc('delete_priority_match', params);
    
    // Log detailed response information
    console.log("RPC Response from delete_priority_match:", {
      status,
      statusText,
      data,
      error
    });
    
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
    console.error("Error stack:", error.stack);
    throw error;
  }
}
