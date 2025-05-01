import React, { useMemo } from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FilterBar } from '../filters/FilterBar';
import { UserGrid } from '../UserGrid';
import type { Profile, UserWithDetails } from '@/types/dashboard';

type SortOption = 'newest' | 'alphabetical' | 'company';

interface PriorityTabContentProps {
  profile: Profile | null;
  priorityUsers: UserWithDetails[];
  sortBy: SortOption;
  setSortBy: React.Dispatch<React.SetStateAction<SortOption>>;
  viewMode: 'grid' | 'list';
  onPriorityChange: (userId: string, priority: 'high' | 'medium' | 'low' | null, notInterested?: boolean) => Promise<void>;
  priorityTypeTab: string;
  setPriorityTypeTab: React.Dispatch<React.SetStateAction<string>>;
}

export const PriorityTabContent: React.FC<PriorityTabContentProps> = ({
  profile,
  priorityUsers,
  sortBy,
  setSortBy,
  viewMode,
  onPriorityChange,
  priorityTypeTab,
  setPriorityTypeTab
}) => {
  const priorityFounders = useMemo(() => 
    priorityUsers.filter(user => user.user_type === 'founder'), [priorityUsers]);
    
  const priorityInvestors = useMemo(() => 
    priorityUsers.filter(user => user.user_type === 'investor'), [priorityUsers]);

  const getSortedUsers = (users: UserWithDetails[]) => {
    return [...users].sort((a, b) => {
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

  const sortedPriorityFounders = useMemo(() => 
    getSortedUsers(priorityFounders), [priorityFounders, sortBy]);
    
  const sortedPriorityInvestors = useMemo(() => 
    getSortedUsers(priorityInvestors), [priorityInvestors, sortBy]);

  return (
    <>
      {profile?.user_type === 'investor' && (
        <Tabs value={priorityTypeTab} onValueChange={setPriorityTypeTab} className="w-full mb-6">
          <TabsList className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1">
            <TabsTrigger 
              value="founders"
              className="text-sm data-[state=active]:bg-background"
            >
              Founders ({priorityFounders.length})
            </TabsTrigger>
            <TabsTrigger 
              value="investors"
              className="text-sm data-[state=active]:bg-background"
            >
              Investors ({priorityInvestors.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      <FilterBar 
        sortBy={sortBy}
        setSortBy={setSortBy}
        industryFilter="all"
        setIndustryFilter={() => {}}
        stageFilter="all"
        setStageFilter={() => {}}
        showIndustryAndStage={false}
      />

      {profile?.user_type === 'investor' ? (
        priorityTypeTab === 'founders' ? (
          <UserGrid 
            users={sortedPriorityFounders} 
            onPriorityChange={onPriorityChange} 
            viewMode={viewMode}
            emptyMessage="No priority matches yet" 
          />
        ) : (
          <UserGrid 
            users={sortedPriorityInvestors} 
            onPriorityChange={onPriorityChange} 
            viewMode={viewMode}
            emptyMessage="No priority matches yet" 
          />
        )
      ) : (
        <UserGrid 
          users={getSortedUsers(priorityUsers)} 
          onPriorityChange={onPriorityChange} 
          viewMode={viewMode}
          emptyMessage="No priority matches yet" 
        />
      )}
    </>
  );
};
