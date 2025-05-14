
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Users, UserPlus, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { CreateTeamDialog } from '@/components/teams/CreateTeamDialog';
import { TeamMembersList } from '@/components/teams/TeamMembersList';
import type { Database } from '@/integrations/supabase/types';

type Team = Database['public']['Tables']['teams']['Row'] & {
  _count?: { members: number }
};

export default function Teams() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState<Team[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        
        // Get current user's profile
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/auth');
          return;
        }

        // Get teams the user belongs to
        const { data: teamMembers, error: teamMembersError } = await supabase
          .from('team_members')
          .select('team_id')
          .eq('profile_id', user.id);

        if (teamMembersError) {
          console.error('Error fetching team members:', teamMembersError);
          toast.error('Failed to load teams');
          return;
        }
        
        if (!teamMembers || teamMembers.length === 0) {
          setTeams([]);
          setLoading(false);
          return;
        }

        const teamIds = teamMembers.map(tm => tm.team_id);
        
        // Get team details
        const { data: teamsData, error: teamsError } = await supabase
          .from('teams')
          .select('*')
          .in('id', teamIds);

        if (teamsError) {
          console.error('Error fetching teams:', teamsError);
          toast.error('Failed to load teams');
          return;
        }

        // For each team, get the count of members
        const teamsWithCounts = await Promise.all(
          teamsData.map(async (team) => {
            const { count, error } = await supabase
              .from('team_members')
              .select('*', { count: 'exact', head: true })
              .eq('team_id', team.id);
              
            return {
              ...team,
              _count: { members: count || 0 }
            };
          })
        );

        setTeams(teamsWithCounts);
      } catch (error) {
        console.error('Error:', error);
        toast.error('Failed to load teams');
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [navigate]);

  const handleCreateTeam = async (name: string, description: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to create a team');
        return;
      }

      const { data, error } = await supabase
        .from('teams')
        .insert({
          name,
          description,
          created_by: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating team:', error);
        toast.error('Failed to create team');
        return;
      }

      toast.success('Team created successfully!');
      setTeams(prev => [...prev, { ...data, _count: { members: 1 } }]);
      setShowCreateDialog(false);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to create team');
    }
  };

  const viewTeamDetails = (team: Team) => {
    setSelectedTeam(team);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Teams</h1>
          <Button onClick={() => setShowCreateDialog(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Create Team
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p>Loading teams...</p>
          </div>
        ) : teams.length === 0 ? (
          <div className="text-center p-10 border rounded-lg bg-muted/20">
            <Users className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No Teams Yet</h3>
            <p className="mt-2 text-muted-foreground">
              Create a team to collaborate with other founders or investors.
            </p>
            <Button className="mt-4" onClick={() => setShowCreateDialog(true)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Create Team
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {teams.map((team) => (
              <Card key={team.id} className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    {team.name}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {team.description || "No description provided"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="mr-2 h-4 w-4" />
                    <span>{team._count?.members || 1} members</span>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/20 flex justify-between">
                  <Button variant="outline" size="sm" onClick={() => viewTeamDetails(team)}>
                    <UserPlus className="mr-2 h-4 w-4" /> Manage Members
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="mr-2 h-4 w-4" /> Settings
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        <CreateTeamDialog 
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onSubmit={handleCreateTeam}
        />
        
        {selectedTeam && (
          <TeamMembersList
            team={selectedTeam}
            open={!!selectedTeam}
            onOpenChange={(open) => !open && setSelectedTeam(null)}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
