
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
      
      // For industry filter
      let matchesIndustry = industryFilter === 'all';
      
      if (!matchesIndustry) {
        if (user.user_type === 'investor') {
          // Handle investors - check their preferred industries
          matchesIndustry = !!investorDetails?.preferred_industries?.some(industry => 
            industry.trim().toLowerCase() === industryFilter.trim().toLowerCase() ||
            industry.trim().toLowerCase() === 'all'
          );
        } else {
          // Handle founders - check their industry
          const founderIndustry = founderDetails?.industry || '';
          matchesIndustry = founderIndustry.trim().toLowerCase() === industryFilter.trim().toLowerCase();
        }
      }

      // For stage filter
      let matchesStage = stageFilter === 'all';
      
      if (!matchesStage) {
        if (user.user_type === 'investor') {
          // For investors - check their preferred stages
          if (investorDetails?.preferred_stages) {
            // Debug logging
            console.log(`Checking stages for investor ${user.first_name} ${user.last_name}:`, 
              investorDetails.preferred_stages);
              
            matchesStage = investorDetails.preferred_stages.some(stage => 
              stage.trim().toLowerCase() === stageFilter.trim().toLowerCase() ||
              stage.trim().toLowerCase() === 'all'
            );
            
            console.log(`Stage match for ${user.first_name} ${user.last_name}: ${matchesStage} (stageFilter: ${stageFilter})`);
          } else {
            matchesStage = false;
          }
        } else {
          // For founders - check their company stage
          const founderStage = founderDetails?.company_stage || '';
          console.log(`Comparing founder stage "${founderStage}" with filter "${stageFilter}"`);
          matchesStage = founderStage.trim().toLowerCase() === stageFilter.trim().toLowerCase();
        }
      }

      const isMatch = matchesIndustry && matchesStage;
      console.log(`Final match for ${user.first_name} ${user.last_name} (${user.id}): ${isMatch}`);
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
