
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
                    'Mutual Match', 'Score', 'Date'];
    
    const rows = matches.map(match => [
      `${match.founder?.first_name} ${match.founder?.last_name}`,
      match.founder?.company_name,
      match.founder?.email,
      `${match.investor?.first_name} ${match.investor?.last_name}`,
      match.investor?.company_name,
      match.investor?.email,
      match.has_mutual_match ? 'Yes' : 'No',
      match.score,
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
              <TableHead>Score</TableHead>
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
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">{match.score}</span>
                    {match.has_mutual_match && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Mutual Match
                      </span>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
