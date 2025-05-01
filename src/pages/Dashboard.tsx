
import DashboardLayout from '@/components/DashboardLayout';
import { ProfileHeader } from '@/components/dashboard/ProfileHeader';
import { UserList } from '@/components/dashboard/UserList';
import { DashboardLoading } from '@/components/dashboard/DashboardLoading';
import { useDashboardData } from '@/hooks/useDashboardData';
import { usePriorityHandlers } from '@/hooks/usePriorityHandlers';

const Dashboard = () => {
  const { 
    profile, 
    users, 
    loading, 
    highPriorityCount, 
    setHighPriorityCount,
    setUsers 
  } = useDashboardData();

  const { handlePriorityChange } = usePriorityHandlers(
    profile,
    users, 
    highPriorityCount, 
    setHighPriorityCount,
    setUsers
  );

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
              onPriorityChange={handlePriorityChange}
            />
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
