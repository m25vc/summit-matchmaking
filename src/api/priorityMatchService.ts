
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { safeJsonStringify } from '@/lib/utils';

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
 * Secure direct fetch to RPC endpoint with enhanced error handling
 * This provides more control over the JSON serialization
 */
async function callRpcEndpoint(
  functionName: string, 
  params: Record<string, any>
): Promise<any> {
  try {
    // Get the Supabase URL and key from environment
    // Instead of accessing protected properties, use constants from client.ts
    const supabaseUrl = "https://qveetrrarbqedkcuwrcz.supabase.co";
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2ZWV0cnJhcmJxZWRrY3V3cmN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkzMjExMDMsImV4cCI6MjA1NDg5NzEwM30.NTciPlMER1I9D5os0pLEca-Nbq_ri6ykM7ekYYfkza8";
    
    // Sanitize parameters more aggressively
    const sanitizedParams = sanitizeRpcParams(params);
    
    // Convert parameters to a sanitized JSON string
    // Use our custom safe stringify to avoid issues with special characters
    const safeJsonParams = safeJsonStringify(sanitizedParams);
    
    console.log(`Calling RPC ${functionName} with params:`, safeJsonParams);
    
    // Make a direct fetch call with controlled JSON conversion
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/${functionName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=minimal'
      },
      body: safeJsonParams
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`RPC call failed with status ${response.status}:`, errorText);
      throw new Error(`RPC call failed: ${response.statusText} - ${errorText}`);
    }
    
    // For minimal responses, return success status
    if (response.status === 204) {
      return { success: true };
    }
    
    // Parse response with safety checks
    try {
      const data = await response.json();
      return { data };
    } catch (parseError) {
      console.error('Failed to parse response:', parseError);
      return { success: true }; // Assume success since the request didn't fail
    }
  } catch (error) {
    console.error(`Error in RPC call to ${functionName}:`, error);
    throw error;
  }
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
    // Validate and sanitize priority value
    let safePriority: MatchPriority = null;
    if (typeof priority === 'string') {
      // Clean up the priority string
      const cleanPriority = priority.replace(/\n/g, '').replace(/\r/g, '').trim();
      
      // Only assign if it's a valid match priority type
      if (cleanPriority === 'high' || cleanPriority === 'medium' || cleanPriority === 'low') {
        safePriority = cleanPriority as MatchPriority;
      } else {
        console.warn(`Invalid priority value: "${priority}" → defaulting to null`);
      }
    } else {
      safePriority = priority;
    }
    
    console.log(`Using sanitized priority: ${safePriority}`);
    
    // Use direct fetch for more control over the request
    return await callRpcEndpoint('set_priority_match', {
      p_founder_id: founderId,
      p_investor_id: investorId,
      p_priority: safePriority,
      p_set_by: setBy
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
    console.log("setNotInterested called with:", {
      founderId,
      investorId,
      setBy
    });
    
    // Use direct fetch for more control
    return await callRpcEndpoint('set_not_interested', {
      p_founder_id: founderId,
      p_investor_id: investorId,
      p_set_by: setBy
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
    console.log("deletePriorityMatch called with:", {
      founderId,
      investorId
    });
    
    // Use direct fetch for more control
    return await callRpcEndpoint('delete_priority_match', {
      p_founder_id: founderId,
      p_investor_id: investorId
    });
  } catch (error) {
    console.error("Error in deletePriorityMatch:", error);
    throw error;
  }
}
