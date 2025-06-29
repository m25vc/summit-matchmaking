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
    
    // For debugging, output all users' details
    if (stageFilter !== 'all') {
      console.log('Users with filter details:');
      users.forEach(user => {
        if (user.user_type === 'investor') {
          console.log(`User ${user.id} (${user.first_name} ${user.last_name}) - Type: ${user.user_type}`, 
            `Industries: ${user.investor_details?.preferred_industries?.join(', ')}`,
            `Stages: ${user.investor_details?.preferred_stages?.join(', ')}`);
        } else {
          console.log(`User ${user.id} (${user.first_name} ${user.last_name}) - Type: ${user.user_type}`, 
            `Industry: ${user.founder_details?.industry}`,
            `Stage: ${user.founder_details?.company_stage}`);
        }
      });
    }
    
    return users.filter(user => {
      // Check if we have the user details before filtering
      const investorDetails = user.investor_details;
      const founderDetails = user.founder_details;
      
      // For industry filter
      let matchesIndustry = industryFilter === 'all';
      
      if (!matchesIndustry) {
        if (user.user_type === 'investor') {
          // When filtering investors, check if they invest in the selected industry
          matchesIndustry = false;
          
          if (investorDetails?.preferred_industries) {
            for (const industry of investorDetails.preferred_industries) {
              const cleanIndustry = industry.trim().toLowerCase();
              if (cleanIndustry === 'all' || cleanIndustry === industryFilter.trim().toLowerCase()) {
                matchesIndustry = true;
                break;
              }
            }
          }
          
          console.log(`Industry match for investor ${user.first_name}: ${matchesIndustry} (filter: ${industryFilter})`);
        } else {
          // When filtering founders, check if their company is in the selected industry
          const founderIndustry = (founderDetails?.industry || '').trim().toLowerCase();
          matchesIndustry = founderIndustry === industryFilter.trim().toLowerCase();
          console.log(`Industry match for founder ${user.first_name}: ${matchesIndustry} (${founderIndustry} vs ${industryFilter})`);
        }
      }

      // For stage filter
      let matchesStage = stageFilter === 'all';
      
      if (!matchesStage) {
        if (user.user_type === 'investor') {
          // When filtering investors, check if they invest in the selected stage
          matchesStage = false;
          
          if (investorDetails?.preferred_stages) {
            for (const stage of investorDetails.preferred_stages) {
              const cleanStage = stage.trim().toLowerCase();
              if (cleanStage === 'all' || cleanStage === stageFilter.trim().toLowerCase()) {
                matchesStage = true;
                break;
              }
            }
          }
          
          console.log(`Stage match for investor ${user.first_name}: ${matchesStage} (filter: ${stageFilter})`);
        } else {
          // When filtering founders, check if their company is at the selected stage
          const founderStage = (founderDetails?.company_stage || '').trim().toLowerCase();
          matchesStage = founderStage === stageFilter.trim().toLowerCase();
          console.log(`Stage match for founder ${user.first_name}: ${matchesStage} (${founderStage} vs ${stageFilter})`);
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
