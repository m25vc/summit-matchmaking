
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { UserPlus, UserX } from 'lucide-react';

export const SignupsToggle = () => {
  const [signupsEnabled, setSignupsEnabled] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [toggling, setToggling] = useState<boolean>(false);

  useEffect(() => {
    fetchSignupStatus();
  }, []);

  const fetchSignupStatus = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'signups_enabled')
        .single();

      if (error) {
        console.error('Error fetching signup status:', error);
        toast.error("Failed to load signup settings");
        return;
      }

      setSignupsEnabled(data.value === 'true');
    } catch (error) {
      console.error('Error:', error);
      toast.error("Failed to load signup settings");
    } finally {
      setLoading(false);
    }
  };

  const toggleSignups = async () => {
    try {
      setToggling(true);
      const { data, error } = await supabase.rpc('toggle_signups_enabled');
      
      if (error) {
        console.error("Error toggling signups:", error);
        toast.error("Failed to toggle signup settings");
        return;
      }
      
      setSignupsEnabled(data);
      toast.success(`Signups are now ${data ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to toggle signup settings");
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow mb-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Signup Management</h3>
          <p className="mt-1 text-sm text-gray-500">
            {loading ? 'Loading signup settings...' : 
              `New user registrations are currently ${signupsEnabled ? 'enabled' : 'disabled'}`}
          </p>
        </div>
        <Button
          onClick={toggleSignups}
          disabled={loading || toggling}
          variant={signupsEnabled ? "destructive" : "default"}
        >
          {toggling ? (
            "Processing..."
          ) : signupsEnabled ? (
            <>
              <UserX className="mr-2 h-4 w-4" />
              Disable Signups
            </>
          ) : (
            <>
              <UserPlus className="mr-2 h-4 w-4" />
              Enable Signups
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
