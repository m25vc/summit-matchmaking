
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import type { Database } from '@/integrations/supabase/types';
import type { PriorityMatch } from '@/hooks/useAdminData';
import { sanitizeJson } from '@/lib/utils';

type Profile = Database['public']['Tables']['profiles']['Row'];
type InvestorDetails = Database['public']['Tables']['investor_details']['Row'];
type FounderDetails = Database['public']['Tables']['founder_details']['Row'];

export type UserWithDetails = Profile & {
  investor_details?: InvestorDetails;
  founder_details?: FounderDetails;
  priority_matches?: PriorityMatch[];
};

export const useDashboardData = () => {
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

  return {
    profile,
    users,
    loading,
    highPriorityCount,
    setHighPriorityCount,
    setUsers
  };
};
