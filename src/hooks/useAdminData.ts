
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
  set_by: string;
  not_interested: boolean | null;
  initiator?: Profile | null;
  target?: Profile | null;
  score?: number;
  has_mutual_match?: boolean;
};

export const useAdminData = () => {
  const profilesQuery = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      
      if (error) throw error;
      return data;
    },
  });

  const priorityMatchesQuery = useQuery({
    queryKey: ['priority_matches'],
    queryFn: async () => {
      try {
        // Get all priority matches to check for mutual matches
        const { data: priorityMatchesData, error: priorityMatchesError } = await supabase
          .from('priority_matches')
          .select('*');

        if (priorityMatchesError) {
          console.error('Priority matches error:', priorityMatchesError);
          throw priorityMatchesError;
        }

        // Get all profiles for reference
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('*');

        if (profilesError) {
          console.error('Profiles error:', profilesError);
          throw profilesError;
        }

        // Create a map of profiles by ID for faster lookups
        const profilesMap = new Map(profilesData?.map(profile => [profile.id, profile]));

        // Create a map to store mutual matches
        const mutualMatches = new Map();

        // Process priority matches to identify mutual matches
        priorityMatchesData?.forEach(match => {
          // Ensure match.founder_id and match.investor_id are defined before sorting
          if (match.founder_id && match.investor_id) {
            const key = [match.founder_id, match.investor_id].sort().join('-');
            
            if (!mutualMatches.has(key)) {
              mutualMatches.set(key, { matches: [], count: 0 });
            }
            
            mutualMatches.get(key).matches.push(match);
            mutualMatches.get(key).count++;
          } else {
            console.warn('Match with undefined founder_id or investor_id:', match);
          }
        });

        // Calculate scores and prepare final data
        const processedMatches = priorityMatchesData?.map(match => {
          // Skip processing if essential IDs are missing
          if (!match.founder_id || !match.investor_id) {
            console.warn('Skipping match with missing IDs:', match);
            return match as PriorityMatch;
          }

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

          // Use safe lookups for profiles and sanitize data
          let initiator = null;
          let target = null;
          
          try {
            initiator = profilesMap.get(match.founder_id) || null;
            target = profilesMap.get(match.investor_id) || null;
            
            // Ensure we're not passing objects that might cause JSON serialization issues
            if (initiator) {
              // Create a clean copy without circular references or functions
              initiator = JSON.parse(JSON.stringify(initiator));
            }
            
            if (target) {
              // Create a clean copy without circular references or functions
              target = JSON.parse(JSON.stringify(target));
            }
          } catch (error) {
            console.error('Error processing profile data:', error);
          }

          return {
            ...match,
            initiator,
            target,
            score,
            has_mutual_match: hasMutualMatch
          } as PriorityMatch;
        }) ?? [];

        // Filter out any matches with undefined properties that could cause errors
        const validMatches = processedMatches.filter(match => 
          match && match.founder_id && match.investor_id
        ) as PriorityMatch[];

        // Sort by score in descending order - explicitly cast with the correct type
        return validMatches.sort((a: PriorityMatch, b: PriorityMatch) => 
          (b.score || 0) - (a.score || 0)
        );
      } catch (error) {
        console.error('Error fetching priority matches:', error);
        throw error;
      }
    },
  });

  return {
    profiles: profilesQuery.data,
    priorityMatches: priorityMatchesQuery.data,
    isLoading: profilesQuery.isLoading || priorityMatchesQuery.isLoading,
    isError: profilesQuery.isError || priorityMatchesQuery.isError,
    error: profilesQuery.error || priorityMatchesQuery.error,
    refetch: () => {
      profilesQuery.refetch();
      priorityMatchesQuery.refetch();
    }
  };
};
