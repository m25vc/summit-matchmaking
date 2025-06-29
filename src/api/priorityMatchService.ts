
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { toast } from "@/hooks/use-toast";
import { sanitizeJson, validateEnum } from '@/lib/utils';

type MatchPriority = Database['public']['Enums']['match_priority'] | null;
const validPriorities: MatchPriority[] = ['high', 'medium', 'low'];

/**
 * Sets a priority match between a founder and investor
 * using direct table operations instead of RPC
 */
export async function setPriorityMatch(
  founderId: string,
  investorId: string,
  priority: MatchPriority,
  setBy: string
) {
  try {
    // Validate authentication first
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error("Authentication required to set priority match");
      toast.error("Authentication required, please login");
      return { error: "Authentication required" };
    }

    console.log(`Setting priority match with:`, { 
      founderId, 
      investorId,
      priority,
      setBy
    });
    
    // Sanitize all inputs
    const cleanFounderId = sanitizeJson(founderId);
    const cleanInvestorId = sanitizeJson(investorId);
    const cleanSetBy = sanitizeJson(setBy);
    
    // Validate enum values
    const validPriority = validateEnum(priority as string, validPriorities);
    if (!validPriority && priority !== null) {
      console.error(`Invalid priority value: ${priority}`);
      toast.error("Invalid priority value");
      return { error: "Invalid priority value" };
    }
    
    // Use direct table operations instead of RPC
    const { data, error } = await supabase
      .from('priority_matches')
      .upsert({
        founder_id: cleanFounderId,
        investor_id: cleanInvestorId,
        priority: validPriority || 'low',
        set_by: cleanSetBy,
        not_interested: false
      }, { 
        onConflict: 'founder_id,investor_id',
        ignoreDuplicates: false
      });
    
    if (error) {
      console.error("Error setting priority match:", error);
      toast.error(`Failed to set priority: ${error.message}`);
      return { error };
    }
    
    toast.success("Priority updated successfully");
    return { success: true, data };
  } catch (error) {
    console.error("Exception in setPriorityMatch:", error);
    toast.error("An unexpected error occurred");
    return { error };
  }
}

/**
 * Marks a match as "not interested" using direct table operations
 */
export async function setNotInterested(
  founderId: string,
  investorId: string,
  setBy: string
) {
  try {
    // Validate authentication first
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error("Authentication required to mark as not interested");
      toast.error("Authentication required, please login");
      return { error: "Authentication required" };
    }

    // Sanitize inputs
    const cleanFounderId = sanitizeJson(founderId);
    const cleanInvestorId = sanitizeJson(investorId);
    const cleanSetBy = sanitizeJson(setBy);
    
    // Use direct table operations
    const { data, error } = await supabase
      .from('priority_matches')
      .upsert({
        founder_id: cleanFounderId,
        investor_id: cleanInvestorId,
        priority: 'low',
        set_by: cleanSetBy,
        not_interested: true
      }, {
        onConflict: 'founder_id,investor_id',
        ignoreDuplicates: false
      });
    
    if (error) {
      console.error("Error marking as not interested:", error);
      toast.error(`Failed to mark as not interested: ${error.message}`);
      return { error };
    }
    
    toast.success("Marked as not interested");
    return { success: true, data };
  } catch (error) {
    console.error("Exception in setNotInterested:", error);
    toast.error("An unexpected error occurred");
    return { error };
  }
}

/**
 * Removes a priority match using direct table operations
 */
export async function deletePriorityMatch(
  founderId: string,
  investorId: string
) {
  try {
    // Validate authentication first
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error("Authentication required to delete match");
      toast.error("Authentication required, please login");
      return { error: "Authentication required" };
    }

    // Sanitize inputs
    const cleanFounderId = sanitizeJson(founderId);
    const cleanInvestorId = sanitizeJson(investorId);
    
    // Use direct delete operation instead of RPC
    const { data, error } = await supabase
      .from('priority_matches')
      .delete()
      .eq('founder_id', cleanFounderId)
      .eq('investor_id', cleanInvestorId);
    
    if (error) {
      console.error("Error deleting priority match:", error);
      toast.error(`Failed to remove match: ${error.message}`);
      return { error };
    }
    
    toast.success("Priority match removed");
    return { success: true, data };
  } catch (error) {
    console.error("Exception in deletePriorityMatch:", error);
    toast.error("An unexpected error occurred");
    return { error };
  }
}
