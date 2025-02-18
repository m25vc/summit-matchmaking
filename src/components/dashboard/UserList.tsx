
import type { Database } from '@/integrations/supabase/types';
import { UserCard } from './UserCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const newUsers = users.filter(user => !user.priority_matches?.[0]?.priority);
  const priorityUsers = users.filter(user => user.priority_matches?.[0]?.priority);

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
            New Matches ({newUsers.length})
          </TabsTrigger>
          <TabsTrigger value="priority">
            Priority List ({priorityUsers.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="new">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {newUsers.map((user) => (
              <UserCard 
                key={user.id} 
                user={user} 
                onPriorityChange={onPriorityChange}
              />
            ))}
            {newUsers.length === 0 && (
              <p className="col-span-full text-center text-gray-500 py-8">
                No new matches available
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
