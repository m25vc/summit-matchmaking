import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export function EmailDebugger() {
  const [testEmail, setTestEmail] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [allEmails, setAllEmails] = useState<any[]>([]);
  const [isLoadingEmails, setIsLoadingEmails] = useState(false);

  const checkEmail = async () => {
    if (!testEmail) {
      toast.error("Please enter an email to test");
      return;
    }

    setIsChecking(true);
    try {
      const { data, error } = await supabase
        .from('allowed_emails')
        .select('*')
        .eq('email', testEmail.toLowerCase())
        .eq('active', true)
        .single();
      
      if (error) {
        setResult({ error: error.message, found: false });
      } else {
        setResult({ data, found: !!data });
      }
    } catch (error: any) {
      setResult({ error: error.message, found: false });
    } finally {
      setIsChecking(false);
    }
  };

  const loadAllEmails = async () => {
    setIsLoadingEmails(true);
    try {
      const { data, error } = await supabase
        .from('allowed_emails')
        .select('*')
        .order('added_at', { ascending: false });

      if (error) {
        toast.error(`Error loading emails: ${error.message}`);
      } else {
        setAllEmails(data || []);
        toast.success(`Loaded ${data?.length || 0} emails`);
      }
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsLoadingEmails(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold">Email Allowlist Debugger</h3>
      
      <Card>
        <CardHeader>
          <CardTitle>Test Email Check</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              type="email"
              placeholder="Enter email to test"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
            />
            <Button onClick={checkEmail} disabled={isChecking}>
              {isChecking ? "Checking..." : "Check"}
            </Button>
          </div>
          
          {result && (
            <div className={`p-3 rounded ${result.found ? 'bg-green-100' : 'bg-red-100'}`}>
              <strong>Result:</strong> {result.found ? "Email FOUND" : "Email NOT FOUND"}
              {result.error && <div className="text-red-600">Error: {result.error}</div>}
              {result.data && (
                <div className="text-sm mt-2">
                  <div>ID: {result.data.id}</div>
                  <div>Active: {result.data.active ? 'Yes' : 'No'}</div>
                  <div>Synced from sheet: {result.data.synced_from_sheet ? 'Yes' : 'No'}</div>
                  <div>Added: {new Date(result.data.added_at).toLocaleString()}</div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Allowed Emails</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={loadAllEmails} disabled={isLoadingEmails} className="mb-4">
            {isLoadingEmails ? "Loading..." : "Load All Emails"}
          </Button>
          
          {allEmails.length > 0 && (
            <div className="max-h-60 overflow-y-auto">
              <div className="text-sm text-gray-600 mb-2">
                Total: {allEmails.length} emails
              </div>
              {allEmails.map((email) => (
                <div key={email.id} className="flex justify-between items-center py-1 border-b">
                  <span>{email.email}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    email.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {email.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 