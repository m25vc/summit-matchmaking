
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
        // First, get the match scores
        const { data: matchScoresData, error: matchScoresError } = await supabase
          .from('match_scores')
          .select('*');

        if (matchScoresError) {
          console.error('Match scores error:', matchScoresError);
          return [];
        }

        // Then, get all profiles
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('*');

        if (profilesError) {
          console.error('Profiles error:', profilesError);
          return [];
        }

        // Create a map of profiles by ID for faster lookups
        const profilesMap = new Map(profilesData?.map(profile => [profile.id, profile]));

        // Combine the data
        const combinedData = matchScoresData?.map(match => ({
          ...match,
          founder: profilesMap.get(match.founder_id ?? '') || null,
          investor: profilesMap.get(match.investor_id ?? '') || null,
        })) ?? [];

        return combinedData;
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
