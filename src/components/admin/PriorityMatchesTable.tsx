
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PriorityMatch } from '@/hooks/useAdminData';

interface PriorityMatchesTableProps {
  matches: PriorityMatch[] | null;
}

export const PriorityMatchesTable = ({ matches }: PriorityMatchesTableProps) => {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Founder</TableHead>
              <TableHead>Investor</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Set By</TableHead>
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
                  <br />
                  <span className="text-sm text-blue-600">
                    {match.founder?.email}
                  </span>
                </TableCell>
                <TableCell>
                  {match.investor?.first_name} {match.investor?.last_name}
                  <br />
                  <span className="text-sm text-gray-500">
                    {match.investor?.company_name}
                  </span>
                  <br />
                  <span className="text-sm text-blue-600">
                    {match.investor?.email}
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
                  {match.set_by_user?.first_name} {match.set_by_user?.last_name}
                  <br />
                  <span className="text-sm text-gray-500">
                    ({match.set_by_user?.user_type})
                  </span>
                  <br />
                  <span className="text-sm text-blue-600">
                    {match.set_by_user?.email}
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
    </div>
  );
};
