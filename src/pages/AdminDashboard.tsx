
import DashboardLayout from '@/components/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UsersTable } from '@/components/admin/UsersTable';
import { PriorityMatchesTable } from '@/components/admin/PriorityMatchesTable';
import { useAdminData } from '@/hooks/useAdminData';
import { useQueryClient } from '@tanstack/react-query';

const AdminDashboard = () => {
  const { profiles, priorityMatches, isLoading } = useAdminData();
  const queryClient = useQueryClient();
  
  const handleDataCleared = () => {
    // Refresh all queries to update UI after data is cleared
    queryClient.invalidateQueries({ queryKey: ['profiles'] });
    queryClient.invalidateQueries({ queryKey: ['priority_matches'] });
  };

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
