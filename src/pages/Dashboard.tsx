
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
      highPriorityCount,
      users: users
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
            {(users && users.length > 0) ? (
              <UserList 
                users={users}
                profile={profile}
                highPriorityCount={highPriorityCount}
                onPriorityChange={updatePriorityMatch}
              />
            ) : (
              <div className="p-8 text-center">
                <h3 className="text-lg font-medium text-gray-900">No users found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  There are no other users available to match with at this time.
                </p>
                {initialUsers && initialUsers.length > 0 && (
                  <p className="mt-4 text-amber-600">
                    (Debug: {initialUsers.length} users are available but not showing)
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
