
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useSignupStatus = () => {
  const [signupsEnabled, setSignupsEnabled] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
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
          setError(error);
          // Default to enabled if there's an error fetching
          setSignupsEnabled(true);
          return;
        }

        setSignupsEnabled(data.value === 'true');
        setError(null);
      } catch (err) {
        console.error('Error:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
        // Default to enabled if there's an error
        setSignupsEnabled(true);
      } finally {
        setLoading(false);
      }
    };

    fetchSignupStatus();
  }, []);

  return { signupsEnabled, loading, error };
};
