
import { toast } from "@/hooks/use-toast";
import type { Database } from '@/integrations/supabase/types';
import type { UserWithDetails } from '@/types/dashboard';
import { setPriorityMatch, setNotInterested, deletePriorityMatch } from '@/api/priorityMatchService';

type Profile = Database['public']['Tables']['profiles']['Row'];
type MatchPriority = Database['public']['Enums']['match_priority'];

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
   * Handle all priority changes with comprehensive debugging
   */
  const handlePriorityChange = async (
    userId: string, 
    priority: MatchPriority | null, 
    notInterested = false
  ) => {
    console.log('===== PRIORITY CHANGE DEBUGGING =====');
    console.log(`Call params - userId: ${userId}, priority: ${priority}, notInterested: ${notInterested}`);
    
    if (!profile) {
      console.error('No profile available, aborting');
      toast.error("Profile not loaded");
      return;
    }

    // Determine founder and investor IDs based on user types
    const founderId = profile.user_type === 'founder' ? profile.id : userId;
    const investorId = profile.user_type === 'founder' ? userId : profile.id;
    console.log(`Determined IDs - founderId: ${founderId}, investorId: ${investorId}`);

    try {
      // Handle "not interested" case
      if (notInterested) {
        console.log('🚫 Processing "not interested" case');
        
        const result = await setNotInterested(
          founderId,
          investorId,
          profile.id
        );
        
        if (result.error) {
          throw new Error(`Failed to mark as not interested: ${result.error}`);
        }

        // Update local state
        updateUserState(userId, null, true);
        toast.success("Match marked as not interested");
        return;
      }

      // Handle removing priority case
      if (priority === null) {
        console.log('🗑️ Removing priority match');
        
        const result = await deletePriorityMatch(
          founderId,
          investorId
        );
        
        if (result.error) {
          throw new Error(`Failed to remove match: ${result.error}`);
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
          console.log('⚠️ High priority limit reached');
          toast.error("You can only have up to 5 high priority matches");
          return;
        }
      }

      console.log('✏️ Setting priority match to:', priority);
      
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

      // Update local state
      updateUserState(userId, priority, false);
      toast.success("Priority updated successfully");
      
    } catch (error) {
      console.error('❌ Error updating priority:', error);
      toast.error(error instanceof Error ? error.message : "Failed to update priority");
    }
  };

  /**
   * Helper function to update local state after API calls
   */
  const updateUserState = (userId: string, priority: MatchPriority | null, notInterested: boolean) => {
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
              priority: priority || 'low', // Default to 'low' if null
              not_interested: notInterested
            }]
          };
          
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
  const updateHighPriorityCount = (userId: string, newPriority: MatchPriority | null) => {
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
      
      return newCount;
    });
  };

  return { handlePriorityChange };
};
