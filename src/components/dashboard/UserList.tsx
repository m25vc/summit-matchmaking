
import type { Database } from '@/integrations/supabase/types';
import { UserCard } from './UserCard';

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
  onPriorityChange: (userId: string, priority: 'high' | 'medium' | 'low') => Promise<void>;
}

export const UserList = ({ users, profile, highPriorityCount, onPriorityChange }: UserListProps) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">
        {profile?.user_type === 'founder' ? 'Potential Investors' : 'Potential Founders'}
      </h2>
      <p className="text-gray-600">
        You can mark up to 5 {profile?.user_type === 'founder' ? 'investors' : 'founders'} as high priority. Current high priority matches: {highPriorityCount}/5
      </p>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <UserCard 
            key={user.id} 
            user={user} 
            onPriorityChange={onPriorityChange}
          />
        ))}
      </div>
    </div>
  );
};
