import type { Database } from '@/integrations/supabase/types';
import { UserCard } from './UserCard';
import { UserListView } from './UserListView';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LayoutGrid, LayoutList } from "lucide-react";
import { useState, useMemo } from 'react';
import { sanitizeJson } from '@/lib/utils';
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

const INDUSTRY_OPTIONS = [
  'SaaS',
  'Fintech',
  'Healthcare',
  'E-commerce',
  'Enterprise',
  'Other'
] as const;

const STAGE_OPTIONS = [
  'Pre-seed',
  'Seed',
  'Series A',
  'Series B+',
  'Other'
] as const;

type SortOption = 'newest' | 'alphabetical' | 'company';

export const UserList = ({ users, profile, highPriorityCount, onPriorityChange }: UserListProps) => {
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [mainTab, setMainTab] = useState<string>('discover');
  const [userTypeTab, setUserTypeTab] = useState<string>('founders');
  const [priorityTypeTab, setPriorityTypeTab] = useState<string>('founders');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const newUsers = users.filter(user => !user.priority_matches?.[0]?.priority);
  const priorityUsers = users.filter(user => user.priority_matches?.[0]?.priority);

  const founderUsers = newUsers.filter(user => user.user_type === 'founder');
  const investorUsers = newUsers.filter(user => user.user_type === 'investor');

  const priorityFounders = priorityUsers.filter(user => user.user_type === 'founder');
  const priorityInvestors = priorityUsers.filter(user => user.user_type === 'investor');

  const getFilteredUsers = (users: UserWithDetails[]) => {
    return users.filter(user => {
      const userIndustry = profile?.user_type === 'founder'
        ? user.investor_details?.preferred_industries?.[0]
        : user.founder_details?.industry;
      
      const userStage = profile?.user_type === 'founder'
        ? user.investor_details?.preferred_stages?.[0]
        : user.founder_details?.company_stage;

      const matchesIndustry = industryFilter === 'all' || (
        industryFilter === 'Other'
          ? !INDUSTRY_OPTIONS.slice(0, -1).includes(userIndustry as any)
          : profile?.user_type === 'founder'
            ? user.investor_details?.preferred_industries?.includes(industryFilter)
            : userIndustry === industryFilter
      );

      const matchesStage = stageFilter === 'all' || (
        stageFilter === 'Other'
          ? !STAGE_OPTIONS.slice(0, -1).includes(userStage as any)
          : profile?.user_type === 'founder'
            ? user.investor_details?.preferred_stages?.includes(stageFilter)
            : userStage === stageFilter
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

  const filteredFounders = useMemo(() => getSortedUsers(getFilteredUsers(founderUsers)), [founderUsers, industryFilter, stageFilter, sortBy]);
  const filteredInvestors = useMemo(() => getSortedUsers(getFilteredUsers(investorUsers)), [investorUsers, industryFilter, stageFilter, sortBy]);
  const sortedPriorityFounders = useMemo(() => getSortedUsers(priorityFounders), [priorityFounders, sortBy]);
  const sortedPriorityInvestors = useMemo(() => getSortedUsers(priorityInvestors), [priorityInvestors, sortBy]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {profile?.user_type === 'founder' ? 'Potential Investors' : 'Potential Matches'}
        </h2>
        <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'grid' ? 'bg-background text-foreground' : 'text-muted-foreground'
            }`}
          >
            <LayoutGrid className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'list' ? 'bg-background text-foreground' : 'text-muted-foreground'
            }`}
          >
            <LayoutList className="h-5 w-5" />
          </button>
        </div>
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

          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium mb-2 block">Industry</label>
              <Select
                value={industryFilter}
                onValueChange={setIndustryFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  {INDUSTRY_OPTIONS.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Stage</label>
              <Select
                value={stageFilter}
                onValueChange={setStageFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stages</SelectItem>
                  {STAGE_OPTIONS.map((stage) => (
                    <SelectItem key={stage} value={stage}>
                      {stage}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Sort by</label>
              <Select
                value={sortBy}
                onValueChange={(value) => setSortBy(value as SortOption)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest first</SelectItem>
                  <SelectItem value="alphabetical">Alphabetical</SelectItem>
                  <SelectItem value="company">Company name</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {viewMode === 'grid' ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {profile?.user_type === 'investor' ? (
                userTypeTab === 'founders' ? (
                  filteredFounders.map((user) => (
                    <UserCard 
                      key={user.id} 
                      user={user} 
                      onPriorityChange={onPriorityChange}
                    />
                  ))
                ) : (
                  filteredInvestors.map((user) => (
                    <UserCard 
                      key={user.id} 
                      user={user} 
                      onPriorityChange={onPriorityChange}
                    />
                  ))
                )
              ) : (
                getSortedUsers(getFilteredUsers(newUsers)).map((user) => (
                  <UserCard 
                    key={user.id} 
                    user={user} 
                    onPriorityChange={onPriorityChange}
                  />
                ))
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {profile?.user_type === 'investor' ? (
                userTypeTab === 'founders' ? (
                  filteredFounders.map((user) => (
                    <UserListView
                      key={user.id} 
                      user={user} 
                      onPriorityChange={onPriorityChange}
                    />
                  ))
                ) : (
                  filteredInvestors.map((user) => (
                    <UserListView
                      key={user.id} 
                      user={user} 
                      onPriorityChange={onPriorityChange}
                    />
                  ))
                )
              ) : (
                getSortedUsers(getFilteredUsers(newUsers)).map((user) => (
                  <UserListView
                    key={user.id} 
                    user={user} 
                    onPriorityChange={onPriorityChange}
                  />
                ))
              )}
            </div>
          )}

          {((profile?.user_type === 'investor' && 
              ((userTypeTab === 'founders' && filteredFounders.length === 0) || 
               (userTypeTab === 'investors' && filteredInvestors.length === 0))) ||
              (profile?.user_type !== 'investor' && getSortedUsers(getFilteredUsers(newUsers)).length === 0)) && (
            <p className="col-span-full text-center text-gray-500 py-8">
              No matches found with the selected filters
            </p>
          )}
        </TabsContent>

        <TabsContent value="priority">
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

          <div className="mb-6">
            <label className="text-sm font-medium mb-2 block">Sort by</label>
            <Select
              value={sortBy}
              onValueChange={(value) => setSortBy(value as SortOption)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="alphabetical">Alphabetical</SelectItem>
                <SelectItem value="company">Company name</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className={viewMode === 'grid' ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3" : "space-y-4"}>
            {profile?.user_type === 'investor' ? (
              priorityTypeTab === 'founders' ? (
                sortedPriorityFounders.map((user) => (
                  viewMode === 'grid' ? (
                    <UserCard 
                      key={user.id} 
                      user={user} 
                      onPriorityChange={onPriorityChange}
                    />
                  ) : (
                    <UserListView
                      key={user.id} 
                      user={user} 
                      onPriorityChange={onPriorityChange}
                    />
                  )
                ))
              ) : (
                sortedPriorityInvestors.map((user) => (
                  viewMode === 'grid' ? (
                    <UserCard 
                      key={user.id} 
                      user={user} 
                      onPriorityChange={onPriorityChange}
                    />
                  ) : (
                    <UserListView
                      key={user.id} 
                      user={user} 
                      onPriorityChange={onPriorityChange}
                    />
                  )
                ))
              )
            ) : (
              getSortedUsers(priorityUsers).map((user) => (
                viewMode === 'grid' ? (
                  <UserCard 
                    key={user.id} 
                    user={user} 
                    onPriorityChange={onPriorityChange}
                  />
                ) : (
                  <UserListView
                    key={user.id} 
                    user={user} 
                    onPriorityChange={onPriorityChange}
                  />
                )
              ))
            )}
          </div>

          {((profile?.user_type === 'investor' && 
              ((priorityTypeTab === 'founders' && priorityFounders.length === 0) || 
               (priorityTypeTab === 'investors' && priorityInvestors.length === 0))) ||
              (profile?.user_type !== 'investor' && priorityUsers.length === 0)) && (
            <p className="col-span-full text-center text-gray-500 py-8">
              No priority matches yet
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
