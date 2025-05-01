
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ViewToggle } from './ViewToggle';
import { DiscoverTabContent } from './tabs/DiscoverTabContent';
import { PriorityTabContent } from './tabs/PriorityTabContent';
import type { Database } from '@/integrations/supabase/types';
import type { PriorityMatch } from '@/hooks/useAdminData';

type Profile = Database['public']['Tables']['profiles']['Row'];
type InvestorDetails = Database['public']['Tables']['investor_details']['Row'];
type FounderDetails = Database['public']['Tables']['founder_details']['Row'];

type UserWithDetails = Profile & {
  investor_details?: InvestorDetails;
  founder_details?: FounderDetails;
  priority_matches?: PriorityMatch[];
};

interface UserListProps {
  users: UserWithDetails[];
  profile: Profile | null;
  highPriorityCount: number;
  onPriorityChange: (userId: string, priority: 'high' | 'medium' | 'low' | null, notInterested?: boolean) => Promise<void>;
}

type SortOption = 'newest' | 'alphabetical' | 'company';

export const UserList: React.FC<UserListProps> = ({ 
  users, 
  profile, 
  highPriorityCount, 
  onPriorityChange 
}) => {
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [mainTab, setMainTab] = useState<string>('discover');
  const [userTypeTab, setUserTypeTab] = useState<string>('founders');
  const [priorityTypeTab, setPriorityTypeTab] = useState<string>('founders');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const newUsers = users.filter(user => !user.priority_matches?.[0]?.priority);
  const priorityUsers = users.filter(user => user.priority_matches?.[0]?.priority);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {profile?.user_type === 'founder' ? 'Potential Investors' : 'Potential Matches'}
        </h2>
        <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
      </div>
      
      <p className="text-gray-600">
        You can mark up to 5 people as high priority. Current high priority matches: {highPriorityCount}/5
      </p>
      
      <Tabs value={mainTab} onValueChange={setMainTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 p-2 bg-muted/20">
          <TabsTrigger 
            value="discover"
            className="text-base font-semibold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md transition-all"
          >
            Discover ({newUsers.length})
          </TabsTrigger>
          <TabsTrigger 
            value="priority"
            className="text-base font-semibold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md transition-all"
          >
            My Shortlist ({priorityUsers.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="discover">
          <DiscoverTabContent 
            profile={profile}
            newUsers={newUsers}
            industryFilter={industryFilter}
            setIndustryFilter={setIndustryFilter}
            stageFilter={stageFilter}
            setStageFilter={setStageFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
            viewMode={viewMode}
            onPriorityChange={onPriorityChange}
            userTypeTab={userTypeTab}
            setUserTypeTab={setUserTypeTab}
          />
        </TabsContent>

        <TabsContent value="priority">
          <PriorityTabContent 
            profile={profile}
            priorityUsers={priorityUsers}
            sortBy={sortBy}
            setSortBy={setSortBy}
            viewMode={viewMode}
            onPriorityChange={onPriorityChange}
            priorityTypeTab={priorityTypeTab}
            setPriorityTypeTab={setPriorityTypeTab}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
