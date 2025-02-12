
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
type PriorityMatch = {
  id: string;
  founder_id: string;
  investor_id: string;
  priority: 'high' | 'medium' | 'low';
};

type InvestorWithDetails = Profile & {
  investor_details: InvestorDetails;
  priority_match?: PriorityMatch;
};

const Dashboard = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [investors, setInvestors] = useState<InvestorWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [highPriorityCount, setHighPriorityCount] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        setProfile(profileData);

        if (profileData?.user_type === 'founder') {
          // Fetch all investors with their details
          const { data: investorsData } = await supabase
            .from('profiles')
            .select(`
              *,
              investor_details (*),
              priority_matches!priority_matches_investor_id_fkey (*)
            `)
            .eq('user_type', 'investor');

          // Count high priority matches
          const { data: highPriorityData } = await supabase
            .from('priority_matches')
            .select('*')
            .eq('founder_id', user.id)
            .eq('priority', 'high');

          setHighPriorityCount(highPriorityData?.length || 0);
          setInvestors(investorsData || []);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handlePriorityChange = async (investorId: string, priority: 'high' | 'medium' | 'low') => {
    if (!profile) return;

    if (priority === 'high' && highPriorityCount >= 5) {
      toast.error("You can only have up to 5 high priority matches");
      return;
    }

    try {
      const { error } = await supabase
        .from('priority_matches')
        .upsert({
          founder_id: profile.id,
          investor_id: investorId,
          priority
        });

      if (error) throw error;

      // Refresh the data
      const { data: highPriorityData } = await supabase
        .from('priority_matches')
        .select('*')
        .eq('founder_id', profile.id)
        .eq('priority', 'high');

      setHighPriorityCount(highPriorityData?.length || 0);
      
      // Update local state
      setInvestors(prevInvestors => 
        prevInvestors.map(investor => {
          if (investor.id === investorId) {
            return {
              ...investor,
              priority_match: {
                id: '', // This will be updated on next fetch
                founder_id: profile.id,
                investor_id: investorId,
                priority
              }
            };
          }
          return investor;
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

        {profile?.user_type === 'founder' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Potential Investors</h2>
            <p className="text-gray-600">
              You can mark up to 5 investors as high priority. Current high priority matches: {highPriorityCount}/5
            </p>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {investors.map((investor) => (
                <Card key={investor.id}>
                  <CardHeader>
                    <CardTitle>{investor.first_name} {investor.last_name}</CardTitle>
                    <p className="text-sm text-gray-500">{investor.company_name}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p>{investor.investor_details?.firm_description}</p>
                      {investor.investor_details?.preferred_industries && (
                        <p className="text-sm">
                          <strong>Industries:</strong> {investor.investor_details.preferred_industries.join(', ')}
                        </p>
                      )}
                      {investor.investor_details?.preferred_stages && (
                        <p className="text-sm">
                          <strong>Stages:</strong> {investor.investor_details.preferred_stages.join(', ')}
                        </p>
                      )}
                      <div className="pt-4">
                        <Select
                          value={investor.priority_match?.priority || ''}
                          onValueChange={(value: 'high' | 'medium' | 'low') => handlePriorityChange(investor.id, value)}
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
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
