
import { useState, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";
import type { Database } from '@/integrations/supabase/types';
import type { UserWithDetails } from '@/types/dashboard';
import { usePriorityHandlers } from './usePriorityHandlers';

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
   * Wrapper function to pass through to usePriorityHandlers
   */
  const updatePriorityMatch = async (
    userId: string, 
    priority: MatchPriority, 
    notInterested = false
  ) => {
    // Log auth status at time of call
    const isLoggedIn = !!(await supabase.auth.getSession()).data.session;
    console.log(`updatePriorityMatch called - Auth status: ${isLoggedIn ? 'LOGGED IN' : 'NOT LOGGED IN'}`);
    
    // Call through to handler
    return handlePriorityChange(userId, priority, notInterested);
  };

  return {
    users,
    highPriorityCount,
    updatePriorityMatch
  };
}

// This ensures we have access to supabase
import { supabase } from '@/integrations/supabase/client';
