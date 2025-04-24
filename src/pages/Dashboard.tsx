import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { toast } from "sonner";
import { ProfileHeader } from '@/components/dashboard/ProfileHeader';
import { UserList } from '@/components/dashboard/UserList';

type Profile = Database['public']['Tables']['profiles']['Row'];
type InvestorDetails = Database['public']['Tables']['investor_details']['Row'];
type FounderDetails = Database['public']['Tables']['founder_details']['Row'];
type PriorityMatch = Database['public']['Tables']['priority_matches']['Row'];

type UserWithDetails = Profile & {
  investor_details?: InvestorDetails;
  founder_details?: FounderDetails;
  priority_matches?: PriorityMatch[];
};

const Dashboard = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [users, setUsers] = useState<UserWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [highPriorityCount, setHighPriorityCount] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);

        if (profileData) {
          const { data: priorityMatchesData, error: priorityMatchesError } = await supabase
            .from('priority_matches')
            .select('*');

          if (priorityMatchesError) {
            console.error('Priority matches error:', priorityMatchesError);
            throw priorityMatchesError;
          }

          const filteredPriorityMatches = priorityMatchesData?.filter(match => 
            profileData.user_type === 'founder' 
              ? match.founder_id === user.id 
              : match.investor_id === user.id
          ) || [];

          const highPriorityCount = filteredPriorityMatches.filter(match => 
            match.priority === 'high'
          ).length;
          
          setHighPriorityCount(highPriorityCount);

          // Fetch potential matches based on user type
          let query = supabase
            .from('profiles')
            .select(`
              *,
              investor_details (*),
              founder_details (*)
            `);

          if (profileData.user_type === 'founder') {
            // Founders can only match with investors
            query = query.eq('user_type', 'investor');
          } else {
            // Investors can match with both founders and other investors (except themselves)
            query = query.neq('id', user.id);
          }

          const { data: usersData, error: usersError } = await query;

          if (usersError) throw usersError;

          const usersWithPriority = (usersData || []).map(user => ({
            ...user,
            priority_matches: priorityMatchesData?.filter(match => 
              profileData.user_type === 'founder' 
                ? match.founder_id === profileData.id && match.investor_id === user.id
                : match.investor_id === profileData.id && 
                  (match.founder_id === user.id || match.investor_id === user.id)
            ) || []
          }));

          setUsers(usersWithPriority);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

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
        const { error } = await supabase
          .from('priority_matches')
          .upsert({
            founder_id: profile.user_type === 'founder' ? profile.id : userId,
            investor_id: profile.user_type === 'founder' ? userId : profile.id,
            priority: null,
            not_interested: true,
            set_by: profile.id
          }, {
            onConflict: 'founder_id,investor_id'
          });

        if (error) {
          console.error('Upsert error:', error);
          throw error;
        }

        setUsers(prevUsers => 
          prevUsers.map(user => {
            if (user.id === userId) {
              return {
                ...user,
                priority_matches: [{
                  ...user.priority_matches?.[0],
                  priority: null,
                  not_interested: true
                }]
              };
            }
            return user;
          })
        );

        if (user.priority_matches?.[0]?.priority === 'high') {
          setHighPriorityCount(prev => prev - 1);
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

        setUsers(prevUsers => 
          prevUsers.map(user => {
            if (user.id === userId) {
              const wasHighPriority = user.priority_matches?.[0]?.priority === 'high';
              if (wasHighPriority) {
                setHighPriorityCount(prev => prev - 1);
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

      const matchData = {
        founder_id: profile.user_type === 'founder' ? profile.id : userId,
        investor_id: profile.user_type === 'founder' ? userId : profile.id,
        priority,
        set_by: profile.id
      };

      console.log('Upserting match data:', matchData);

      const { error } = await supabase
        .from('priority_matches')
        .upsert(matchData, {
          onConflict: 'founder_id,investor_id'
        });

      if (error) {
        console.error('Upsert error:', error);
        throw error;
      }

      setUsers(prevUsers => 
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
        setHighPriorityCount(prev => {
          const userHadHighPriority = users.find(u => 
            u.id === userId && u.priority_matches?.[0]?.priority === 'high'
          );
          return userHadHighPriority ? prev : prev + 1;
        });
      } else {
        setHighPriorityCount(prev => {
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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ProfileHeader profile={profile} />
        <UserList 
          users={users}
          profile={profile}
          highPriorityCount={highPriorityCount}
          onPriorityChange={handlePriorityChange}
        />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
