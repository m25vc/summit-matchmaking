
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from "sonner";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { UserPlus, X, UserMinus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Team = Database['public']['Tables']['teams']['Row'];

interface TeamMember {
  id: string;
  profile_id: string;
  team_id: string;
  role: string;
  joined_at: string;
  profile: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface TeamMembersListProps {
  team: Team;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TeamMembersList({ 
  team, 
  open, 
  onOpenChange 
}: TeamMembersListProps) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const fetchMembers = async () => {
      if (!team?.id || !open) return;
      
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('team_members')
          .select(`
            *,
            profile:profiles(
              first_name,
              last_name,
              email
            )
          `)
          .eq('team_id', team.id);

        if (error) {
          console.error('Error fetching team members:', error);
          toast.error('Failed to load team members');
          return;
        }

        setMembers(data as unknown as TeamMember[]);
      } catch (error) {
        console.error('Error:', error);
        toast.error('Failed to load team members');
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [team, open]);

  const inviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    try {
      setInviting(true);
      
      // First check if the email exists in the profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email.trim())
        .maybeSingle();

      if (profileError) {
        console.error('Error finding user:', profileError);
        toast.error('Error inviting user');
        return;
      }

      if (!profileData) {
        toast.error('No user found with that email address');
        return;
      }

      const profile_id = profileData.id;
      
      // Check if the user is already a member
      const { data: existingMember, error: existingError } = await supabase
        .from('team_members')
        .select('id')
        .eq('team_id', team.id)
        .eq('profile_id', profile_id)
        .maybeSingle();
        
      if (existingError) {
        console.error('Error checking existing member:', existingError);
        toast.error('Error inviting user');
        return;
      }

      if (existingMember) {
        toast.error('This user is already a member of the team');
        return;
      }
      
      // Add user to team
      const { error } = await supabase
        .from('team_members')
        .insert({
          team_id: team.id,
          profile_id,
          role: 'member'
        });
        
      if (error) {
        console.error('Error adding team member:', error);
        toast.error('Failed to add team member');
        return;
      }

      toast.success('Member added successfully!');
      setEmail('');
      
      // Refresh members list
      const { data: updatedMembers, error: refreshError } = await supabase
        .from('team_members')
        .select(`
          *,
          profile:profiles(
            first_name,
            last_name,
            email
          )
        `)
        .eq('team_id', team.id);
        
      if (!refreshError && updatedMembers) {
        setMembers(updatedMembers as unknown as TeamMember[]);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to add team member');
    } finally {
      setInviting(false);
    }
  };

  const removeMember = async (memberId: string, profileId: string) => {
    // Don't allow removing yourself if you're the last admin
    if (profileId === currentUserId) {
      const admins = members.filter(m => m.role === 'admin');
      if (admins.length === 1 && admins[0].profile_id === currentUserId) {
        toast.error("You can't remove yourself as you're the only admin");
        return;
      }
    }
    
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId);
        
      if (error) {
        console.error('Error removing team member:', error);
        toast.error('Failed to remove team member');
        return;
      }

      toast.success('Member removed from team');
      setMembers(prev => prev.filter(m => m.id !== memberId));
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to remove team member');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Team Members - {team?.name}</DialogTitle>
          <DialogDescription>
            Manage the members of your team
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <form onSubmit={inviteMember} className="flex space-x-2">
            <div className="flex-1">
              <Label htmlFor="email" className="sr-only">
                Email
              </Label>
              <Input
                id="email"
                placeholder="Enter user email to add"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={inviting || !email.trim()}>
              <UserPlus className="h-4 w-4 mr-2" />
              {inviting ? 'Adding...' : 'Add'}
            </Button>
          </form>
        </div>

        <div className="mt-6">
          <h3 className="font-medium mb-3">Current Members ({members.length})</h3>
          
          {loading ? (
            <p className="text-center py-4">Loading members...</p>
          ) : members.length === 0 ? (
            <p className="text-center py-4 text-muted-foreground">No members found</p>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-md">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarFallback>
                        {member.profile.first_name.charAt(0)}
                        {member.profile.last_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {member.profile.first_name} {member.profile.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {member.profile.email} • {member.role}
                      </p>
                    </div>
                  </div>
                  {/* Don't show remove button for yourself if you're the only admin */}
                  {!(member.profile_id === currentUserId && 
                     member.role === 'admin' && 
                     members.filter(m => m.role === 'admin').length === 1) && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeMember(member.id, member.profile_id)}
                    >
                      <UserMinus className="h-4 w-4" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
