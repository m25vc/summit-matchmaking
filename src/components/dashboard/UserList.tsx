
import type { Database } from '@/integrations/supabase/types';
import { UserCard } from './UserCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from 'react';

type Profile = Database['public']['Tables']['profiles']['Row'];
type InvestorDetails = Database['public']['Tables']['investor_details']['Row'];
type FounderDetails = Database['public']['Tables']['founder_details']['Row'];
type PriorityMatch = Database['public']['Tables']['priority_matches']['Row'];

type UserWithDetails = Profile & {
  investor_details?: InvestorDetails;
  founder_details?: FounderDetails;
  priority_matches?: PriorityMatch[];
};

interface UserListProps {
  users: UserWithDetails[];
  profile: Profile | null;
  highPriorityCount: number;
  onPriorityChange: (userId: string, priority: 'high' | 'medium' | 'low' | null) => Promise<void>;
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

export const UserList = ({ users, profile, highPriorityCount, onPriorityChange }: UserListProps) => {
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [mainTab, setMainTab] = useState<string>('discover');
  const [userTypeTab, setUserTypeTab] = useState<string>('founders');

  const newUsers = users.filter(user => !user.priority_matches?.[0]?.priority);
  const priorityUsers = users.filter(user => user.priority_matches?.[0]?.priority);

  // Separate users by type
  const founderUsers = newUsers.filter(user => user.user_type === 'founder');
  const investorUsers = newUsers.filter(user => user.user_type === 'investor');

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

  const filteredFounders = getFilteredUsers(founderUsers);
  const filteredInvestors = getFilteredUsers(investorUsers);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">
        {profile?.user_type === 'founder' ? 'Potential Investors' : 'Potential Matches'}
      </h2>
      <p className="text-gray-600">
        You can mark up to 5 people as high priority. Current high priority matches: {highPriorityCount}/5
      </p>
      
      <Tabs value={mainTab} onValueChange={setMainTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="discover">
            Discover ({newUsers.length})
          </TabsTrigger>
          <TabsTrigger value="priority">
            My Shortlist ({priorityUsers.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="discover">
          {profile?.user_type === 'investor' && (
            <Tabs value={userTypeTab} onValueChange={setUserTypeTab} className="w-full mb-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="founders">
                  Founders ({founderUsers.length})
                </TabsTrigger>
                <TabsTrigger value="investors">
                  Investors ({investorUsers.length})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          <div className="mb-6 grid gap-4 md:grid-cols-2">
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
          </div>

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
              getFilteredUsers(newUsers).map((user) => (
                <UserCard 
                  key={user.id} 
                  user={user} 
                  onPriorityChange={onPriorityChange}
                />
              ))
            )}
            {((profile?.user_type === 'investor' && 
              ((userTypeTab === 'founders' && filteredFounders.length === 0) || 
               (userTypeTab === 'investors' && filteredInvestors.length === 0))) ||
              (profile?.user_type !== 'investor' && getFilteredUsers(newUsers).length === 0)) && (
              <p className="col-span-full text-center text-gray-500 py-8">
                No matches found with the selected filters
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="priority">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {priorityUsers.map((user) => (
              <UserCard 
                key={user.id} 
                user={user} 
                onPriorityChange={onPriorityChange}
              />
            ))}
            {priorityUsers.length === 0 && (
              <p className="col-span-full text-center text-gray-500 py-8">
                No priority matches yet
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
