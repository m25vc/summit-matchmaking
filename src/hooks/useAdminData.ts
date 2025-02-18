
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { supabaseAdmin } from '@/integrations/supabase/adminClient';
import type { Database } from '@/integrations/supabase/types';

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
        throw priorityError;
      }

      const { data: adminData, error: adminError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (adminError) {
        console.error('Admin users error:', adminError);
        throw adminError;
      }

      return (priorityMatchesData || []).map(match => ({
        ...match,
        founder_email: adminData.users.find(u => u.id === match.founder?.id)?.email,
        investor_email: adminData.users.find(u => u.id === match.investor?.id)?.email,
      }));
    },
  });

  return {
    profiles,
    priorityMatches,
    isLoading: profilesLoading || priorityMatchesLoading
  };
};
