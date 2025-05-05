
CREATE OR REPLACE FUNCTION public.set_priority_match(p_founder_id uuid, p_investor_id uuid, p_priority text, p_set_by uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Validate input to prevent casting errors
  IF p_priority IS NOT NULL AND p_priority NOT IN ('high', 'medium', 'low') THEN
    RAISE EXCEPTION 'Invalid priority value. Expected: high, medium, low, or null';
  END IF;

  INSERT INTO priority_matches (
    founder_id,
    investor_id,
    priority,
    not_interested,
    set_by
  ) VALUES (
    p_founder_id,
    p_investor_id,
    CASE WHEN p_priority IS NULL THEN NULL ELSE p_priority::match_priority END,  -- Safer casting
    FALSE,
    p_set_by
  )
  ON CONFLICT (founder_id, investor_id)
  DO UPDATE SET
    priority = CASE WHEN p_priority IS NULL THEN NULL ELSE p_priority::match_priority END,  -- Safer casting
    not_interested = FALSE,
    set_by = p_set_by;
END;
$$;
