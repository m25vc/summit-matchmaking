
import React, { useMemo } from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FilterBar } from '../filters/FilterBar';
import { UserGrid } from '../UserGrid';
import type { Profile, UserWithDetails } from '@/types/dashboard';

type SortOption = 'newest' | 'alphabetical' | 'company';

interface MutualMatchesTabContentProps {
  profile: Profile | null;
  users: UserWithDetails[];
  sortBy: SortOption;
  setSortBy: React.Dispatch<React.SetStateAction<SortOption>>;
  viewMode: 'grid' | 'list';
  onPriorityChange: (userId: string, priority: 'high' | 'medium' | 'low' | null, notInterested?: boolean) => Promise<void>;
  mutualTypeTab: string;
  setMutualTypeTab: React.Dispatch<React.SetStateAction<string>>;
}

export const MutualMatchesTabContent: React.FC<MutualMatchesTabContentProps> = ({
  profile,
  users,
  sortBy,
  setSortBy,
  viewMode,
  onPriorityChange,
  mutualTypeTab,
  setMutualTypeTab
}) => {
  // Filter based on match type
  const mutualMatches = useMemo(() => 
    users.filter(user => 
      // Users who have matched with you AND you've matched with them
      user.priority_matches?.length > 0 && 
      user.priority_matches[0]?.priority && 
      !user.priority_matches[0]?.not_interested &&
      // Here we'd ideally check if they also matched with you, but we're using the data structure we have
      // In a real app, we might have a separate "matched_with_me" field
      user.priority_matches[0]?.set_by !== profile?.id
    ), 
  [users, profile]);
  
  const theyMatchedWithMe = useMemo(() => 
    users.filter(user => 
      user.priority_matches?.length > 0 && 
      user.priority_matches[0]?.priority && 
      !user.priority_matches[0]?.not_interested &&
      // Only include if they set the match, not me
      user.priority_matches[0]?.set_by !== profile?.id
    ), 
  [users, profile]);
  
  const iMatchedWithThem = useMemo(() => 
    users.filter(user => 
      user.priority_matches?.length > 0 && 
      user.priority_matches[0]?.priority && 
      !user.priority_matches[0]?.not_interested &&
      // Only include if I set the match
      user.priority_matches[0]?.set_by === profile?.id
    ), 
  [users, profile]);

  const getSortedUsers = (userList: UserWithDetails[]) => {
    return [...userList].sort((a, b) => {
      switch (sortBy) {
        case 'alphabetical':
          return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
        case 'company':
          return (a.company_name || '').localeCompare(b.company_name || '');
        case 'newest':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
  };

  const displayUsers = useMemo(() => {
    switch (mutualTypeTab) {
      case 'mutual':
        return getSortedUsers(mutualMatches);
      case 'they-matched':
        return getSortedUsers(theyMatchedWithMe);
      case 'i-matched':
        return getSortedUsers(iMatchedWithThem);
      default:
        return getSortedUsers(mutualMatches);
    }
  }, [mutualMatches, theyMatchedWithMe, iMatchedWithThem, mutualTypeTab, sortBy]);

  return (
    <>
      <Tabs value={mutualTypeTab} onValueChange={setMutualTypeTab} className="w-full mb-6">
        <TabsList className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1">
          <TabsTrigger 
            value="mutual"
            className="text-sm data-[state=active]:bg-background"
          >
            Mutual Matches ({mutualMatches.length})
          </TabsTrigger>
          <TabsTrigger 
            value="they-matched"
            className="text-sm data-[state=active]:bg-background"
          >
            They Matched Me ({theyMatchedWithMe.length})
          </TabsTrigger>
          <TabsTrigger 
            value="i-matched"
            className="text-sm data-[state=active]:bg-background"
          >
            I Matched Them ({iMatchedWithThem.length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <FilterBar 
        sortBy={sortBy}
        setSortBy={setSortBy}
        industryFilter="all"
        setIndustryFilter={() => {}}
        stageFilter="all"
        setStageFilter={() => {}}
        showIndustryAndStage={false}
      />

      <UserGrid 
        users={displayUsers} 
        onPriorityChange={onPriorityChange} 
        viewMode={viewMode}
        emptyMessage={
          mutualTypeTab === 'mutual' 
            ? "No mutual matches found yet" 
            : mutualTypeTab === 'they-matched' 
              ? "No one has matched with you yet" 
              : "You haven't matched with anyone yet"
        } 
      />
    </>
  );
};
