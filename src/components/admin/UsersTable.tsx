
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Profile } from '@/hooks/useAdminData';

interface UsersTableProps {
  users: Profile[] | null;
}

export const UsersTable = ({ users }: UsersTableProps) => {
  return (
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
  );
};
