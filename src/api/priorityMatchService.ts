
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { toast } from "@/hooks/use-toast";

type MatchPriority = Database['public']['Enums']['match_priority'] | null;

/**
 * Sets a priority match between a founder and investor using a 
 * direct fetch approach with minimal serialization complexity
 */
export async function setPriorityMatch(
  founderId: string,
  investorId: string,
  priority: MatchPriority,
  setBy: string
) {
  try {
    console.log("setPriorityMatch called with:", { founderId, investorId, priority, setBy });
    
    // Sanitize the priority to remove any control characters
    const sanitizedPriority = priority ? String(priority).replace(/[\x00-\x1F\x7F-\x9F]/g, "") : null;
    
    // Use direct fetch for better control over the request
    const response = await fetch('https://qveetrrarbqedkcuwrcz.supabase.co/rest/v1/rpc/set_priority_match', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2ZWV0cnJhcmJxZWRrY3V3cmN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkzMjExMDMsImV4cCI6MjA1NDg5NzEwM30.NTciPlMER1I9D5os0pLEca-Nbq_ri6ykM7ekYYfkza8',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2ZWV0cnJhcmJxZWRrY3V3cmN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkzMjExMDMsImV4cCI6MjA1NDg5NzEwM30.NTciPlMER1I9D5os0pLEca-Nbq_ri6ykM7ekYYfkza8`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        p_founder_id: founderId,
        p_investor_id: investorId,
        p_priority: sanitizedPriority,
        p_set_by: setBy
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`RPC call failed with status ${response.status}:`, errorText);
      throw new Error(`RPC call failed: ${response.statusText} - ${errorText}`);
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error in setPriorityMatch:", error);
    toast.error("Failed to set priority match");
    throw error;
  }
}

/**
 * Marks a match as "not interested" using direct fetch
 */
export async function setNotInterested(
  founderId: string,
  investorId: string,
  setBy: string
) {
  try {
    console.log("setNotInterested called with:", { founderId, investorId, setBy });
    
    const response = await fetch('https://qveetrrarbqedkcuwrcz.supabase.co/rest/v1/rpc/set_not_interested', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2ZWV0cnJhcmJxZWRrY3V3cmN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkzMjExMDMsImV4cCI6MjA1NDg5NzEwM30.NTciPlMER1I9D5os0pLEca-Nbq_ri6ykM7ekYYfkza8',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2ZWV0cnJhcmJxZWRrY3V3cmN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkzMjExMDMsImV4cCI6MjA1NDg5NzEwM30.NTciPlMER1I9D5os0pLEca-Nbq_ri6ykM7ekYYfkza8`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        p_founder_id: founderId,
        p_investor_id: investorId,
        p_set_by: setBy
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`RPC call failed with status ${response.status}:`, errorText);
      throw new Error(`RPC call failed: ${response.statusText} - ${errorText}`);
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error in setNotInterested:", error);
    toast.error("Failed to mark as not interested");
    throw error;
  }
}

/**
 * Removes a priority match using direct fetch
 */
export async function deletePriorityMatch(
  founderId: string,
  investorId: string
) {
  try {
    console.log("deletePriorityMatch called with:", { founderId, investorId });
    
    const response = await fetch('https://qveetrrarbqedkcuwrcz.supabase.co/rest/v1/rpc/delete_priority_match', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2ZWV0cnJhcmJxZWRrY3V3cmN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkzMjExMDMsImV4cCI6MjA1NDg5NzEwM30.NTciPlMER1I9D5os0pLEca-Nbq_ri6ykM7ekYYfkza8',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2ZWV0cnJhcmJxZWRrY3V3cmN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkzMjExMDMsImV4cCI6MjA1NDg5NzEwM30.NTciPlMER1I9D5os0pLEca-Nbq_ri6ykM7ekYYfkza8`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        p_founder_id: founderId,
        p_investor_id: investorId
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`RPC call failed with status ${response.status}:`, errorText);
      throw new Error(`RPC call failed: ${response.statusText} - ${errorText}`);
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error in deletePriorityMatch:", error);
    toast.error("Failed to delete priority match");
    throw error;
  }
}
