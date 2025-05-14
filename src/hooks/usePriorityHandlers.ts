
import { toast } from "@/hooks/use-toast";
import type { Database } from '@/integrations/supabase/types';
import type { UserWithDetails } from '@/types/dashboard';
import { setPriorityMatch, setNotInterested, deletePriorityMatch } from '@/api/priorityMatchService';

type Profile = Database['public']['Tables']['profiles']['Row'];
type MatchPriority = Database['public']['Enums']['match_priority'] | null;

/**
 * Unified hook for handling priority match operations
 */
export const usePriorityHandlers = (
  profile: Profile | null,
  users: UserWithDetails[],
  highPriorityCount: number,
  setHighPriorityCount: (count: number | ((prev: number) => number)) => void,
  setUsers: (users: UserWithDetails[] | ((prev: UserWithDetails[]) => UserWithDetails[])) => void
) => {
  /**
   * Handle priority changes with optimistic updates and rollback
   */
  const handlePriorityChange = async (
    userId: string, 
    priority: MatchPriority, 
    notInterested = false
  ) => {
    console.log('Priority change initiated:', {
      userId,
      priority,
      notInterested,
      currentUser: profile?.id
    });
    
    if (!profile) {
      toast.error("Your profile is not loaded");
      return;
    }

    // Store original state for potential rollback
    const originalUsers = [...users];
    const originalHighPriorityCount = highPriorityCount;

    try {
      // Determine roles based on user types
      const founderId = profile.user_type === 'founder' ? profile.id : userId;
      const investorId = profile.user_type === 'founder' ? userId : profile.id;
      
      // Apply optimistic update to UI immediately
      updateUserState(userId, priority, notInterested);
      
      // Handle the not interested case
      if (notInterested) {
        const result = await setNotInterested(founderId, investorId, profile.id);
        
        if (result.error) {
          throw new Error(`Failed to mark as not interested: ${result.error}`);
        }
        
        return;
      }

      // Handle removing priority case (null priority)
      if (priority === null) {
        const result = await deletePriorityMatch(founderId, investorId);
        
        if (result.error) {
          throw new Error(`Failed to remove match: ${result.error}`);
        }
        
        return;
      }

      // Check high priority limit
      if (priority === 'high') {
        const isAlreadyHighPriority = originalUsers.some(u => 
          u.id === userId && u.priority_matches?.[0]?.priority === 'high'
        );
        
        if (!isAlreadyHighPriority && originalHighPriorityCount >= 5) {
          setUsers(originalUsers); // Revert optimistic update
          toast.error("You can only have up to 5 high priority matches");
          return;
        }
      }
      
      // Set priority match
      const result = await setPriorityMatch(
        founderId,
        investorId, 
        priority, 
        profile.id
      );
      
      if (result.error) {
        throw new Error(`Failed to set priority: ${result.error}`);
      }
      
    } catch (error) {
      console.error('Error updating priority:', error);
      
      // Rollback to original state on error
      setUsers(originalUsers);
      setHighPriorityCount(originalHighPriorityCount);
      
      toast.error(error instanceof Error ? error.message : "Failed to update priority");
    }
  };

  /**
   * Update local state with optimistic changes
   */
  const updateUserState = (userId: string, priority: MatchPriority, notInterested: boolean) => {
    // Update users state with optimistic changes
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
              investor_id: profile?.user_type === 'founder' ? userId : profile?.id,
              set_by: profile?.id || '',
              priority: priority || 'low', // Default to 'low' if null
              not_interested: notInterested
            }]
          };
          
          return updatedUser;
        }
        return user;
      });
    });

    // Update high priority count
    updateHighPriorityCount(userId, priority);
  };

  /**
   * Update high priority count based on changes
   */
  const updateHighPriorityCount = (userId: string, newPriority: MatchPriority) => {
    setHighPriorityCount(prev => {
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
      
      return newCount;
    });
  };

  return { handlePriorityChange };
};
