
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminDashboard = () => {
  const { data: profiles, isLoading: profilesLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      
      if (error) throw error;
      return data;
    },
  });

  const { data: priorityMatches, isLoading: priorityMatchesLoading } = useQuery({
    queryKey: ['priority_matches'],
    queryFn: async () => {
      const { data: priorityMatchesData, error: priorityError } = await supabase
        .from('priority_matches')
        .select(`
          *,
          founder:profiles!priority_matches_founder_id_fkey(
            first_name,
            last_name,
            company_name
          ),
          investor:profiles!priority_matches_investor_id_fkey(
            first_name,
            last_name,
            company_name
          )
        `);
      
      if (priorityError) {
        console.error('Priority matches error:', priorityError);
        throw priorityError;
      }

      console.log('Priority matches:', priorityMatchesData);
      return priorityMatchesData;
    },
  });

  if (profilesLoading || priorityMatchesLoading) {
    return <div>Loading...</div>;
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
            <div className="bg-white rounded-lg shadow">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profiles?.map((profile) => (
                    <TableRow key={profile.id}>
                      <TableCell>{profile.first_name} {profile.last_name}</TableCell>
                      <TableCell>{profile.company_name}</TableCell>
                      <TableCell>{profile.role}</TableCell>
                      <TableCell>{profile.user_type}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="priorities">
            <div className="bg-white rounded-lg shadow">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Founder</TableHead>
                    <TableHead>Investor</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {priorityMatches?.map((match) => (
                    <TableRow key={match.id}>
                      <TableCell>
                        {match.founder?.first_name} {match.founder?.last_name}
                        <br />
                        <span className="text-sm text-gray-500">
                          {match.founder?.company_name}
                        </span>
                      </TableCell>
                      <TableCell>
                        {match.investor?.first_name} {match.investor?.last_name}
                        <br />
                        <span className="text-sm text-gray-500">
                          {match.investor?.company_name}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`font-medium ${
                          match.priority === 'high' ? 'text-green-600' :
                          match.priority === 'medium' ? 'text-yellow-600' :
                          match.priority === 'low' ? 'text-red-600' : 'text-gray-500'
                        }`}>
                          {match.priority}
                        </span>
                      </TableCell>
                      <TableCell>
                        {new Date(match.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
