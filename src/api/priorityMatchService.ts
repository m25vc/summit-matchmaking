
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type MatchPriority = Database['public']['Enums']['match_priority'] | null;

/**
 * Sanitizes input to prevent issues with special characters
 */
function sanitizeInput(input: any) {
  if (typeof input === 'string') {
    // Remove any newline characters or other problematic characters
    return input.trim().replace(/[\n\r\t]/g, '');
  }
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
  
  // Sanitize all inputs
  const sanitizedFounderId = sanitizeInput(founderId);
  const sanitizedInvestorId = sanitizeInput(investorId);
  const sanitizedPriority = priority ? sanitizeInput(priority) : null;
  const sanitizedSetBy = sanitizeInput(setBy);
  
  return supabase.rpc('set_priority_match', {
    p_founder_id: sanitizedFounderId,
    p_investor_id: sanitizedInvestorId,
    p_priority: sanitizedPriority,
    p_set_by: sanitizedSetBy
  });
}

/**
 * Marks a match as "not interested"
 */
export async function setNotInterested(
  founderId: string,
  investorId: string,
  setBy: string
) {
  // Sanitize all inputs
  const sanitizedFounderId = sanitizeInput(founderId);
  const sanitizedInvestorId = sanitizeInput(investorId);
  const sanitizedSetBy = sanitizeInput(setBy);
  
  return supabase.rpc('set_not_interested', {
    p_founder_id: sanitizedFounderId,
    p_investor_id: sanitizedInvestorId,
    p_set_by: sanitizedSetBy
  });
}

/**
 * Removes a priority match
 */
export async function deletePriorityMatch(
  founderId: string,
  investorId: string
) {
  // Sanitize all inputs
  const sanitizedFounderId = sanitizeInput(founderId);
  const sanitizedInvestorId = sanitizeInput(investorId);
  
  return supabase.rpc('delete_priority_match', {
    p_founder_id: sanitizedFounderId,
    p_investor_id: sanitizedInvestorId
  });
}
