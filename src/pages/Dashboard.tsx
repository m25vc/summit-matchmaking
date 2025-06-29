
import DashboardLayout from '@/components/DashboardLayout';
import { ProfileHeader } from '@/components/dashboard/ProfileHeader';
import { UserList } from '@/components/dashboard/UserList';
import { DashboardLoading } from '@/components/dashboard/DashboardLoading';
import { useDashboardData } from '@/hooks/useDashboardData';
import { usePriorityMatches } from '@/hooks/usePriorityMatches';
import { useEffect, useState } from 'react';

const Dashboard = () => {
  // Get initial data
  const { profile, users: initialUsers, loading, highPriorityCount: initialHighPriorityCount } = useDashboardData();
  
  // Track if we've initialized users to prevent useEffect dependency issues
  const [initialized, setInitialized] = useState(false);
  
  // Setup priority match functionality
  const { users, highPriorityCount, updatePriorityMatch } = usePriorityMatches(
    profile, 
    initialUsers, 
    initialHighPriorityCount
  );

  // Debug logging to help identify issues
  useEffect(() => {
    console.log('Dashboard render:', {
      isLoading: loading,
      profile: profile,
      userCount: users?.length || 0,
      initialUserCount: initialUsers?.length || 0,
      highPriorityCount,
      users: users
    });
    
    // Mark as initialized once we have users
    if (initialUsers?.length > 0 && !initialized) {
      setInitialized(true);
    }
  }, [loading, profile, users, initialUsers, highPriorityCount, initialized]);

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
                    (Debug: {initialUsers.length} users are available but not showing - please refresh the page)
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
