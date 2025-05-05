
import { useState, useEffect } from 'react';
import { toast } from "sonner";
import { setPriorityMatch, setNotInterested, deletePriorityMatch } from '@/api/priorityMatchService';
import type { Database } from '@/integrations/supabase/types';
import type { UserWithDetails } from '@/hooks/useDashboardData';

type Profile = Database['public']['Tables']['profiles']['Row'];
type MatchPriority = Database['public']['Enums']['match_priority'] | null;

export function usePriorityMatches(
  profile: Profile | null,
  initialUsers: UserWithDetails[],
  initialHighPriorityCount: number
) {
  const [users, setUsers] = useState<UserWithDetails[]>([]);
  const [highPriorityCount, setHighPriorityCount] = useState<number>(initialHighPriorityCount);

  // Make sure users are properly set when initialUsers change
  useEffect(() => {
    if (initialUsers && initialUsers.length > 0) {
      console.log("Setting users in usePriorityMatches", initialUsers.length);
      setUsers(initialUsers);
    }
  }, [initialUsers]);

  /**
   * Update a user's priority match status
   */
  const updatePriorityMatch = async (
    userId: string, 
    priority: MatchPriority, 
    notInterested = false
  ) => {
    if (!profile) {
      toast.error("Profile not loaded");
      return;
    }

    console.log(`Updating match: userId=${userId}, priority=${priority}, notInterested=${notInterested}`);
    console.log(`Current profile: ${profile.user_type}, id=${profile.id}`);

    // Determine founder and investor IDs based on user types
    const founderId = profile.user_type === 'founder' ? profile.id : userId;
    const investorId = profile.user_type === 'founder' ? userId : profile.id;
    
    console.log(`founderId=${founderId}, investorId=${investorId}`);
    
    try {
      // Handle "not interested" case
      if (notInterested) {
        const { error } = await setNotInterested(founderId, investorId, profile.id);
        if (error) throw error;
        
        // Update local state
        updateUserState(userId, null, true);
        toast.success("Match marked as not interested");
        return;
      }

      // Handle removing priority case
      if (priority === null) {
        const { error } = await deletePriorityMatch(founderId, investorId);
        if (error) throw error;
        
        // Update local state
        updateUserState(userId, null, false);
        toast.success("Priority match removed");
        return;
      }

      // Check if setting high priority would exceed limit
      if (priority === 'high') {
        const isAlreadyHighPriority = users.some(u => 
          u.id === userId && u.priority_matches?.[0]?.priority === 'high'
        );
        
        if (!isAlreadyHighPriority && highPriorityCount >= 5) {
          toast.error("You can only have up to 5 high priority matches");
          return;
        }
      }

      // Set priority match
      console.log(`Setting priority: founderId=${founderId}, investorId=${investorId}, priority=${priority}`);
      const { error } = await setPriorityMatch(founderId, investorId, priority, profile.id);
      if (error) {
        console.error('Error from setPriorityMatch:', error);
        throw error;
      }
      
      // Update local state
      updateUserState(userId, priority, false);
      toast.success("Priority updated successfully");
      
    } catch (error) {
      console.error('Error updating priority:', error);
      toast.error("Failed to update priority");
    }
  };

  /**
   * Helper function to update local state after API calls
   */
  const updateUserState = (userId: string, priority: MatchPriority, notInterested: boolean) => {
    // Update users state
    setUsers(prevUsers => {
      return prevUsers.map(user => {
        if (user.id === userId) {
          const wasHighPriority = user.priority_matches?.[0]?.priority === 'high';
          
          // Create updated user with new priority match data
          return {
            ...user,
            priority_matches: priority === null && !notInterested ? [] : [{
              id: user.priority_matches?.[0]?.id || crypto.randomUUID(),
              created_at: user.priority_matches?.[0]?.created_at || new Date().toISOString(),
              founder_id: profile?.user_type === 'founder' ? profile.id : userId,
              investor_id: profile?.user_type === 'founder' ? userId : profile.id,
              set_by: profile?.id || '',
              priority: priority,
              not_interested: notInterested
            }]
          };
        }
        return user;
      });
    });

    // Update high priority count based on state changes
    updateHighPriorityCount(userId, priority);
  };

  /**
   * Helper function to update high priority count
   */
  const updateHighPriorityCount = (userId: string, newPriority: MatchPriority) => {
    setHighPriorityCount(prev => {
      // Check if user previously had high priority
      const userHadHighPriority = users.some(u => 
        u.id === userId && u.priority_matches?.[0]?.priority === 'high'
      );
      
      // If setting to high and wasn't high before, increment
      if (newPriority === 'high' && !userHadHighPriority) {
        return prev + 1;
      }
      // If was high before but now isn't, decrement
      else if (newPriority !== 'high' && userHadHighPriority) {
        return prev - 1;
      }
      
      return prev;
    });
  };

  return {
    users,
    highPriorityCount,
    updatePriorityMatch
  };
}
