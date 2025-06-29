
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Plus, RefreshCw, Trash } from "lucide-react";

interface AllowedEmail {
  id: string;
  email: string;
  added_at: string;
  synced_from_sheet: boolean;
  active: boolean;
}

export function AllowedEmailsTable() {
  const [emails, setEmails] = useState<AllowedEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [addingEmail, setAddingEmail] = useState(false);

  useEffect(() => {
    fetchAllowedEmails();
  }, []);

  // Fetch allowed emails on component mount
  const fetchAllowedEmails = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("allowed_emails")
        .select("*")
        .order("added_at", { ascending: false });

      if (error) {
        throw error;
      }

      setEmails(data || []);
    } catch (error) {
      console.error("Error fetching allowed emails:", error);
      toast.error("Failed to load allowed emails");
    } finally {
      setLoading(false);
    }
  };

  // Sync emails from Google Sheet
  const syncEmailsFromSheet = async () => {
    setSyncing(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Authentication required");
        return;
      }
      
      try {
        const response = await fetch(
          "https://qveetrrarbqedkcuwrcz.supabase.co/functions/v1/sync-allowed-emails",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${session.access_token}`,
            },
          }
        );
        
        // Get the response body
        const responseText = await response.text();
        
        // Try to parse as JSON
        let result;
        try {
          result = JSON.parse(responseText);
        } catch (parseError) {
          throw new Error(`Invalid response format: ${responseText}`);
        }

        if (!response.ok) {
          throw new Error(result.error || "Failed to sync emails");
        }
        
        toast.success(result.message || "Successfully synced emails from sheet");
        fetchAllowedEmails();
      } catch (fetchError: any) {
        throw fetchError;
      }
    } catch (error: any) {
      console.error("Error syncing emails:", error);
      toast.error(`Failed to sync emails: ${error.message}`);
    } finally {
      setSyncing(false);
    }
  };

  // Add a new email manually
  const addEmail = async () => {
    if (!newEmail || !newEmail.includes('@')) {
      toast.error("Please enter a valid email address");
      return;
    }

    setAddingEmail(true);
    try {
      const { error } = await supabase
        .from("allowed_emails")
        .insert([
          { 
            email: newEmail.toLowerCase().trim(),
            synced_from_sheet: false,
            active: true
          }
        ]);

      if (error) {
        if (error.code === "23505") { // Unique violation
          toast.error("This email is already in the allowed list");
        } else {
          throw error;
        }
      } else {
        toast.success(`Added ${newEmail} to allowed list`);
        setNewEmail("");
        fetchAllowedEmails();
      }
    } catch (error) {
      console.error("Error adding email:", error);
      toast.error(`Failed to add email: ${error.message}`);
    } finally {
      setAddingEmail(false);
    }
  };

  // Remove an email from the allowed list
  const removeEmail = async (id: string, email: string) => {
    try {
      const { error } = await supabase
        .from("allowed_emails")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }

      toast.success(`Removed ${email} from allowed list`);
      setEmails(emails.filter(e => e.id !== id));
    } catch (error) {
      console.error("Error removing email:", error);
      toast.error(`Failed to remove email: ${error.message}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-medium">Allowed Emails</h2>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={syncEmailsFromSheet}
            disabled={syncing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing..." : "Sync from Sheet"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAllowedEmails}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <div className="relative flex-1">
          <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="email"
            placeholder="Enter email to add manually"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          onClick={addEmail}
          disabled={addingEmail || !newEmail}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Email
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Added</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  Loading...
                </TableCell>
              </TableRow>
            ) : emails.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  No emails in allowlist. Add some or sync from sheet.
                </TableCell>
              </TableRow>
            ) : (
              emails.map((email) => (
                <TableRow key={email.id}>
                  <TableCell>{email.email}</TableCell>
                  <TableCell>
                    {new Date(email.added_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {email.synced_from_sheet ? "Google Sheet" : "Added Manually"}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEmail(email.id, email.email)}
                    >
                      <Trash className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
