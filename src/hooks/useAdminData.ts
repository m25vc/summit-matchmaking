
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type PriorityMatch = Database['public']['Tables']['priority_matches']['Row'] & {
  founder: Profile | null;
  investor: Profile | null;
  score: number;
  has_mutual_match: boolean;
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
          .from('match_scores')
          .select(`
            id,
            founder_id,
            investor_id,
            priority1,
            priority2,
            has_mutual_match,
            score,
            founder:profiles!match_scores_founder_id_fkey(
              id,
              first_name,
              last_name,
              company_name,
              user_type,
              email
            ),
            investor:profiles!match_scores_investor_id_fkey(
              id,
              first_name,
              last_name,
              company_name,
              user_type,
              email
            )
          `).returns<PriorityMatch[]>();
        
        if (priorityError) {
          console.error('Priority matches error:', priorityError);
          return [];
        }

        return priorityMatchesData || [];
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
