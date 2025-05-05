
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import type { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type InvestorDetails = Database['public']['Tables']['investor_details']['Row'];
type FounderDetails = Database['public']['Tables']['founder_details']['Row'];

export type UserWithDetails = Profile & {
  investor_details?: InvestorDetails;
  founder_details?: FounderDetails;
  priority_matches?: {
    id: string;
    created_at: string;
    founder_id: string;
    investor_id: string;
    set_by: string;
    priority: 'high' | 'medium' | 'low' | null;
    not_interested: boolean;
  }[];
};

export const useDashboardData = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [users, setUsers] = useState<UserWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [highPriorityCount, setHighPriorityCount] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.error('No authenticated user found');
          toast.error("Please login to view matches");
          return;
        }

        console.log("Current user ID:", user.id);

        // Get current user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Profile error:', profileError);
          throw profileError;
        }

        console.log("Profile data retrieved:", profileData);
        setProfile(profileData);

        // Get priority matches
        const { data: priorityMatchesData, error: priorityMatchesError } = await supabase
          .from('priority_matches')
          .select('*');

        if (priorityMatchesError) {
          console.error('Priority matches error:', priorityMatchesError);
          throw priorityMatchesError;
        }

        console.log("All priority matches:", priorityMatchesData);

        // Filter priority matches for current user
        const userPriorityMatches = profileData?.user_type === 'founder'
          ? priorityMatchesData?.filter(match => match.founder_id === user.id)
          : priorityMatchesData?.filter(match => match.investor_id === user.id);

        console.log("User's priority matches:", userPriorityMatches);

        // Count high priority matches
        const highPriorityMatches = userPriorityMatches?.filter(match => match.priority === 'high') || [];
        console.log("High priority count:", highPriorityMatches.length);
        setHighPriorityCount(highPriorityMatches.length);

        // Fetch all other users (except current user)
        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select(`
            *,
            investor_details (*),
            founder_details (*)
          `)
          .neq('id', user.id);

        if (usersError) {
          console.error('Users error:', usersError);
          throw usersError;
        }

        console.log("Other users fetched:", usersData?.length || 0);
        
        // Early return if no users found
        if (!usersData || usersData.length === 0) {
          console.log("No other users found");
          setUsers([]);
          setLoading(false);
          return;
        }

        // Map priority matches to users
        const usersWithPriority = usersData.map(user => {
          const userMatches = profileData?.user_type === 'founder'
            ? priorityMatchesData?.filter(match => 
                match.founder_id === profileData.id && match.investor_id === user.id)
            : priorityMatchesData?.filter(match => 
                match.investor_id === profileData.id && 
                match.founder_id === user.id);

          return {
            ...user,
            priority_matches: userMatches || []
          };
        });

        console.log("Users with priority data:", usersWithPriority.length);
        setUsers(usersWithPriority);

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
    highPriorityCount
  };
};
