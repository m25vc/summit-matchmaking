
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { sanitizeJson } from '@/lib/utils';
import { useState } from 'react';

/**
 * Custom hook to manage sheet synchronization
 */
export function useSheetSync() {
  const [isSyncing, setIsSyncing] = useState(false);

  /**
   * Manually synchronize matches data to Google Sheets
   */
  const syncMatchesToSheets = async () => {
    if (isSyncing) {
      console.log('Sync already in progress, ignoring request');
      return { success: false, error: 'Sync already in progress' };
    }

    try {
      setIsSyncing(true);
      console.log('Starting sheet sync process');
      
      // Get authenticated user session with improved verification
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Authentication error:', sessionError);
        toast.error('Authentication required to sync matches');
        return { success: false, error: sessionError };
      }

      const session = sessionData?.session;
      if (!session) {
        console.error('No active session found');
        toast.error('Authentication required to sync matches');
        return { success: false, error: 'Authentication required' };
      }

      // Check if access token is valid and not expired
      if (!session.access_token) {
        console.error('Invalid access token');
        toast.error('Your session appears to be invalid. Please sign in again.');
        return { success: false, error: 'Invalid access token' };
      }

      // First get all matches from the database
      const { data: matchesData, error: matchesError } = await supabase
        .from('priority_matches')
        .select('*')
        .order('created_at', { ascending: false });

      if (matchesError) {
        console.error('Error fetching matches for sync:', matchesError);
        toast.error(`Failed to fetch matches: ${matchesError.message}`);
        return { success: false, error: matchesError };
      }

      if (!matchesData || matchesData.length === 0) {
        console.log('No matches to sync to sheets');
        toast.success('No matches to sync');
        return { success: true, message: 'No matches to sync' };
      }

      // Sanitize the data before sending
      const sanitizedMatches = sanitizeJson(matchesData);
      
      console.log(`Sending ${sanitizedMatches.length} matches to sync function`);
      
      // Call the Edge Function to sync data to sheets with improved headers
      const response = await fetch(
        'https://qveetrrarbqedkcuwrcz.supabase.co/functions/v1/sync-to-sheets',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            'X-Client-Info': 'Manual Sync', // Add info for easier debugging
          },
          body: JSON.stringify({
            matches: sanitizedMatches
          })
        }
      );

      // Check for HTTP errors with more detailed error logging
      if (!response.ok) {
        let errorMessage = `HTTP error: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData?.error || errorMessage;
          console.error('Detailed sync error:', errorData);
        } catch (e) {
          console.error('Could not parse error response:', e);
        }
        console.error('Error syncing to sheets:', errorMessage);
        toast.error(`Failed to sync: ${errorMessage}`);
        return { success: false, error: errorMessage };
      }

      const result = await response.json();
      console.log('Sync to sheets successful:', result);
      toast.success('Successfully synced matches to sheets');
      return { success: true, data: result };
    } catch (error) {
      console.error('Exception in syncMatchesToSheets:', error);
      toast.error(`Sync error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { success: false, error };
    } finally {
      setIsSyncing(false);
    }
  };

  return { syncMatchesToSheets, isSyncing };
}
