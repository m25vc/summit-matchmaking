
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type MatchPriority = Database['public']['Enums']['match_priority'] | null;

/**
 * Sets a priority match between a founder and investor
 */
export async function setPriorityMatch(
  founderId: string,
  investorId: string,
  priority: MatchPriority,
  setBy: string
) {
  return supabase.rpc('set_priority_match', {
    p_founder_id: founderId,
    p_investor_id: investorId,
    p_priority: priority,
    p_set_by: setBy
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
  return supabase.rpc('set_not_interested', {
    p_founder_id: founderId,
    p_investor_id: investorId,
    p_set_by: setBy
  });
}

/**
 * Removes a priority match
 */
export async function deletePriorityMatch(
  founderId: string,
  investorId: string
) {
  return supabase.rpc('delete_priority_match', {
    p_founder_id: founderId,
    p_investor_id: investorId
  });
}
