
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { toast } from "@/hooks/use-toast";
import { sanitizeJson, validateEnum } from '@/lib/utils';

type MatchPriority = Database['public']['Enums']['match_priority'] | null;
const validPriorities: MatchPriority[] = ['high', 'medium', 'low'];

/**
 * Sets a priority match between a founder and investor
 * using the Supabase RPC method with proper sanitization
 */
export async function setPriorityMatch(
  founderId: string,
  investorId: string,
  priority: MatchPriority,
  setBy: string
) {
  try {
    // Validate authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error("Authentication required to set priority match");
      toast.error("Please login to update priority");
      return { error: "Authentication required" };
    }

    console.log("setPriorityMatch called with:", { founderId, investorId, priority, setBy });
    
    // Validate and sanitize inputs
    const sanitizedFounderId = sanitizeJson(founderId);
    const sanitizedInvestorId = sanitizeJson(investorId);
    const sanitizedSetBy = sanitizeJson(setBy);
    
    // Special handling for priority (validate enum values)
    const validatedPriority = validateEnum(priority as string, validPriorities);
    console.log(`Priority validation: ${priority} → ${validatedPriority}`);
    
    // Use Supabase RPC method for better reliability
    const { data, error } = await supabase.rpc('set_priority_match', {
      p_founder_id: sanitizedFounderId,
      p_investor_id: sanitizedInvestorId,
      p_priority: validatedPriority || 'low', // Default to 'low' if validation fails
      p_set_by: sanitizedSetBy
    });
    
    if (error) {
      console.error("RPC error in setPriorityMatch:", error);
      toast.error(`Failed to set priority: ${error.message}`);
      return { error };
    }
    
    console.log("Priority match set successfully:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Error in setPriorityMatch:", error);
    toast.error("Failed to set priority match");
    return { error };
  }
}

/**
 * Marks a match as "not interested" using Supabase RPC
 */
export async function setNotInterested(
  founderId: string,
  investorId: string,
  setBy: string
) {
  try {
    // Validate authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error("Authentication required to set not interested");
      toast.error("Please login to update match status");
      return { error: "Authentication required" };
    }
    
    console.log("setNotInterested called with:", { founderId, investorId, setBy });
    
    // Sanitize inputs
    const sanitizedFounderId = sanitizeJson(founderId);
    const sanitizedInvestorId = sanitizeJson(investorId);
    const sanitizedSetBy = sanitizeJson(setBy);
    
    // Use Supabase RPC method
    const { data, error } = await supabase.rpc('set_not_interested', {
      p_founder_id: sanitizedFounderId,
      p_investor_id: sanitizedInvestorId,
      p_set_by: sanitizedSetBy
    });
    
    if (error) {
      console.error("RPC error in setNotInterested:", error);
      toast.error(`Failed to mark as not interested: ${error.message}`);
      return { error };
    }
    
    console.log("Match marked as not interested successfully:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Error in setNotInterested:", error);
    toast.error("Failed to mark as not interested");
    return { error };
  }
}

/**
 * Removes a priority match using Supabase RPC
 */
export async function deletePriorityMatch(
  founderId: string,
  investorId: string
) {
  try {
    // Validate authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error("Authentication required to delete priority match");
      toast.error("Please login to remove match");
      return { error: "Authentication required" };
    }
    
    console.log("deletePriorityMatch called with:", { founderId, investorId });
    
    // Sanitize inputs
    const sanitizedFounderId = sanitizeJson(founderId);
    const sanitizedInvestorId = sanitizeJson(investorId);
    
    // Use Supabase RPC method
    const { data, error } = await supabase.rpc('delete_priority_match', {
      p_founder_id: sanitizedFounderId,
      p_investor_id: sanitizedInvestorId
    });
    
    if (error) {
      console.error("RPC error in deletePriorityMatch:", error);
      toast.error(`Failed to delete match: ${error.message}`);
      return { error };
    }
    
    console.log("Priority match deleted successfully:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Error in deletePriorityMatch:", error);
    toast.error("Failed to delete priority match");
    return { error };
  }
}
