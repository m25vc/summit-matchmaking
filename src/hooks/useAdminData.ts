
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type PriorityMatch = {
  id: string;
  founder_id: string;
  investor_id: string;
  created_at: string;
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
    queryKey: ['matches'],
    queryFn: async () => {
      try {
        // Get matches with their scores and related profiles
        const { data: matchesData, error: matchesError } = await supabase
          .from('matches')
          .select(`
            id,
            founder_id,
            investor_id,
            matched_at,
            founder_interest,
            investor_interest,
            founder:profiles!matches_founder_id_fkey(*),
            investor:profiles!matches_investor_id_fkey(*)
          `);

        if (matchesError) {
          console.error('Matches error:', matchesError);
          return [];
        }

        // Transform the data to match our PriorityMatch type
        const combinedData = matchesData?.map(match => {
          const hasMutualMatch = match.founder_interest && match.investor_interest;
          
          return {
            id: match.id,
            founder_id: match.founder_id,
            investor_id: match.investor_id,
            created_at: match.matched_at,
            founder: match.founder,
            investor: match.investor,
            score: hasMutualMatch ? 10 : 0,
            has_mutual_match: hasMutualMatch
          };
        }) ?? [];

        return combinedData;
      } catch (error) {
        console.error('Error fetching matches:', error);
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
