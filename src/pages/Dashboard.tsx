
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

  const createTestUsers = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-test-users');
      
      if (error) {
        console.error('Error creating test users:', error);
        toast.error('Failed to create test users');
        return;
      }
      
      toast.success('Test users created successfully');
      console.log('Created users:', data);
      window.location.reload();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to create test users');
    }
  };

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
          const oppositeType = profileData.user_type === 'founder' ? 'investor' : 'founder';
          
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

          const { data: usersData, error: usersError } = await supabase
            .from('profiles')
            .select(`
              *,
              investor_details (*),
              founder_details (*)
            `)
            .eq('user_type', oppositeType);

          if (usersError) throw usersError;

          const usersWithPriority = (usersData || []).map(user => ({
            ...user,
            priority_matches: priorityMatchesData?.filter(match => 
              profileData.user_type === 'founder' 
                ? match.founder_id === profileData.id && match.investor_id === user.id
                : match.investor_id === profileData.id && match.founder_id === user.id
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

  const handlePriorityChange = async (userId: string, priority: 'high' | 'medium' | 'low') => {
    if (!profile) {
      toast.error("Profile not loaded");
      return;
    }

    if (priority === 'high' && highPriorityCount >= 5 && !users.find(u => 
      u.id === userId && u.priority_matches?.[0]?.priority === 'high'
    )) {
      toast.error("You can only have up to 5 high priority matches");
      return;
    }

    try {
      const matchData = {
        founder_id: profile.user_type === 'founder' ? profile.id : userId,
        investor_id: profile.user_type === 'founder' ? userId : profile.id,
        priority
      };

      console.log('Upserting match data:', matchData);

      const { error } = await supabase
        .from('priority_matches')
        .upsert(matchData);

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
        <ProfileHeader 
          profile={profile} 
          onCreateTestUsers={createTestUsers} 
        />
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
