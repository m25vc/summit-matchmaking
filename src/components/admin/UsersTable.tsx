
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
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import type { Profile } from '@/hooks/useAdminData';

interface UsersTableProps {
  users: Profile[] | null;
  onDataCleared: () => void;
}

export const UsersTable = ({ users, onDataCleared }: UsersTableProps) => {
  const [isClearing, setIsClearing] = useState(false);
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

  const clearAllData = async () => {
    if (!currentUserId) {
      toast.error("Could not identify the current admin user. Please refresh the page and try again.");
      return;
    }

    if (!confirm("⚠️ WARNING: Are you sure you want to clear ALL users and data except your admin account? This action cannot be undone.")) {
      return;
    }

    try {
      setIsClearing(true);
      
      // First check if we have connectivity to the edge function
      toast.info("Starting data clearing process...");
      
      const { data, error } = await supabase.functions.invoke('create-test-users', {
        body: { 
          action: 'clear-all',
          adminId: currentUserId 
        }
      });

      if (error) {
        console.error("Edge function error:", error);
        throw new Error(`Failed to clear data: ${error.message}`);
      }

      if (!data) {
        throw new Error("No response received from the server");
      }

      console.log("Clear all response:", data);
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      toast.success("All data has been cleared successfully (except your admin account).");
      
      // Notify parent that data was cleared
      onDataCleared();
      // Force a complete page reload after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error: any) {
      console.error("Failed to clear all data:", error);
      toast.error(`Error clearing data: ${error.message || "Unknown error"}`);
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
      
      toast.info("Starting test data clearing process...");
      
      const { data, error } = await supabase.functions.invoke('create-test-users', {
        body: { action: 'clear' }
      });

      if (error) {
        console.error("Edge function error:", error);
        throw new Error(`Failed to clear test data: ${error.message}`);
      }

      if (!data) {
        throw new Error("No response received from the server");
      }
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      console.log("Clear test data response:", data);
      
      toast.success("All test users and data have been cleared successfully.");
      
      // Notify parent that data was cleared
      onDataCleared();
      // Force a complete page reload after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error: any) {
      console.error("Failed to clear test data:", error);
      toast.error(`Error clearing test data: ${error.message || "Unknown error"}`);
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
            disabled={isClearing || !currentUserId}
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
