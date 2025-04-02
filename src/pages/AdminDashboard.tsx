
import DashboardLayout from '@/components/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UsersTable } from '@/components/admin/UsersTable';
import { PriorityMatchesTable } from '@/components/admin/PriorityMatchesTable';
import { useAdminData } from '@/hooks/useAdminData';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

const AdminDashboard = () => {
  const { profiles, priorityMatches, isLoading, refetch } = useAdminData();
  const queryClient = useQueryClient();
  
  const handleDataCleared = () => {
    console.log("Data cleared, invalidating queries...");
    // Refresh all queries to update UI after data is cleared
    queryClient.invalidateQueries({ queryKey: ['profiles'] });
    queryClient.invalidateQueries({ queryKey: ['priority_matches'] });
    refetch();
  };
  
  // Periodically refetch data to ensure UI stays updated
  useEffect(() => {
    const interval = setInterval(() => {
      console.log("Auto-refreshing admin data...");
      refetch();
    }, 10000); // Refresh every 10 seconds
    
    return () => clearInterval(interval);
  }, [refetch]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4">
          <div>Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
        
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="priorities">Priority Matches</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <UsersTable users={profiles} onDataCleared={handleDataCleared} />
          </TabsContent>

          <TabsContent value="priorities">
            <PriorityMatchesTable matches={priorityMatches} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
