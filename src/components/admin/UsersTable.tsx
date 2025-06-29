
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState, useEffect } from "react";
import { supabase } from '@/integrations/supabase/client';
import type { Profile } from '@/hooks/useAdminData';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface UsersTableProps {
  users: Profile[] | null;
  onDataCleared: () => void;
}

export const UsersTable = ({ users, onDataCleared }: UsersTableProps) => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState<{[key: string]: boolean}>({});

  // Get the current user's ID when component mounts
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };

    fetchCurrentUser();
  }, []);

  const makeAdmin = async (email: string | null) => {
    if (!email) {
      toast.error("No email provided");
      return;
    }

    setLoading(prev => ({ ...prev, [email]: true }));

    try {
      const { data, error } = await supabase.rpc('make_user_admin', {
        user_email: email
      });
      
      if (error) {
        console.error("Error making user admin:", error);
        toast.error("Failed to make user admin: " + error.message);
        return;
      }
      
      toast.success(`User ${email} is now an admin. Refresh to see changes.`);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("Exception making user admin:", error);
      toast.error("Failed to make user admin due to an unexpected error");
    } finally {
      setLoading(prev => ({ ...prev, [email]: false }));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-medium">Users</h2>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((profile) => (
              <TableRow key={profile.id}>
                <TableCell>{profile.first_name} {profile.last_name}</TableCell>
                <TableCell>{profile.company_name}</TableCell>
                <TableCell>{profile.role}</TableCell>
                <TableCell>{profile.user_type}</TableCell>
                <TableCell>
                  {profile.role !== 'admin' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      disabled={loading[profile.email || '']}
                      onClick={() => makeAdmin(profile.email)}
                    >
                      {loading[profile.email || ''] ? 'Processing...' : 'Make Admin'}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
