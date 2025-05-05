
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type MatchPriority = Database['public']['Enums']['match_priority'] | null;

/**
 * Thoroughly sanitizes input to prevent JSON parsing issues
 * This is much more aggressive about removing problematic characters
 */
function sanitizeInput(input: any): any {
  try {
    console.log(`SANITIZE - Input type: ${typeof input}, value:`, input);
    
    // Handle null/undefined
    if (input === null || input === undefined) {
      console.log("SANITIZE - Returning null/undefined as is");
      return input;
    }
    
    // Handle strings - completely remove all control characters
    if (typeof input === 'string') {
      // Replace ALL control characters including newlines, tabs, etc.
      // Using a more comprehensive regex to catch all problematic characters
      const sanitized = input.replace(/[\x00-\x1F\x7F-\x9F\u2028\u2029]/g, '')
                            .replace(/[\n\r\t]/g, '') // Explicit removal of newlines, tabs
                            .trim(); // Remove leading/trailing whitespace
      
      console.log(`SANITIZE - String sanitized from "${input}" to "${sanitized}"`);
      console.log(`SANITIZE - Original length: ${input.length}, Sanitized length: ${sanitized.length}`);
      
      // Check for any remaining problematic characters
      const hexRepresentation = Array.from(sanitized).map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' ');
      console.log(`SANITIZE - Hex representation of sanitized string: ${hexRepresentation}`);
      
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
  } catch (error) {
    // If anything goes wrong with sanitization, log it and return a safe default
    console.error("SANITIZE - Error during sanitization:", error);
    
    // Return safely based on the input type
    if (typeof input === 'string') return "";
    if (Array.isArray(input)) return [];
    if (typeof input === 'object' && input !== null) return {};
    return input; // Return primitives as-is
  }
}

/**
 * Converts an object to a safe string for debugging purposes
 */
function safeStringify(obj: any): string {
  try {
    return JSON.stringify(obj, 
      (key, value) => {
        // Convert special objects that don't serialize well
        if (value instanceof Error) {
          return {
            name: value.name,
            message: value.message,
            stack: value.stack
          };
        }
        return value;
      }, 2);
  } catch (error) {
    return `[Unstringifiable object: ${error}]`;
  }
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
 * Performs additional character-by-character check for JSON safety
 */
function ensureJsonSafe(obj: any): any {
  try {
    const jsonString = JSON.stringify(obj);
    // Parse it back to ensure it's valid
    JSON.parse(jsonString);
    return obj;
  } catch (error) {
    console.error("JSON safety check failed:", error);
    // Perform more aggressive sanitization
    if (typeof obj === 'object' && obj !== null) {
      const sanitized: Record<string, any> = {};
      for (const key in obj) {
        const value = obj[key];
        if (typeof value === 'string') {
          // Super aggressive sanitization for strings
          sanitized[key] = value.replace(/[^\x20-\x7E]/g, '');
        } else if (typeof value === 'object' && value !== null) {
          sanitized[key] = ensureJsonSafe(value);
        } else {
          sanitized[key] = value;
        }
      }
      return sanitized;
    } else if (typeof obj === 'string') {
      return obj.replace(/[^\x20-\x7E]/g, '');
    }
    return obj;
  }
}

/**
 * Sets a priority match between a founder and investor
 * with enhanced error logging and debugging
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
    
    // Multi-level sanitization for extra safety
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
    
    // Create params object
    const params = {
      p_founder_id: sanitizedFounderId,
      p_investor_id: sanitizedInvestorId,
      p_priority: sanitizedPriority,
      p_set_by: sanitizedSetBy
    };
    
    // Additional safety check and aggressive sanitization
    const safePriority = typeof sanitizedPriority === 'string' 
      ? sanitizedPriority.replace(/[\n\r\t]/g, '') 
      : sanitizedPriority;
    
    // Rebuild the params object with the extra-sanitized priority
    const safeParams = {
      ...params,
      p_priority: safePriority
    };
    
    // Extra validation for JSON safety
    if (!canStringifyToJson(safeParams)) {
      console.error("Invalid input data cannot be converted to JSON:", safeParams);
      throw new Error("Invalid input data cannot be converted to JSON");
    }
    
    // Log stringified version to check for any issues
    const paramsString = JSON.stringify(safeParams);
    console.log("JSON String length:", paramsString.length);
    console.log("JSON String preview:", paramsString.substring(0, 100));
    
    // One final check for safety
    const finalParams = ensureJsonSafe(safeParams);
    
    console.log("MAKING RPC CALL with params:", safeStringify(finalParams));
    
    // Use a more detailed error-handling approach
    const { data, error, status, statusText } = await supabase.rpc('set_priority_match', finalParams);
    
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
    // Detailed logging of raw inputs
    console.log("setNotInterested called with raw inputs:", {
      founderId: { value: founderId, type: typeof founderId, length: founderId?.length },
      investorId: { value: investorId, type: typeof investorId, length: investorId?.length },
      setBy: { value: setBy, type: typeof setBy, length: setBy?.length }
    });
    
    // Sanitize all inputs with the improved function
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
    
    // One final check for safety
    const finalParams = ensureJsonSafe(params);
    
    console.log("MAKING RPC CALL to set_not_interested with params:", safeStringify(finalParams));
    
    // Use a more detailed error-handling approach
    const { data, error, status, statusText } = await supabase.rpc('set_not_interested', finalParams);
    
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
    // Detailed logging of raw inputs
    console.log("deletePriorityMatch called with raw inputs:", {
      founderId: { value: founderId, type: typeof founderId, length: founderId?.length },
      investorId: { value: investorId, type: typeof investorId, length: investorId?.length }
    });
    
    // Sanitize all inputs with the improved function
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
    
    // One final check for safety
    const finalParams = ensureJsonSafe(params);
    
    console.log("MAKING RPC CALL to delete_priority_match with params:", safeStringify(finalParams));
    
    // Use a more detailed error-handling approach
    const { data, error, status, statusText } = await supabase.rpc('delete_priority_match', finalParams);
    
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
