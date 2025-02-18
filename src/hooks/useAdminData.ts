
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { supabaseAdmin } from '@/integrations/supabase/adminClient';
import type { Database } from '@/integrations/supabase/types';
import type { User } from '@supabase/supabase-js';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type PriorityMatch = Database['public']['Tables']['priority_matches']['Row'] & {
  founder: Profile | null;
  investor: Profile | null;
  set_by_user: Profile | null;
  founder_email?: string;
  investor_email?: string;
};

export const useAdminData = () => {
  const { data: profiles, isLoading: profilesLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      
      if (error) throw error;
      return data;
    },
  });

  const { data: priorityMatches, isLoading: priorityMatchesLoading } = useQuery({
    queryKey: ['priority_matches'],
    queryFn: async () => {
      try {
        const { data: priorityMatchesData, error: priorityError } = await supabase
          .from('priority_matches')
          .select(`
            *,
            founder:profiles!priority_matches_founder_id_fkey(
              id,
              first_name,
              last_name,
              company_name,
              user_type
            ),
            investor:profiles!priority_matches_investor_id_fkey(
              id,
              first_name,
              last_name,
              company_name,
              user_type
            ),
            set_by_user:profiles!priority_matches_set_by_fkey(
              first_name,
              last_name,
              user_type
            )
          `).returns<PriorityMatch[]>();
        
        if (priorityError) {
          console.error('Priority matches error:', priorityError);
          return [];
        }

        // Return matches without trying to get emails if there's no data
        if (!priorityMatchesData) {
          return [];
        }

        // If we don't have an admin client, return basic data without emails
        if (!supabaseAdmin) {
          return priorityMatchesData;
        }

        try {
          const { data: adminData } = await supabaseAdmin.auth.admin.listUsers();
          const adminUsers = adminData?.users || [];

          return priorityMatchesData.map(match => ({
            ...match,
            founder_email: adminUsers.find(u => u.id === match.founder?.id)?.email,
            investor_email: adminUsers.find(u => u.id === match.investor?.id)?.email,
          }));
        } catch (adminError) {
          console.error('Admin access error:', adminError);
          return priorityMatchesData;
        }
      } catch (error) {
        console.error('Error fetching priority matches:', error);
        return [];
      }
    },
  });

  return {
    profiles,
    priorityMatches,
    isLoading: profilesLoading || priorityMatchesLoading
  };
};
