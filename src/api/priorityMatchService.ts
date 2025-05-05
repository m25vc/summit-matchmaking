
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type MatchPriority = Database['public']['Enums']['match_priority'] | null;

/**
 * Thoroughly sanitizes input to prevent JSON parsing issues with special characters
 * This version is more aggressive about removing problematic characters
 */
function sanitizeInput(input: any): any {
  // Handle null/undefined
  if (input === null || input === undefined) {
    return input;
  }
  
  // Handle strings - completely remove all control characters
  if (typeof input === 'string') {
    // Replace all control characters including newlines, tabs, etc.
    return input.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
  }
  
  // Handle arrays
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  
  // Handle objects
  if (typeof input === 'object') {
    const result: Record<string, any> = {};
    
    for (const key in input) {
      if (Object.prototype.hasOwnProperty.call(input, key)) {
        result[key] = sanitizeInput(input[key]);
      }
    }
    
    return result;
  }
  
  // Return other types as-is (numbers, booleans)
  return input;
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
    try {
      JSON.stringify(params);
    } catch (jsonError) {
      console.error("JSON stringify check failed:", jsonError);
      throw new Error("Invalid input data cannot be converted to JSON");
    }
    
    return supabase.rpc('set_priority_match', params);
  } catch (error) {
    console.error("Error in setPriorityMatch:", error);
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
    try {
      JSON.stringify(params);
    } catch (jsonError) {
      console.error("JSON stringify check failed:", jsonError);
      throw new Error("Invalid input data cannot be converted to JSON");
    }
    
    return supabase.rpc('set_not_interested', params);
  } catch (error) {
    console.error("Error in setNotInterested:", error);
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
    try {
      JSON.stringify(params);
    } catch (jsonError) {
      console.error("JSON stringify check failed:", jsonError);
      throw new Error("Invalid input data cannot be converted to JSON");
    }
    
    return supabase.rpc('delete_priority_match', params);
  } catch (error) {
    console.error("Error in deletePriorityMatch:", error);
    throw error;
  }
}
