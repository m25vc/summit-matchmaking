
import { useState, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";
import type { Database } from '@/integrations/supabase/types';
import type { UserWithDetails } from '@/types/dashboard';
import { usePriorityHandlers } from './usePriorityHandlers';
import { sanitizeJson, validateEnum } from '@/lib/utils';

type Profile = Database['public']['Tables']['profiles']['Row'];
type MatchPriority = Database['public']['Enums']['match_priority'] | null;

export function usePriorityMatches(
  profile: Profile | null,
  initialUsers: UserWithDetails[],
  initialHighPriorityCount: number
) {
  const [users, setUsers] = useState<UserWithDetails[]>([]);
  const [highPriorityCount, setHighPriorityCount] = useState<number>(initialHighPriorityCount);

  // Ensure users are properly set when initialUsers change
  useEffect(() => {
    if (initialUsers && initialUsers.length > 0) {
      console.log("Setting users in usePriorityMatches", initialUsers.length);
      setUsers(initialUsers);
    }
  }, [initialUsers]);

  // Set up priority handlers using the unified hook
  const { handlePriorityChange } = usePriorityHandlers(
    profile,
    users,
    highPriorityCount,
    setHighPriorityCount,
    setUsers
  );

  /**
   * Wrapper function to handle priority updates with authentication validation
   */
  const updatePriorityMatch = async (
    userId: string, 
    priority: MatchPriority, 
    notInterested = false
  ) => {
    // Check authentication status first
    const { data } = await supabase.auth.getSession();
    const isLoggedIn = !!data.session;
    
    console.log(`updatePriorityMatch called - Auth status: ${isLoggedIn ? 'LOGGED IN' : 'NOT LOGGED IN'}`);
    
    if (!isLoggedIn) {
      toast.error("Please login to update priorities");
      return;
    }
    
    // Validate and sanitize priority value before passing to handler
    // This ensures we're only sending valid enum values to the database
    const sanitizedPriority = priority ? validateEnum(
      priority, 
      ['high', 'medium', 'low']
    ) : null;
    
    console.log(`Priority value: original=${priority}, sanitized=${sanitizedPriority}`);
    
    // Call the handler with validated data
    return handlePriorityChange(userId, sanitizedPriority, notInterested);
  };

  return {
    users,
    highPriorityCount,
    updatePriorityMatch
  };
}

// Ensure Supabase client is available
import { supabase } from '@/integrations/supabase/client';
