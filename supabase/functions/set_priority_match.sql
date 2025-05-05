
CREATE OR REPLACE FUNCTION public.set_priority_match(p_founder_id uuid, p_investor_id uuid, p_priority text, p_set_by uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO priority_matches (
    founder_id,
    investor_id,
    priority,
    not_interested,
    set_by
  ) VALUES (
    p_founder_id,
    p_investor_id,
    p_priority::match_priority,  -- Cast text input to match_priority enum
    FALSE,
    p_set_by
  )
  ON CONFLICT (founder_id, investor_id)
  DO UPDATE SET
    priority = p_priority::match_priority,  -- Cast text input to match_priority enum
    not_interested = FALSE,
    set_by = p_set_by;
END;
$$;
