
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import type { Profile } from '@/hooks/useAdminData';

interface UsersTableProps {
  users: Profile[] | null;
  onDataCleared: () => void;
}

export const UsersTable = ({ users, onDataCleared }: UsersTableProps) => {
  const [isClearing, setIsClearing] = useState(false);

  const clearAllData = async () => {
    if (!confirm("⚠️ WARNING: Are you sure you want to clear ALL users and data except your admin account? This action cannot be undone.")) {
      return;
    }

    try {
      setIsClearing(true);
      const { error } = await supabase.functions.invoke('create-test-users', {
        body: { action: 'clear-all' }
      });

      if (error) {
        throw new Error(`Error clearing data: ${error.message}`);
      }

      toast.success("All data has been cleared successfully (except your admin account).");
      onDataCleared();
    } catch (error) {
      console.error("Failed to clear all data:", error);
      toast.error(error.message || "Failed to clear all data. Please try again.");
    } finally {
      setIsClearing(false);
    }
  };

  const clearTestData = async () => {
    if (!confirm("Are you sure you want to clear all test users and test data? This action cannot be undone.")) {
      return;
    }

    try {
      setIsClearing(true);
      const { error } = await supabase.functions.invoke('create-test-users', {
        body: { action: 'clear' }
      });

      if (error) {
        throw new Error(`Error clearing data: ${error.message}`);
      }

      toast.success("All test users and data have been cleared successfully.");
      onDataCleared();
    } catch (error) {
      console.error("Failed to clear test data:", error);
      toast.error(error.message || "Failed to clear test data. Please try again.");
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-medium">Users</h2>
        <div className="flex gap-2">
          <Button 
            onClick={clearTestData} 
            variant="destructive"
            disabled={isClearing}
            className="gap-2"
          >
            {isClearing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Clearing...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Clear All Test Data
              </>
            )}
          </Button>
          <Button 
            onClick={clearAllData} 
            variant="destructive"
            disabled={isClearing}
            className="gap-2"
          >
            {isClearing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Clearing...
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4" />
                Clear ALL Data (except admin)
              </>
            )}
          </Button>
        </div>
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
