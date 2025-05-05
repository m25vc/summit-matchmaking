
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import type { Database } from '@/integrations/supabase/types';
import type { UserWithDetails } from '@/types/dashboard';
import { sanitizeJson, deepSanitizeJson } from '@/lib/utils';

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
    console.log('Current profile:', profile);
    console.log('Current highPriorityCount:', highPriorityCount);
    
    if (!profile) {
      console.error('No profile available, aborting');
      toast.error("Profile not loaded");
      return;
    }

    if (notInterested) {
      console.log('Processing "not interested" case');
      try {
        // Create initial data object
        const matchData = {
          founder_id: profile.user_type === 'founder' ? profile.id : userId,
          investor_id: profile.user_type === 'founder' ? userId : profile.id,
          priority: null,
          not_interested: true,
          set_by: profile.id
        };
        
        // Properly sanitize the data using our improved function
        const sanitizedData = deepSanitizeJson(matchData);
        
        console.log('About to send upsert request to Supabase');
        
        const { error, data } = await supabase
          .from('priority_matches')
          .upsert(sanitizedData, {
            onConflict: 'founder_id,investor_id'
          });

        console.log('Supabase response:', { error, data });

        if (error) {
          console.error('Upsert error details:', error);
          throw error;
        }

        console.log('Update successful, now updating local state');

        setUsers((prevUsers: UserWithDetails[]) => {
          console.log('Updating users state');
          return prevUsers.map(user => {
            if (user.id === userId) {
              const wasHighPriority = user.priority_matches?.[0]?.priority === 'high';
              console.log(`User ${userId} wasHighPriority:`, wasHighPriority);
              
              return {
                ...user,
                priority_matches: [{
                  ...user.priority_matches?.[0],
                  id: user.priority_matches?.[0]?.id || crypto.randomUUID(),
                  created_at: user.priority_matches?.[0]?.created_at || new Date().toISOString(),
                  founder_id: profile.user_type === 'founder' ? profile.id : userId,
                  investor_id: profile.user_type === 'founder' ? userId : profile.id,
                  set_by: profile.id,
                  priority: null,
                  not_interested: true
                }]
              };
            }
            return user;
          });
        });

        const userWithHighPriority = users.find(u => 
          u.id === userId && u.priority_matches?.[0]?.priority === 'high'
        );
        
        console.log(`userWithHighPriority check:`, !!userWithHighPriority);
        
        if (userWithHighPriority) {
          console.log('Decrementing high priority count');
          setHighPriorityCount((prev: number) => prev - 1);
        }

        toast.success("Match marked as not interested");
      } catch (error) {
        console.error('Error marking match as not interested:', error);
        toast.error("Failed to mark match as not interested");
      }
      console.log('------- PRIORITY CHANGE END -------');
      return;
    }

    if (priority === 'high' && highPriorityCount >= 5 && !users.find(u => 
      u.id === userId && u.priority_matches?.[0]?.priority === 'high'
    )) {
      console.log('High priority limit reached');
      toast.error("You can only have up to 5 high priority matches");
      console.log('------- PRIORITY CHANGE END - LIMIT REACHED -------');
      return;
    }

    try {
      if (priority === null) {
        console.log('Removing priority match');
        // Delete the priority match
        const { error, data } = await supabase
          .from('priority_matches')
          .delete()
          .eq('founder_id', profile.user_type === 'founder' ? profile.id : userId)
          .eq('investor_id', profile.user_type === 'founder' ? userId : profile.id);

        console.log('Delete response:', { error, data });

        if (error) throw error;

        setUsers((prevUsers: UserWithDetails[]) => 
          prevUsers.map(user => {
            if (user.id === userId) {
              const wasHighPriority = user.priority_matches?.[0]?.priority === 'high';
              console.log(`Removing: User ${userId} wasHighPriority:`, wasHighPriority);
              
              if (wasHighPriority) {
                console.log('Decrementing high priority count');
                setHighPriorityCount((prev: number) => prev - 1);
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

      // Create initial data object
      const matchData = {
        founder_id: profile.user_type === 'founder' ? profile.id : userId,
        investor_id: profile.user_type === 'founder' ? userId : profile.id,
        priority,
        set_by: profile.id,
        not_interested: false
      };
      
      // Properly sanitize with our improved function
      const sanitizedData = deepSanitizeJson(matchData);
      
      console.log('PRIORITY UPDATE - Sanitized data:', sanitizedData);
      console.log('PRIORITY UPDATE - matchData founder_id:', sanitizedData.founder_id);
      console.log('PRIORITY UPDATE - matchData investor_id:', sanitizedData.investor_id);
      console.log('PRIORITY UPDATE - matchData priority:', sanitizedData.priority);
      console.log('PRIORITY UPDATE - matchData set_by:', sanitizedData.set_by);

      // Use the sanitized object
      console.log('About to send priority upsert to Supabase');
      const { error, data } = await supabase
        .from('priority_matches')
        .upsert(sanitizedData, {
          onConflict: 'founder_id,investor_id'
        });

      console.log('Supabase response:', { error, data });

      if (error) {
        console.error('Upsert error details:', error);
        throw error;
      }

      console.log('Priority update successful, updating local state');

      setUsers((prevUsers: UserWithDetails[]) => 
        prevUsers.map(user => {
          if (user.id === userId) {
            console.log(`Updating user ${userId} with new priority ${priority}`);
            return {
              ...user,
              priority_matches: [{
                ...sanitizedData,
                id: user.priority_matches?.[0]?.id || crypto.randomUUID(),
                created_at: user.priority_matches?.[0]?.created_at || new Date().toISOString()
              }]
            };
          }
          return user;
        })
      );

      if (priority === 'high') {
        console.log('Checking if high priority count needs to be updated');
        setHighPriorityCount((prev: number) => {
          const userHadHighPriority = users.find(u => 
            u.id === userId && u.priority_matches?.[0]?.priority === 'high'
          );
          console.log('userHadHighPriority:', !!userHadHighPriority);
          const newCount = userHadHighPriority ? prev : prev + 1;
          console.log(`High priority count: ${prev} -> ${newCount}`);
          return newCount;
        });
      } else {
        console.log('Checking if high priority count needs to be decremented');
        setHighPriorityCount((prev: number) => {
          const userHadHighPriority = users.find(u => 
            u.id === userId && u.priority_matches?.[0]?.priority === 'high'
          );
          console.log('userHadHighPriority:', !!userHadHighPriority);
          const newCount = userHadHighPriority ? prev - 1 : prev;
          console.log(`High priority count: ${prev} -> ${newCount}`);
          return newCount;
        });
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
