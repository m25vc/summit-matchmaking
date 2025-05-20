
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
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
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
  const [syncLog, setSyncLog] = useState<string[]>([]);
  const [showSyncLog, setShowSyncLog] = useState(false);

  useEffect(() => {
    fetchAllowedEmails();
  }, []);

  // Fetch allowed emails on component mount
  const fetchAllowedEmails = async () => {
    setLoading(true);
    console.log("Fetching allowed emails...");
    try {
      const { data, error } = await supabase
        .from("allowed_emails")
        .select("*")
        .order("added_at", { ascending: false });

      if (error) {
        throw error;
      }

      console.log(`Fetched ${data?.length || 0} allowed emails`);
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
    setSyncLog([]);
    
    try {
      console.log("Starting email sync from Google Sheet...");
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error("No active session found");
        toast.error("Authentication required");
        return;
      }

      console.log("Session found, proceeding with sync");
      addToSyncLog("Session found, calling sync-allowed-emails function");
      
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

        addToSyncLog(`Response status: ${response.status}`);
        
        // Get the response body
        const responseText = await response.text();
        addToSyncLog(`Raw response: ${responseText.substring(0, 100)}...`);
        
        // Try to parse as JSON
        let result;
        try {
          result = JSON.parse(responseText);
        } catch (parseError) {
          console.error("Failed to parse response as JSON:", parseError);
          addToSyncLog("Response was not valid JSON");
          throw new Error(`Invalid response format: ${responseText}`);
        }

        if (!response.ok) {
          console.error("Error response from sync function:", result);
          addToSyncLog(`Error: ${result.error || 'Unknown error'}`);
          throw new Error(result.error || "Failed to sync emails");
        }

        console.log("Sync successful:", result);
        addToSyncLog(`Success: ${result.message || 'Emails synced'}`);
        
        if (result.stats) {
          addToSyncLog(`Stats: ${result.stats.totalEmails} emails found`);
          addToSyncLog(`${result.stats.deleted} emails removed, ${result.stats.inserted} emails added`);
        }
        
        toast.success(result.message || "Successfully synced emails from sheet");
        setShowSyncLog(true);
        fetchAllowedEmails();
      } catch (fetchError: any) {
        console.error("Fetch error:", fetchError);
        addToSyncLog(`Fetch error: ${fetchError.message}`);
        throw fetchError;
      }
    } catch (error: any) {
      console.error("Error syncing emails:", error);
      addToSyncLog(`Error: ${error.message}`);
      toast.error(`Failed to sync emails: ${error.message}`);
      setShowSyncLog(true);
    } finally {
      setSyncing(false);
    }
  };

  const addToSyncLog = (message: string) => {
    setSyncLog(prev => [...prev, `[${new Date().toISOString()}] ${message}`]);
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
          <Sheet open={showSyncLog} onOpenChange={setShowSyncLog}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={syncEmailsFromSheet}
                disabled={syncing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
                {syncing ? "Syncing..." : "Sync from Sheet"}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px]">
              <SheetHeader>
                <SheetTitle>Sync Log</SheetTitle>
                <SheetDescription>
                  Details about the email synchronization process
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                <div className="bg-gray-50 p-4 rounded-md border">
                  <h3 className="text-sm font-medium mb-2">Synchronization Log</h3>
                  <pre className="text-xs font-mono overflow-auto max-h-[400px] p-2 bg-gray-100 rounded whitespace-pre-wrap">
                    {syncLog.length > 0 ? syncLog.join('\n') : 'No logs available'}
                  </pre>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowSyncLog(false)}
                  >
                    Close
                  </Button>
                  <Button 
                    onClick={fetchAllowedEmails}
                  >
                    Refresh Email List
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
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
