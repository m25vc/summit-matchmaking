
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type MatchPriority = Database['public']['Enums']['match_priority'] | null;

/**
 * Thoroughly sanitizes input to prevent JSON parsing issues with special characters
 */
function sanitizeInput(input: any): any {
  // For null or undefined values, return as is
  if (input === null || input === undefined) {
    return input;
  }
  
  // For strings, remove problematic characters and escape newlines
  if (typeof input === 'string') {
    // Replace all newlines, tabs, and other control characters that could cause JSON issues
    return input
      .replace(/[\n\r]/g, '') // Remove newlines and carriage returns
      .replace(/[\t]/g, ' ')  // Replace tabs with spaces
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, ''); // Remove other control characters
  }
  
  // For objects (including arrays), recursively sanitize each property
  if (typeof input === 'object') {
    if (Array.isArray(input)) {
      return input.map(item => sanitizeInput(item));
    }
    
    const sanitizedObj: Record<string, any> = {};
    for (const key in input) {
      if (Object.prototype.hasOwnProperty.call(input, key)) {
        sanitizedObj[key] = sanitizeInput(input[key]);
      }
    }
    return sanitizedObj;
  }
  
  // For all other types (numbers, booleans, etc.), return as is
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
    // Sanitize all inputs
    const sanitizedFounderId = sanitizeInput(founderId);
    const sanitizedInvestorId = sanitizeInput(investorId);
    const sanitizedPriority = priority ? sanitizeInput(priority) : null;
    const sanitizedSetBy = sanitizeInput(setBy);
    
    console.log("Sanitized inputs:", {
      founderId: sanitizedFounderId,
      investorId: sanitizedInvestorId,
      priority: sanitizedPriority,
      setBy: sanitizedSetBy
    });
    
    return supabase.rpc('set_priority_match', {
      p_founder_id: sanitizedFounderId,
      p_investor_id: sanitizedInvestorId,
      p_priority: sanitizedPriority,
      p_set_by: sanitizedSetBy
    });
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
    
    return supabase.rpc('set_not_interested', {
      p_founder_id: sanitizedFounderId,
      p_investor_id: sanitizedInvestorId,
      p_set_by: sanitizedSetBy
    });
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
    
    return supabase.rpc('delete_priority_match', {
      p_founder_id: sanitizedFounderId,
      p_investor_id: sanitizedInvestorId
    });
  } catch (error) {
    console.error("Error in deletePriorityMatch:", error);
    throw error;
  }
}
