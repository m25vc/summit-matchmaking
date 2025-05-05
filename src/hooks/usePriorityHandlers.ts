import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import type { Database } from '@/integrations/supabase/types';
import type { UserWithDetails } from '@/types/dashboard';

type Profile = Database['public']['Tables']['profiles']['Row'];

export const usePriorityHandlers = (
  profile: Profile | null,
  users: UserWithDetails[],
  highPriorityCount: number,
  setHighPriorityCount: (count: number | ((prev: number) => number)) => void,
  setUsers: (users: UserWithDetails[] | ((prev: UserWithDetails[]) => UserWithDetails[])) => void
) => {
  const handlePriorityChange = async (
    userId: string, 
    priority: 'high' | 'medium' | 'low' | null, 
    notInterested = false
  ) => {
    console.log('------- PRIORITY CHANGE START -------');
    console.log('handlePriorityChange called with:', { userId, priority, notInterested });
    
    if (!profile) {
      toast.error("Profile not loaded");
      return;
    }

    // Check high priority limit
    if (priority === 'high' && highPriorityCount >= 5 && !users.find(u => 
      u.id === userId && u.priority_matches?.[0]?.priority === 'high'
    )) {
      toast.error("You can only have up to 5 high priority matches");
      return;
    }

    try {
      // Determine founder_id and investor_id directly
      const founderId = profile.user_type === 'founder' ? profile.id : userId;
      const investorId = profile.user_type === 'founder' ? userId : profile.id;
      
      // For delete operation
      if (priority === null && !notInterested) {
        const { error } = await supabase
          .from('priority_matches')
          .delete()
          .eq('founder_id', founderId)
          .eq('investor_id', investorId);

        if (error) throw error;
        
        // Update UI state
        setUsers((prevUsers) => 
          prevUsers.map(user => {
            if (user.id === userId) {
              const wasHighPriority = user.priority_matches?.[0]?.priority === 'high';
              if (wasHighPriority) {
                setHighPriorityCount((prev) => prev - 1);
              }
              return { ...user, priority_matches: [] };
            }
            return user;
          })
        );

        toast.success("Priority match removed");
        return;
      }
     
      // Prepare base parameters - VERY MINIMAL!
      const baseParams = {
        founder_id: founderId,
        investor_id: investorId,
        set_by: profile.id
      };
      
      // Add additional parameters based on the action
      let params;
      
      if (notInterested) {
        params = {
          ...baseParams,
          priority: null,
          not_interested: true
        };
      } else {
        params = {
          ...baseParams,
          priority: priority,
          not_interested: false
        };
      }
      
      // IMPORTANT: Insert directly with parameters, avoiding any complex objects
      const { error } = await supabase
        .from('priority_matches')
        .upsert({
          founder_id: params.founder_id,
          investor_id: params.investor_id,
          priority: params.priority,
          not_interested: params.not_interested,
          set_by: params.set_by
        }, {
          onConflict: 'founder_id,investor_id'
        });

      if (error) throw error;
      
      // Update UI state
      setUsers((prevUsers) => 
        prevUsers.map(user => {
          if (user.id === userId) {
            return {
              ...user,
              priority_matches: [{
                id: user.priority_matches?.[0]?.id || crypto.randomUUID(),
                created_at: user.priority_matches?.[0]?.created_at || new Date().toISOString(),
                founder_id: params.founder_id,
                investor_id: params.investor_id,
                set_by: params.set_by,
                priority: params.priority,
                not_interested: params.not_interested
              }]
            };
          }
          return user;
        })
      );

      // Update high priority count
      if (priority === 'high') {
        const userHadHighPriority = users.find(u => 
          u.id === userId && u.priority_matches?.[0]?.priority === 'high'
        );
        if (!userHadHighPriority) {
          setHighPriorityCount((prev) => prev + 1);
        }
      } else if (!notInterested) {
        const userHadHighPriority = users.find(u => 
          u.id === userId && u.priority_matches?.[0]?.priority === 'high'
        );
        if (userHadHighPriority) {
          setHighPriorityCount((prev) => prev - 1);
        }
      }

      toast.success(notInterested 
        ? "Match marked as not interested" 
        : "Priority updated successfully");
      
    } catch (error) {
      console.error('Error updating priority:', error);
      toast.error("Failed to update priority");
    }
  };

  return { handlePriorityChange };
};