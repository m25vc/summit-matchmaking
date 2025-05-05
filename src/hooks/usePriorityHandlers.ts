
import { toast } from "sonner";
import type { Database } from '@/integrations/supabase/types';
import type { UserWithDetails } from '@/types/dashboard';
import { usePriorityMatchService } from './usePriorityMatchService';
import { sanitizeJson } from '@/lib/utils';

type Profile = Database['public']['Tables']['profiles']['Row'];
type MatchPriority = Database['public']['Enums']['match_priority'];

export const usePriorityHandlers = (
  profile: Profile | null,
  users: UserWithDetails[],
  highPriorityCount: number,
  setHighPriorityCount: (count: number | ((prev: number) => number)) => void,
  setUsers: (users: UserWithDetails[] | ((prev: UserWithDetails[]) => UserWithDetails[])) => void
) => {
  const { setPriorityMatch, setNotInterested, deletePriorityMatch } = usePriorityMatchService();

  const handlePriorityChange = async (
    userId: string, 
    priority: MatchPriority | null, 
    notInterested = false
  ) => {
    console.log('===== PRIORITY CHANGE DEBUGGING =====');
    console.log(`Call params - userId: ${userId}, priority: ${priority}, notInterested: ${notInterested}`);
    console.log(`Profile: ${JSON.stringify(profile, null, 2)}`);
    console.log(`Current highPriorityCount: ${highPriorityCount}`);
    
    if (!profile) {
      console.error('No profile available, aborting');
      toast.error("Profile not loaded");
      return;
    }

    if (notInterested) {
      console.log('🚫 Processing "not interested" case');
      try {
        const founderID = profile.user_type === 'founder' ? profile.id : userId;
        const investorID = profile.user_type === 'founder' ? userId : profile.id;
        
        console.log(`SQL function params: founderID=${founderID}, investorID=${investorID}, setBy=${profile.id}`);
        
        const result = await setNotInterested(
          sanitizeJson(founderID),
          sanitizeJson(investorID),
          sanitizeJson(profile.id)
        );
        
        if (result.error) {
          console.error('⚠️ SQL function error:', result.error);
          throw result.error;
        } else {
          console.log('✅ SQL function executed successfully');
        }

        console.log('🔄 Updating local state');
        setUsers((prevUsers: UserWithDetails[]) => {
          return prevUsers.map(user => {
            if (user.id === userId) {
              const wasHighPriority = user.priority_matches?.[0]?.priority === 'high';
              console.log(`User ${userId} wasHighPriority: ${wasHighPriority}`);
              
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
        
        if (userWithHighPriority) {
          console.log('🔽 Decrementing high priority count');
          setHighPriorityCount((prev: number) => prev - 1);
        }

        toast.success("Match marked as not interested");
        console.log('===== PRIORITY CHANGE COMPLETED =====');
      } catch (error) {
        console.error('❌ Error marking match as not interested:', error);
        console.error('Error details:', {
          name: (error as Error).name,
          message: (error as Error).message,
          stack: (error as Error).stack
        });
        toast.error("Failed to mark match as not interested");
        console.log('===== PRIORITY CHANGE FAILED =====');
      }
      return;
    }

    if (priority === 'high' && highPriorityCount >= 5 && !users.find(u => 
      u.id === userId && u.priority_matches?.[0]?.priority === 'high'
    )) {
      console.log('⚠️ High priority limit reached');
      toast.error("You can only have up to 5 high priority matches");
      console.log('===== PRIORITY CHANGE ABORTED - LIMIT REACHED =====');
      return;
    }

    try {
      if (priority === null) {
        console.log('🗑️ Removing priority match');
        
        const founderID = profile.user_type === 'founder' ? profile.id : userId;
        const investorID = profile.user_type === 'founder' ? userId : profile.id;
        
        console.log(`Delete params: founderID=${founderID}, investorID=${investorID}`);
        
        // Use the service hook to delete
        const result = await deletePriorityMatch(
          sanitizeJson(founderID),
          sanitizeJson(investorID)
        );
        
        if (result.error) {
          console.error('⚠️ SQL function error:', result.error);
          throw result.error;
        } else {
          console.log('✅ Priority match deleted successfully');
        }

        setUsers((prevUsers: UserWithDetails[]) => 
          prevUsers.map(user => {
            if (user.id === userId) {
              const wasHighPriority = user.priority_matches?.[0]?.priority === 'high';
              console.log(`Removing: User ${userId} wasHighPriority: ${wasHighPriority}`);
              
              if (wasHighPriority) {
                console.log('🔽 Decrementing high priority count');
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
        console.log('===== PRIORITY CHANGE COMPLETED - REMOVED =====');
        return;
      }

      console.log('✏️ Setting priority match to:', priority);
      
      // Using service hook approach
      const founderID = profile.user_type === 'founder' ? profile.id : userId;
      const investorID = profile.user_type === 'founder' ? userId : profile.id;
      
      // Sanitize the priority value to remove any problematic characters
      const sanitizedPriority = priority ? priority.toString().trim() : null;
      
      console.log(`SQL function params: founderID=${founderID}, investorID=${investorID}, priority=${sanitizedPriority}, setBy=${profile.id}`);
      
      const result = await setPriorityMatch(
        sanitizeJson(founderID),
        sanitizeJson(investorID),
        sanitizedPriority as MatchPriority,
        sanitizeJson(profile.id)
      );
      
      if (result.error) {
        console.error('⚠️ SQL function error:', result.error);
        throw result.error;
      } else {
        console.log('✅ Priority set successfully via SQL function');
      }

      console.log('🔄 Updating local state');
      setUsers((prevUsers: UserWithDetails[]) => 
        prevUsers.map(user => {
          if (user.id === userId) {
            console.log(`Updating user ${userId} with new priority ${priority}`);
            return {
              ...user,
              priority_matches: [{
                id: user.priority_matches?.[0]?.id || crypto.randomUUID(),
                created_at: user.priority_matches?.[0]?.created_at || new Date().toISOString(),
                founder_id: founderID,
                investor_id: investorID,
                set_by: profile.id,
                priority: priority,
                not_interested: false
              }]
            };
          }
          return user;
        })
      );

      if (priority === 'high') {
        console.log('🔍 Checking if high priority count needs to be updated');
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
        console.log('🔍 Checking if high priority count needs to be decremented');
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
      console.log('===== PRIORITY CHANGE COMPLETED - SUCCESS =====');
    } catch (error) {
      console.error('❌ Error updating priority:', error);
      console.error('Error details:', {
        name: (error as Error).name,
        message: (error as Error).message,
        stack: (error as Error).stack
      });
      console.log('===== PRIORITY CHANGE FAILED =====');
      toast.error("Failed to update priority");
    }
  };

  return { handlePriorityChange };
};
