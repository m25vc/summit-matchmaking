
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

interface UsersTableProps {
  users: Profile[] | null;
  onDataCleared: () => void;
}

export const UsersTable = ({ users, onDataCleared }: UsersTableProps) => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

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
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((profile) => (
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
    </div>
  );
};
