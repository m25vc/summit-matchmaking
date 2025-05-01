
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
  // Helper function to sanitize data before sending to Supabase
  const sanitizeData = (data: any): any => {
    // Convert to string and back to remove all problematic characters
    try {
      // First convert to a basic string without any special formatting
      const stringified = JSON.stringify(data);
      
      // Replace all control characters that could cause issues
      const cleaned = stringified.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
      
      // Parse it back to an object
      return JSON.parse(cleaned);
    } catch (e) {
      console.error("Error sanitizing data:", e);
      // If there's an error in sanitization, return a simple copy of the object
      return {...data};
    }
  };

  const handlePriorityChange = async (
    userId: string, 
    priority: 'high' | 'medium' | 'low' | null, 
    notInterested = false
  ) => {
    if (!profile) {
      toast.error("Profile not loaded");
      return;
    }

    if (notInterested) {
      try {
        const matchData = {
          founder_id: profile.user_type === 'founder' ? profile.id : userId,
          investor_id: profile.user_type === 'founder' ? userId : profile.id,
          priority: null,
          not_interested: true,
          set_by: profile.id
        };

        // Sanitize data before sending to Supabase
        const sanitizedData = sanitizeData(matchData);

        const { error } = await supabase
          .from('priority_matches')
          .upsert(sanitizedData, {
            onConflict: 'founder_id,investor_id'
          });

        if (error) {
          console.error('Upsert error:', error);
          throw error;
        }

        setUsers((prevUsers: UserWithDetails[]) => 
          prevUsers.map(user => {
            if (user.id === userId) {
              const wasHighPriority = user.priority_matches?.[0]?.priority === 'high';
              
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
          })
        );

        const userWithHighPriority = users.find(u => 
          u.id === userId && u.priority_matches?.[0]?.priority === 'high'
        );
        
        if (userWithHighPriority) {
          setHighPriorityCount((prev: number) => prev - 1);
        }

        toast.success("Match marked as not interested");
      } catch (error) {
        console.error('Error marking match as not interested:', error);
        toast.error("Failed to mark match as not interested");
      }
      return;
    }

    if (priority === 'high' && highPriorityCount >= 5 && !users.find(u => 
      u.id === userId && u.priority_matches?.[0]?.priority === 'high'
    )) {
      toast.error("You can only have up to 5 high priority matches");
      return;
    }

    try {
      if (priority === null) {
        // Delete the priority match
        const { error } = await supabase
          .from('priority_matches')
          .delete()
          .eq('founder_id', profile.user_type === 'founder' ? profile.id : userId)
          .eq('investor_id', profile.user_type === 'founder' ? userId : profile.id);

        if (error) throw error;

        setUsers((prevUsers: UserWithDetails[]) => 
          prevUsers.map(user => {
            if (user.id === userId) {
              const wasHighPriority = user.priority_matches?.[0]?.priority === 'high';
              if (wasHighPriority) {
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
        return;
      }

      // Create the match data object
      const matchData = {
        founder_id: profile.user_type === 'founder' ? profile.id : userId,
        investor_id: profile.user_type === 'founder' ? userId : profile.id,
        priority,
        set_by: profile.id,
        not_interested: false
      };

      // Sanitize data before sending to Supabase
      const sanitizedData = sanitizeData(matchData);
      
      console.log('Upserting match data:', sanitizedData);

      const { error } = await supabase
        .from('priority_matches')
        .upsert(sanitizedData, {
          onConflict: 'founder_id,investor_id'
        });

      if (error) {
        console.error('Upsert error:', error);
        throw error;
      }

      setUsers((prevUsers: UserWithDetails[]) => 
        prevUsers.map(user => {
          if (user.id === userId) {
            return {
              ...user,
              priority_matches: [{
                ...matchData,
                id: user.priority_matches?.[0]?.id || crypto.randomUUID(),
                created_at: user.priority_matches?.[0]?.created_at || new Date().toISOString()
              }]
            };
          }
          return user;
        })
      );

      if (priority === 'high') {
        setHighPriorityCount((prev: number) => {
          const userHadHighPriority = users.find(u => 
            u.id === userId && u.priority_matches?.[0]?.priority === 'high'
          );
          return userHadHighPriority ? prev : prev + 1;
        });
      } else {
        setHighPriorityCount((prev: number) => {
          const userHadHighPriority = users.find(u => 
            u.id === userId && u.priority_matches?.[0]?.priority === 'high'
          );
          return userHadHighPriority ? prev - 1 : prev;
        });
      }

      toast.success("Priority updated successfully");
    } catch (error) {
      console.error('Error updating priority:', error);
      toast.error("Failed to update priority");
    }
  };

  return { handlePriorityChange };
};
