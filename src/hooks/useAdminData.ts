
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
        // Get all priority matches to check for mutual matches
        const { data: priorityMatchesData, error: priorityMatchesError } = await supabase
          .from('priority_matches')
          .select('*');

        if (priorityMatchesError) {
          console.error('Priority matches error:', priorityMatchesError);
          return [];
        }

        // Get all profiles for reference
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('*');

        if (profilesError) {
          console.error('Profiles error:', profilesError);
          return [];
        }

        // Create a map of profiles by ID for faster lookups
        const profilesMap = new Map(profilesData?.map(profile => [profile.id, profile]));

        // Create a map to store mutual matches
        const mutualMatches = new Map();

        // Process priority matches to identify mutual matches
        priorityMatchesData?.forEach(match => {
          const key = [match.founder_id, match.investor_id].sort().join('-');
          if (!mutualMatches.has(key)) {
            mutualMatches.set(key, { matches: [], count: 0 });
          }
          mutualMatches.get(key).matches.push(match);
          mutualMatches.get(key).count++;
        });

        // Calculate scores and prepare final data
        const processedMatches = priorityMatchesData?.map(match => {
          const key = [match.founder_id, match.investor_id].sort().join('-');
          const mutualMatch = mutualMatches.get(key);
          const hasMutualMatch = mutualMatch?.count === 2;

          // Calculate score based on priorities and mutual match
          let score = 0;
          if (hasMutualMatch) {
            score += 10; // Base score for mutual match
          }

          // Add priority scores
          if (match.priority === 'high') score += 3;
          else if (match.priority === 'medium') score += 2;
          else if (match.priority === 'low') score += 1;

          // Add the other party's priority score if it exists
          const otherMatch = mutualMatch?.matches.find(m => 
            m.id !== match.id && 
            ((m.founder_id === match.investor_id && m.investor_id === match.founder_id) ||
             (m.founder_id === match.founder_id && m.investor_id === match.investor_id))
          );
          
          if (otherMatch) {
            if (otherMatch.priority === 'high') score += 3;
            else if (otherMatch.priority === 'medium') score += 2;
            else if (otherMatch.priority === 'low') score += 1;
          }

          return {
            ...match,
            founder: profilesMap.get(match.founder_id) || null,
            investor: profilesMap.get(match.investor_id) || null,
            score,
            has_mutual_match: hasMutualMatch
          };
        }) ?? [];

        // Sort by score in descending order
        return processedMatches.sort((a, b) => b.score - a.score);
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
