
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type PriorityMatch = {
  id: string;
  founder_id: string;
  investor_id: string;
  priority: Database['public']['Enums']['match_priority'];
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
    queryKey: ['priority_matches'],
    queryFn: async () => {
      try {
        // Get matches with their scores
        const { data: matchesData, error: matchesError } = await supabase
          .from('matches')
          .select('*');

        if (matchesError) {
          console.error('Matches error:', matchesError);
          return [];
        }

        // Get profiles
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('*');

        if (profilesError) {
          console.error('Profiles error:', profilesError);
          return [];
        }

        // Create a map of profiles by ID for faster lookups
        const profilesMap = new Map(profilesData?.map(profile => [profile.id, profile]));

        // Combine and calculate scores correctly
        const combinedData = matchesData?.map(match => {
          const hasMutualMatch = match.founder_interest && match.investor_interest;
          
          // Calculate score based on interests
          const score = hasMutualMatch ? 10 : 0;

          return {
            id: match.id,
            founder_id: match.founder_id,
            investor_id: match.investor_id,
            created_at: match.matched_at,
            founder: profilesMap.get(match.founder_id ?? '') || null,
            investor: profilesMap.get(match.investor_id ?? '') || null,
            score: score,
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
