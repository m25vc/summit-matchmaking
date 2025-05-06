
import React, { useMemo } from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FilterBar } from '../filters/FilterBar';
import { UserGrid } from '../UserGrid';
import type { Profile, UserWithDetails } from '@/types/dashboard';

type SortOption = 'newest' | 'alphabetical' | 'company';

interface DiscoverTabContentProps {
  profile: Profile | null;
  newUsers: UserWithDetails[];
  industryFilter: string;
  setIndustryFilter: React.Dispatch<React.SetStateAction<string>>;
  stageFilter: string;
  setStageFilter: React.Dispatch<React.SetStateAction<string>>;
  sortBy: SortOption;
  setSortBy: React.Dispatch<React.SetStateAction<SortOption>>;
  viewMode: 'grid' | 'list';
  onPriorityChange: (userId: string, priority: 'high' | 'medium' | 'low' | null, notInterested?: boolean) => Promise<void>;
  userTypeTab: string;
  setUserTypeTab: React.Dispatch<React.SetStateAction<string>>;
}

export const DiscoverTabContent: React.FC<DiscoverTabContentProps> = ({
  profile,
  newUsers,
  industryFilter,
  setIndustryFilter,
  stageFilter,
  setStageFilter,
  sortBy,
  setSortBy,
  viewMode,
  onPriorityChange,
  userTypeTab,
  setUserTypeTab
}) => {
  const founderUsers = useMemo(() => 
    newUsers.filter(user => user.user_type === 'founder'), [newUsers]);
    
  const investorUsers = useMemo(() => 
    newUsers.filter(user => user.user_type === 'investor'), [newUsers]);

  const getFilteredUsers = (users: UserWithDetails[]) => {
    return users.filter(user => {
      // For investors, check their preferred industries array
      // For founders, check their industry field
      const matchesIndustry = industryFilter === 'all' || (
        profile?.user_type === 'founder'
          ? user.investor_details?.preferred_industries?.includes(industryFilter)
          : user.founder_details?.industry === industryFilter
      );

      // For investors, check their preferred stages array
      // For founders, check their company_stage field
      const matchesStage = stageFilter === 'all' || (
        profile?.user_type === 'founder'
          ? user.investor_details?.preferred_stages?.includes(stageFilter)
          : user.founder_details?.company_stage === stageFilter
      );

      return matchesIndustry && matchesStage;
    });
  };

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

  const filteredFounders = useMemo(() => 
    getSortedUsers(getFilteredUsers(founderUsers)), [founderUsers, industryFilter, stageFilter, sortBy]);
    
  const filteredInvestors = useMemo(() => 
    getSortedUsers(getFilteredUsers(investorUsers)), [investorUsers, industryFilter, stageFilter, sortBy]);

  return (
    <>
      {profile?.user_type === 'investor' && (
        <Tabs value={userTypeTab} onValueChange={setUserTypeTab} className="w-full mb-6">
          <TabsList className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1">
            <TabsTrigger 
              value="founders"
              className="text-sm data-[state=active]:bg-background"
            >
              Founders ({founderUsers.length})
            </TabsTrigger>
            <TabsTrigger 
              value="investors"
              className="text-sm data-[state=active]:bg-background"
            >
              Investors ({investorUsers.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      <FilterBar 
        industryFilter={industryFilter}
        setIndustryFilter={setIndustryFilter}
        stageFilter={stageFilter}
        setStageFilter={setStageFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      {profile?.user_type === 'investor' ? (
        userTypeTab === 'founders' ? (
          <UserGrid 
            users={filteredFounders} 
            onPriorityChange={onPriorityChange} 
            viewMode={viewMode} 
          />
        ) : (
          <UserGrid 
            users={filteredInvestors} 
            onPriorityChange={onPriorityChange} 
            viewMode={viewMode} 
          />
        )
      ) : (
        <UserGrid 
          users={getSortedUsers(getFilteredUsers(newUsers))} 
          onPriorityChange={onPriorityChange} 
          viewMode={viewMode} 
        />
      )}
    </>
  );
};
