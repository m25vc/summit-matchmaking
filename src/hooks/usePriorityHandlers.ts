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
  // Completely rewritten function to bypass JSON issues
  const handlePriorityChange = async (
    userId: string, 
    priority: 'high' | 'medium' | 'low' | null, 
    notInterested = false
  ) => {
    console.log('------- PRIORITY CHANGE START -------');
    console.log('handlePriorityChange called with:', { userId, priority, notInterested });
    console.log('Current profile:', profile);
    console.log('Current highPriorityCount:', highPriorityCount);
    
    if (!profile) {
      console.error('No profile available, aborting');
      toast.error("Profile not loaded");
      return;
    }

    // Check high priority limit
    if (priority === 'high' && highPriorityCount >= 5 && !users.find(u => 
      u.id === userId && u.priority_matches?.[0]?.priority === 'high'
    )) {
      console.log('High priority limit reached');
      toast.error("You can only have up to 5 high priority matches");
      console.log('------- PRIORITY CHANGE END - LIMIT REACHED -------');
      return;
    }

    try {
      // Determine founder_id and investor_id
      const founderId = profile.user_type === 'founder' ? profile.id : userId;
      const investorId = profile.user_type === 'founder' ? userId : profile.id;
      
      // For delete action (priority === null)
      if (priority === null) {
        console.log('Removing priority match');
        
        const { error } = await supabase.rpc('delete_priority_match', {
          p_founder_id: founderId,
          p_investor_id: investorId
        });

        if (error) throw error;
        
        // Update UI state
        setUsers((prevUsers) => 
          prevUsers.map(user => {
            if (user.id === userId) {
              const wasHighPriority = user.priority_matches?.[0]?.priority === 'high';
              if (wasHighPriority) {
                setHighPriorityCount((prev) => prev - 1);
              }
              return {
                ...user,
                priority_matches: []
              };
            }
            return user;
          })
        );

        toast.success("Priority match removed");
        console.log('------- PRIORITY CHANGE END - REMOVED -------');
        return;
      }
      
      // For "not interested" action
      if (notInterested) {
        console.log('Processing "not interested" case');
        
        const { error } = await supabase.rpc('set_not_interested', {
          p_founder_id: founderId,
          p_investor_id: investorId,
          p_set_by: profile.id
        });

        if (error) throw error;
        
        // Update UI state
        setUsers((prevUsers) => {
          return prevUsers.map(user => {
            if (user.id === userId) {
              const wasHighPriority = user.priority_matches?.[0]?.priority === 'high';
              if (wasHighPriority) {
                setHighPriorityCount((prev) => prev - 1);
              }
              
              return {
                ...user,
                priority_matches: [{
                  ...user.priority_matches?.[0],
                  id: user.priority_matches?.[0]?.id || crypto.randomUUID(),
                  created_at: user.priority_matches?.[0]?.created_at || new Date().toISOString(),
                  founder_id: founderId,
                  investor_id: investorId,
                  set_by: profile.id,
                  priority: null,
                  not_interested: true
                }]
              };
            }
            return user;
          });
        });

        toast.success("Match marked as not interested");
        console.log('------- PRIORITY CHANGE END - NOT INTERESTED -------');
        return;
      }
      
      // For priority update
      console.log('Setting priority:', priority);
      
      const { error } = await supabase.rpc('set_priority_match', {
        p_founder_id: founderId,
        p_investor_id: investorId,
        p_priority: priority,
        p_set_by: profile.id
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
                founder_id: founderId,
                investor_id: investorId,
                set_by: profile.id,
                priority: priority,
                not_interested: false
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
      } else {
        const userHadHighPriority = users.find(u => 
          u.id === userId && u.priority_matches?.[0]?.priority === 'high'
        );
        if (userHadHighPriority) {
          setHighPriorityCount((prev) => prev - 1);
        }
      }

      toast.success("Priority updated successfully");
      console.log('------- PRIORITY CHANGE END - SUCCESS -------');
    } catch (error) {
      console.error('Error updating priority:', error);
      console.log('------- PRIORITY CHANGE END - ERROR -------');
      toast.error("Failed to update priority");
    }
  };

  return { handlePriorityChange };
};