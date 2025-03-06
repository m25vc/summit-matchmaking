
import DashboardLayout from '@/components/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { UsersTable } from '@/components/admin/UsersTable';
import { PriorityMatchesTable } from '@/components/admin/PriorityMatchesTable';
import { useAdminData } from '@/hooks/useAdminData';

const AdminDashboard = () => {
  const { profiles, priorityMatches, isLoading } = useAdminData();

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
            <UsersTable users={profiles} />
          </TabsContent>

          <TabsContent value="priorities">
            <Alert className="mb-4 bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                Priority matches can be exported to Excel or synced to Google Sheets. 
                The Google Sheets integration requires setting up API keys in the Supabase Edge Function.
              </AlertDescription>
            </Alert>
            <PriorityMatchesTable matches={priorityMatches} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
