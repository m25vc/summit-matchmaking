
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { sanitizeJson } from '@/lib/utils';

/**
 * Custom hook to manage sheet synchronization
 */
export function useSheetSync() {
  /**
   * Manually synchronize matches data to Google Sheets
   */
  const syncMatchesToSheets = async () => {
    try {
      // Get authenticated user session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('Authentication required to sync matches');
        return { error: 'Authentication required' };
      }

      // First get all matches from the database
      const { data: matchesData, error: matchesError } = await supabase
        .from('priority_matches')
        .select('*')
        .order('created_at', { ascending: false });

      if (matchesError) {
        console.error('Error fetching matches for sync:', matchesError);
        return { error: matchesError };
      }

      if (!matchesData || matchesData.length === 0) {
        console.log('No matches to sync to sheets');
        return { success: true, message: 'No matches to sync' };
      }

      // Sanitize the data before sending
      const sanitizedMatches = sanitizeJson(matchesData);
      
      // Call the Edge Function to sync data to sheets
      const response = await fetch(
        'https://qveetrrarbqedkcuwrcz.supabase.co/functions/v1/sync-to-sheets',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            matches: sanitizedMatches
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error syncing to sheets:', errorData);
        toast.error(`Failed to sync to sheets: ${errorData.error || response.statusText}`);
        return { error: errorData };
      }

      const result = await response.json();
      console.log('Sync to sheets successful:', result);
      toast.success('Successfully synced matches to sheets');
      return { success: true, data: result };
    } catch (error) {
      console.error('Exception in syncMatchesToSheets:', error);
      toast.error('Failed to sync matches to sheets');
      return { error };
    }
  };

  return { syncMatchesToSheets };
}
