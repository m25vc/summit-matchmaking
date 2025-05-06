
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
    console.log('Filter values:', { industryFilter, stageFilter });
    
    return users.filter(user => {
      // Check if we have the user details before filtering
      const investorDetails = user.investor_details;
      const founderDetails = user.founder_details;
      
      // Debug each user's details
      console.log('Filtering user:', {
        id: user.id,
        userType: user.user_type,
        founderIndustry: founderDetails?.industry,
        founderStage: founderDetails?.company_stage,
        investorIndustries: investorDetails?.preferred_industries,
        investorStages: investorDetails?.preferred_stages
      });
      
      // For investors looking at founders, check founder's industry field
      // For founders looking at investors, check investor's preferred_industries array
      let matchesIndustry = industryFilter === 'all';
      
      if (!matchesIndustry) {
        if (profile?.user_type === 'founder') {
          // Founders looking at investors
          matchesIndustry = investorDetails?.preferred_industries?.includes(industryFilter) || false;
        } else {
          // Investors looking at founders
          matchesIndustry = founderDetails?.industry === industryFilter;
        }
        console.log(`Industry match for ${user.id}: ${matchesIndustry}`);
      }

      // For investors looking at founders, check founder's company_stage
      // For founders looking at investors, check investor's preferred_stages array
      let matchesStage = stageFilter === 'all';
      
      if (!matchesStage) {
        if (profile?.user_type === 'founder') {
          // Founders looking at investors
          matchesStage = investorDetails?.preferred_stages?.includes(stageFilter) || false;
        } else {
          // Investors looking at founders
          matchesStage = founderDetails?.company_stage === stageFilter;
        }
        console.log(`Stage match for ${user.id}: ${matchesStage}`);
      }

      const isMatch = matchesIndustry && matchesStage;
      console.log(`Final match for ${user.id}: ${isMatch}`);
      return isMatch;
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

  const filteredFounders = useMemo(() => {
    const filtered = getFilteredUsers(founderUsers);
    console.log(`Filtered founders: ${filtered.length} out of ${founderUsers.length}`);
    return getSortedUsers(filtered);
  }, [founderUsers, industryFilter, stageFilter, sortBy]);
    
  const filteredInvestors = useMemo(() => {
    const filtered = getFilteredUsers(investorUsers);
    console.log(`Filtered investors: ${filtered.length} out of ${investorUsers.length}`);
    return getSortedUsers(filtered);
  }, [investorUsers, industryFilter, stageFilter, sortBy]);

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
