
CREATE OR REPLACE FUNCTION public.sync_matches_to_sheets()
RETURNS TRIGGER AS $$
BEGIN
  -- Make HTTP request to our Edge Function
  PERFORM net.http_post(
    url:='https://qveetrrarbqedkcuwrcz.supabase.co/functions/v1/sync-to-sheets',
    headers:='{
      "Content-Type": "application/json",
      "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"
    }'::jsonb,
    body:=json_build_object(
      'matches',
      (SELECT json_agg(row_to_json(t))
       FROM (
         SELECT *
         FROM priority_matches
         ORDER BY created_at DESC
       ) t)
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
