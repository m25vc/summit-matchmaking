
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet } from "lucide-react";
import type { PriorityMatch } from '@/hooks/useAdminData';

interface PriorityMatchesTableProps {
  matches: PriorityMatch[] | null;
}

export const PriorityMatchesTable = ({ matches }: PriorityMatchesTableProps) => {
  const exportToExcel = () => {
    if (!matches) return;

    // Convert matches to CSV format
    const headers = ['Founder Name', 'Founder Company', 'Founder Email', 
                    'Investor Name', 'Investor Company', 'Investor Email',
                    'Priority', 'Set By', 'Set By Role', 'Set By Email', 'Date'];
    
    const rows = matches.map(match => [
      `${match.founder?.first_name} ${match.founder?.last_name}`,
      match.founder?.company_name,
      match.founder?.email,
      `${match.investor?.first_name} ${match.investor?.last_name}`,
      match.investor?.company_name,
      match.investor?.email,
      match.priority,
      `${match.set_by_user?.first_name} ${match.set_by_user?.last_name}`,
      match.set_by_user?.user_type,
      match.set_by_user?.email,
      new Date(match.created_at).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell || ''}"`).join(','))
    ].join('\n');

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `priority-matches-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-4">
        <Button onClick={exportToExcel} className="gap-2">
          <FileSpreadsheet className="h-4 w-4" />
          Export to Excel
        </Button>
      </div>

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
