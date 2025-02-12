
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
type PriorityMatch = {
  id: string;
  founder_id: string;
  investor_id: string;
  priority: 'high' | 'medium' | 'low';
};

type UserWithDetails = Profile & {
  investor_details?: InvestorDetails;
  founder_details?: FounderDetails;
  priority_match?: PriorityMatch;
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
          // Fetch users of the opposite type (investors see founders, founders see investors)
          const oppositeType = profileData.user_type === 'founder' ? 'investor' : 'founder';
          const { data: usersData, error: usersError } = await supabase
            .from('profiles')
            .select(`
              *,
              investor_details (*),
              founder_details (*),
              priority_matches!priority_matches_${oppositeType}_id_fkey (*)
            `)
            .eq('user_type', oppositeType);

          if (usersError) throw usersError;

          // Count high priority matches
          const { data: highPriorityData, error: priorityError } = await supabase
            .from('priority_matches')
            .select('*')
            .eq(profileData.user_type === 'founder' ? 'founder_id' : 'investor_id', user.id)
            .eq('priority', 'high');

          if (priorityError) throw priorityError;

          setHighPriorityCount(highPriorityData?.length || 0);
          setUsers(usersData || []);
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

    if (priority === 'high' && highPriorityCount >= 5) {
      toast.error("You can only have up to 5 high priority matches");
      return;
    }

    try {
      const matchData = profile.user_type === 'founder' 
        ? { founder_id: profile.id, investor_id: userId }
        : { investor_id: profile.id, founder_id: userId };

      const { error: upsertError } = await supabase
        .from('priority_matches')
        .upsert({
          ...matchData,
          priority
        });

      if (upsertError) throw upsertError;

      // Refresh the high priority count
      const { data: highPriorityData, error: countError } = await supabase
        .from('priority_matches')
        .select('*')
        .eq(profile.user_type === 'founder' ? 'founder_id' : 'investor_id', profile.id)
        .eq('priority', 'high');

      if (countError) throw countError;

      setHighPriorityCount(highPriorityData?.length || 0);
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => {
          if (user.id === userId) {
            return {
              ...user,
              priority_match: {
                id: '', // This will be updated on next fetch
                ...matchData,
                priority
              }
            };
          }
          return user;
        })
      );

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
                        value={user.priority_match?.priority || ''}
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
