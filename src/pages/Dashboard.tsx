
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DashboardLayout from '@/components/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

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
      // Refresh the page to show new users
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

          if (priorityMatchesError) throw priorityMatchesError;

          const highPriorityCount = (priorityMatchesData || []).filter(match => 
            match.priority === 'high' && 
            (profileData.user_type === 'founder' ? match.founder_id === user.id : match.investor_id === user.id)
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
      // Simplified upsert operation
      const matchData = {
        founder_id: profile.user_type === 'founder' ? profile.id : userId,
        investor_id: profile.user_type === 'founder' ? userId : profile.id,
        priority
      };

      const { error: upsertError } = await supabase
        .from('priority_matches')
        .upsert(matchData, {
          onConflict: 'founder_id,investor_id'
        });

      if (upsertError) throw upsertError;

      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => {
          if (user.id === userId) {
            return {
              ...user,
              priority_matches: [{
                ...matchData,
                id: user.priority_matches?.[0]?.id || '',
                created_at: user.priority_matches?.[0]?.created_at || new Date().toISOString()
              }]
            };
          }
          return user;
        })
      );

      // Update high priority count
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
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Welcome{profile?.first_name ? `, ${profile.first_name}` : ''}!</CardTitle>
          </CardHeader>
          <CardContent>
            {!profile?.first_name && (
              <Button onClick={() => window.location.href = '/profile'}>
                Complete Your Profile
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={createTestUsers}
              className="ml-4"
            >
              Create Test Users
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold">
            {profile?.user_type === 'founder' ? 'Potential Investors' : 'Potential Founders'}
          </h2>
          <p className="text-gray-600">
            You can mark up to 5 {profile?.user_type === 'founder' ? 'investors' : 'founders'} as high priority. Current high priority matches: {highPriorityCount}/5
          </p>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {users.map((user) => (
              <Card key={user.id}>
                <CardHeader>
                  <CardTitle>{user.first_name} {user.last_name}</CardTitle>
                  <p className="text-sm text-gray-500">{user.company_name}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {user.user_type === 'investor' ? (
                      <>
                        <p>{user.investor_details?.firm_description}</p>
                        {user.investor_details?.preferred_industries && (
                          <p className="text-sm">
                            <strong>Industries:</strong> {user.investor_details.preferred_industries.join(', ')}
                          </p>
                        )}
                        {user.investor_details?.preferred_stages && (
                          <p className="text-sm">
                            <strong>Stages:</strong> {user.investor_details.preferred_stages.join(', ')}
                          </p>
                        )}
                      </>
                    ) : (
                      <>
                        <p>{user.founder_details?.company_description}</p>
                        <p className="text-sm">
                          <strong>Industry:</strong> {user.founder_details?.industry}
                        </p>
                        <p className="text-sm">
                          <strong>Stage:</strong> {user.founder_details?.company_stage}
                        </p>
                      </>
                    )}
                    <div className="pt-4">
                      <Select
                        value={user.priority_matches?.[0]?.priority || ''}
                        onValueChange={(value: 'high' | 'medium' | 'low') => handlePriorityChange(user.id, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Set priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High Priority</SelectItem>
                          <SelectItem value="medium">Medium Priority</SelectItem>
                          <SelectItem value="low">Low Priority</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
