
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

const getPriorityScore = (founderPriority: string | null, investorPriority: string | null) => {
  // Convert priorities to numerical scores
  const getPriorityValue = (priority: string | null) => {
    switch (priority) {
      case 'high': return 1;
      case 'medium': return 0.6;
      case 'low': return 0.3;
      default: return 0;
    }
  };

  const founderScore = getPriorityValue(founderPriority);
  const investorScore = getPriorityValue(investorPriority);

  // Calculate average of both scores and round to 2 decimal places
  return Math.round((founderScore + investorScore) / 2 * 100) / 100;
};

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

  const { data: matches, isLoading: matchesLoading } = useQuery({
    queryKey: ['matches'],
    queryFn: async () => {
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select(`
          *,
          founder:profiles!matches_founder_id_fkey(
            first_name,
            last_name,
            company_name
          ),
          investor:profiles!matches_investor_id_fkey(
            first_name,
            last_name,
            company_name
          )
        `);
      
      if (matchesError) throw matchesError;

      // Fetch priority matches for each match
      const matchesWithPriorities = await Promise.all(
        (matchesData || []).map(async (match) => {
          const { data: founderPriority } = await supabase
            .from('priority_matches')
            .select('priority')
            .eq('founder_id', match.founder_id)
            .eq('investor_id', match.investor_id)
            .single();

          const { data: investorPriority } = await supabase
            .from('priority_matches')
            .select('priority')
            .eq('founder_id', match.founder_id)
            .eq('investor_id', match.investor_id)
            .single();

          const score = getPriorityScore(
            founderPriority?.priority || null,
            investorPriority?.priority || null
          );

          return {
            ...match,
            match_score: score,
            founder_priority: founderPriority?.priority || null,
            investor_priority: investorPriority?.priority || null,
          };
        })
      );

      return matchesWithPriorities;
    },
  });

  if (profilesLoading || matchesLoading) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
        
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="matches">Matches</TabsTrigger>
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

          <TabsContent value="matches">
            <div className="bg-white rounded-lg shadow">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Founder</TableHead>
                    <TableHead>Investor</TableHead>
                    <TableHead>Match Score</TableHead>
                    <TableHead>Priorities</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matches?.map((match) => (
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
                        {match.match_score ? `${Math.round(match.match_score * 100)}%` : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>Founder: <span className={`font-medium ${
                            match.founder_priority === 'high' ? 'text-green-600' :
                            match.founder_priority === 'medium' ? 'text-yellow-600' :
                            match.founder_priority === 'low' ? 'text-red-600' : 'text-gray-500'
                          }`}>
                            {match.founder_priority || 'None'}
                          </span></p>
                          <p>Investor: <span className={`font-medium ${
                            match.investor_priority === 'high' ? 'text-green-600' :
                            match.investor_priority === 'medium' ? 'text-yellow-600' :
                            match.investor_priority === 'low' ? 'text-red-600' : 'text-gray-500'
                          }`}>
                            {match.investor_priority || 'None'}
                          </span></p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {match.founder_interest === null && match.investor_interest === null ? (
                          <span className="text-gray-500">Pending</span>
                        ) : match.founder_interest && match.investor_interest ? (
                          <span className="text-green-600">Matched</span>
                        ) : match.founder_interest === false || match.investor_interest === false ? (
                          <span className="text-red-600">Declined</span>
                        ) : (
                          <span className="text-yellow-600">Partial Interest</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(match.matched_at).toLocaleDateString()}
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
