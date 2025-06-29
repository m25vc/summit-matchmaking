
import DashboardLayout from '@/components/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UsersTable } from '@/components/admin/UsersTable';
import { PriorityMatchesTable } from '@/components/admin/PriorityMatchesTable';
import { AllowedEmailsTable } from '@/components/admin/AllowedEmailsTable';
import { SignupsToggle } from '@/components/admin/SignupsToggle';
import { useAdminData } from '@/hooks/useAdminData';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { sanitizeJson } from '@/lib/utils';

const AdminDashboard = () => {
  const { profiles, priorityMatches, isLoading, refetch } = useAdminData();
  const queryClient = useQueryClient();

  // Periodically refetch data to ensure UI stays updated
  useEffect(() => {
    const interval = setInterval(() => {
      console.log("Auto-refreshing admin data...");
      refetch();
    }, 5000); // Refresh every 5 seconds (increased frequency for better responsiveness)
    
    return () => clearInterval(interval);
  }, [refetch]);

  const handleDataCleared = () => {
    console.log("Data cleared, refreshing...");
    toast.success("Data cleared successfully");
    refetch();
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
        
        {/* Add SignupsToggle component before the tabs */}
        <SignupsToggle />
        
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="priorities">Priority Matches</TabsTrigger>
            <TabsTrigger value="allowlist">Email Allowlist</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <UsersTable users={sanitizeJson(profiles)} onDataCleared={handleDataCleared} />
          </TabsContent>

          <TabsContent value="priorities">
            <PriorityMatchesTable matches={sanitizeJson(priorityMatches)} />
          </TabsContent>

          <TabsContent value="allowlist">
            <AllowedEmailsTable />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
