
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
    const headers = ['Initiator Name', 'Initiator Company', 'Initiator Type', 'Initiator Email', 
                    'Target Name', 'Target Company', 'Target Type', 'Target Email',
                    'Mutual Match', 'Score', 'Date'];
    
    const rows = matches.map(match => [
      `${match.initiator?.first_name} ${match.initiator?.last_name}`,
      match.initiator?.company_name,
      match.initiator?.user_type,
      match.initiator?.email,
      `${match.target?.first_name} ${match.target?.last_name}`,
      match.target?.company_name,
      match.target?.user_type,
      match.target?.email,
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
              <TableHead>Initiator</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {matches?.map((match) => (
              <TableRow key={match.id}>
                <TableCell>
                  {match.initiator?.first_name} {match.initiator?.last_name}
                  <br />
                  <span className="text-sm text-gray-500">
                    {match.initiator?.company_name}
                  </span>
                  <br />
                  <span className="text-xs text-gray-400">
                    {match.initiator?.user_type}
                  </span>
                  <br />
                  <span className="text-sm text-blue-600">
                    {match.initiator?.email}
                  </span>
                </TableCell>
                <TableCell>
                  {match.target?.first_name} {match.target?.last_name}
                  <br />
                  <span className="text-sm text-gray-500">
                    {match.target?.company_name}
                  </span>
                  <br />
                  <span className="text-xs text-gray-400">
                    {match.target?.user_type}
                  </span>
                  <br />
                  <span className="text-sm text-blue-600">
                    {match.target?.email}
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
