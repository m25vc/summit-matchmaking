
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

export const UserList = ({ users, profile, highPriorityCount, onPriorityChange }: UserListProps) => {
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  const [stageFilter, setStageFilter] = useState<string>('all');

  const newUsers = users.filter(user => !user.priority_matches?.[0]?.priority);
  const priorityUsers = users.filter(user => user.priority_matches?.[0]?.priority);

  // Get unique industries and stages from all users
  const industries = Array.from(new Set(users.flatMap(user => {
    if (user.user_type === 'investor' && user.investor_details?.preferred_industries) {
      return user.investor_details.preferred_industries;
    } else if (user.user_type === 'founder' && user.founder_details?.industry) {
      return [user.founder_details.industry];
    }
    return [];
  })));

  const stages = Array.from(new Set(users.flatMap(user => {
    if (user.user_type === 'investor' && user.investor_details?.preferred_stages) {
      return user.investor_details.preferred_stages;
    } else if (user.user_type === 'founder' && user.founder_details?.company_stage) {
      return [user.founder_details.company_stage];
    }
    return [];
  })));

  // Filter users based on selected filters
  const filteredNewUsers = newUsers.filter(user => {
    const matchesIndustry = industryFilter === 'all' || (
      user.user_type === 'investor' 
        ? user.investor_details?.preferred_industries?.includes(industryFilter)
        : user.founder_details?.industry === industryFilter
    );

    const matchesStage = stageFilter === 'all' || (
      user.user_type === 'investor'
        ? user.investor_details?.preferred_stages?.includes(stageFilter)
        : user.founder_details?.company_stage === stageFilter
    );

    return matchesIndustry && matchesStage;
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">
        {profile?.user_type === 'founder' ? 'Potential Investors' : 'Potential Matches'}
      </h2>
      <p className="text-gray-600">
        You can mark up to 5 people as high priority. Current high priority matches: {highPriorityCount}/5
      </p>
      
      <Tabs defaultValue="new" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="new">
            Discover ({newUsers.length})
          </TabsTrigger>
          <TabsTrigger value="priority">
            My Shortlist ({priorityUsers.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="new">
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
                  {industries.map((industry) => (
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
                  {stages.map((stage) => (
                    <SelectItem key={stage} value={stage}>
                      {stage}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredNewUsers.map((user) => (
              <UserCard 
                key={user.id} 
                user={user} 
                onPriorityChange={onPriorityChange}
              />
            ))}
            {filteredNewUsers.length === 0 && (
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
