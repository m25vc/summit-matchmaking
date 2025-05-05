
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

  // Ensure users are properly set when initialUsers change
  useEffect(() => {
    if (initialUsers && initialUsers.length > 0) {
      console.log("Setting users in usePriorityMatches", initialUsers.length);
      setUsers(initialUsers);
    }
  }, [initialUsers]);

  /**
   * Update a user's priority match status with improved error handling
   */
  const updatePriorityMatch = async (
    userId: string, 
    priority: MatchPriority, 
    notInterested = false
  ) => {
    console.log(`updatePriorityMatch - START - userId=${userId}, priority=${priority}, notInterested=${notInterested}`);
    
    if (!profile) {
      console.error("updatePriorityMatch - ERROR - Profile not loaded");
      toast.error("Profile not loaded");
      return;
    }

    console.log(`Updating match: userId=${userId}, priority=${priority}, notInterested=${notInterested}`);
    console.log(`Current profile: ${profile.user_type}, id=${profile.id}`);

    try {
      // Determine founder and investor IDs based on user types
      let founderId = '';
      let investorId = '';
      
      if (profile.user_type === 'founder') {
        founderId = profile.id;
        investorId = userId;
      } else {
        founderId = userId;
        investorId = profile.id;
      }
      
      console.log(`founderId=${founderId}, investorId=${investorId}`);
      
      // Handle "not interested" case
      if (notInterested) {
        console.log("updatePriorityMatch - Processing NOT INTERESTED case");
        const result = await setNotInterested(founderId, investorId, profile.id);
        
        console.log("updatePriorityMatch - setNotInterested result:", result);
        
        if (result.error) {
          console.error('Error from setNotInterested:', result.error);
          throw result.error;
        }
        
        // Update local state with 'low' priority (not null) and not_interested=true
        updateUserState(userId, 'low', true);
        toast.success("Match marked as not interested");
        return;
      }

      // Handle removing priority case - use 'low' instead of null due to NOT NULL constraint
      if (priority === null) {
        console.log("updatePriorityMatch - Processing REMOVE PRIORITY case");
        const result = await deletePriorityMatch(founderId, investorId);
        
        console.log("updatePriorityMatch - deletePriorityMatch result:", result);
        
        if (result.error) {
          console.error('Error from deletePriorityMatch:', result.error);
          throw result.error;
        }
        
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
          console.warn("updatePriorityMatch - WARNING - High priority limit reached");
          toast.error("You can only have up to 5 high priority matches");
          return;
        }
      }

      // Set priority match
      console.log(`Setting priority: founderId=${founderId}, investorId=${investorId}, priority=${priority}`);
      const result = await setPriorityMatch(founderId, investorId, priority, profile.id);
      
      console.log("updatePriorityMatch - setPriorityMatch result:", result);
      
      if (result.error) {
        console.error('Error from setPriorityMatch:', result.error);
        throw result.error;
      }
      
      // Update local state
      updateUserState(userId, priority, false);
      toast.success("Priority updated successfully");
      console.log("updatePriorityMatch - COMPLETED SUCCESSFULLY");
      
    } catch (error) {
      console.error('Error updating priority:', error);
      console.error('Error stack:', error.stack);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      toast.error(`Failed to update priority: ${error.message || 'Unknown error'}`);
    }
  };

  /**
   * Helper function to update local state after API calls
   */
  const updateUserState = (userId: string, priority: MatchPriority, notInterested: boolean) => {
    console.log(`updateUserState - user=${userId}, priority=${priority}, notInterested=${notInterested}`);
    
    // Update users state
    setUsers(prevUsers => {
      return prevUsers.map(user => {
        if (user.id === userId) {
          const wasHighPriority = user.priority_matches?.[0]?.priority === 'high';
          
          // For "remove match" case with null priority - we'll leave priority_matches empty
          // For "not interested" case, we'll use 'low' priority with not_interested=true
          const updatedUser = {
            ...user,
            priority_matches: priority === null && !notInterested ? [] : [{
              id: user.priority_matches?.[0]?.id || crypto.randomUUID(),
              created_at: user.priority_matches?.[0]?.created_at || new Date().toISOString(),
              founder_id: profile?.user_type === 'founder' ? profile.id : userId,
              investor_id: profile?.user_type === 'founder' ? userId : profile.id,
              set_by: profile?.id || '',
              priority: priority || 'low', // Default to 'low' if null due to NOT NULL constraint
              not_interested: notInterested
            }]
          };
          
          console.log(`updateUserState - Updated user:`, {
            before: { 
              id: user.id, 
              priority: user.priority_matches?.[0]?.priority,
              notInterested: user.priority_matches?.[0]?.not_interested
            },
            after: {
              id: updatedUser.id,
              priority: updatedUser.priority_matches?.[0]?.priority,
              notInterested: updatedUser.priority_matches?.[0]?.not_interested
            }
          });
          
          return updatedUser;
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
      
      let newCount = prev;
      
      // If setting to high and wasn't high before, increment
      if (newPriority === 'high' && !userHadHighPriority) {
        newCount = prev + 1;
      }
      // If was high before but now isn't, decrement
      else if (newPriority !== 'high' && userHadHighPriority) {
        newCount = prev - 1;
      }
      
      console.log(`updateHighPriorityCount - userId=${userId}, newPriority=${newPriority}, previous=${prev}, new=${newCount}`);
      return newCount;
    });
  };

  return {
    users,
    highPriorityCount,
    updatePriorityMatch
  };
}
