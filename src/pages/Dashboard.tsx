
import DashboardLayout from '@/components/DashboardLayout';
import { ProfileHeader } from '@/components/dashboard/ProfileHeader';
import { UserList } from '@/components/dashboard/UserList';
import { DashboardLoading } from '@/components/dashboard/DashboardLoading';
import { useDashboardData } from '@/hooks/useDashboardData';
import { usePriorityMatches } from '@/hooks/usePriorityMatches';
import { useEffect } from 'react';

const Dashboard = () => {
  const { profile, users: initialUsers, loading, highPriorityCount: initialHighPriorityCount } = useDashboardData();
  
  const { users, highPriorityCount, updatePriorityMatch } = usePriorityMatches(
    profile, 
    initialUsers, 
    initialHighPriorityCount
  );

  useEffect(() => {
    // Debug logging to help identify issues
    console.log('Dashboard render:', {
      isLoading: loading,
      profile: profile,
      userCount: users?.length,
      initialUserCount: initialUsers?.length,
      highPriorityCount
    });
  }, [loading, profile, users, initialUsers, highPriorityCount]);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <DashboardLoading />
        ) : (
          <>
            <ProfileHeader profile={profile} />
            <UserList 
              users={users}
              profile={profile}
              highPriorityCount={highPriorityCount}
              onPriorityChange={updatePriorityMatch}
            />
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
