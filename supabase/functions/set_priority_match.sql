
CREATE OR REPLACE FUNCTION public.set_priority_match(p_founder_id uuid, p_investor_id uuid, p_priority text, p_set_by uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_debug_info text;
BEGIN
  -- Build debug info string with all input parameters for logging
  v_debug_info := 'FUNCTION INPUTS: p_founder_id=' || COALESCE(p_founder_id::text, 'NULL') || 
                  ', p_investor_id=' || COALESCE(p_investor_id::text, 'NULL') || 
                  ', p_priority=' || COALESCE(p_priority, 'NULL') || 
                  ', p_set_by=' || COALESCE(p_set_by::text, 'NULL');
  
  RAISE LOG 'set_priority_match - BEGIN - %', v_debug_info;
  
  -- Validate input to prevent casting errors
  IF p_priority IS NOT NULL AND p_priority NOT IN ('high', 'medium', 'low') THEN
    RAISE LOG 'set_priority_match - VALIDATION ERROR - Invalid priority value: %', p_priority;
    RAISE EXCEPTION 'Invalid priority value. Expected: high, medium, low, or null';
  END IF;

  RAISE LOG 'set_priority_match - VALIDATION PASSED - About to execute insert/update';

  INSERT INTO priority_matches (
    founder_id,
    investor_id,
    priority,
    not_interested,
    set_by
  ) VALUES (
    p_founder_id,
    p_investor_id,
    -- Default to 'low' if p_priority is NULL since priority column is NOT NULL
    CASE WHEN p_priority IS NULL THEN 'low'::match_priority ELSE p_priority::match_priority END,
    FALSE,
    p_set_by
  )
  ON CONFLICT (founder_id, investor_id)
  DO UPDATE SET
    priority = CASE WHEN p_priority IS NULL THEN 'low'::match_priority ELSE p_priority::match_priority END,
    not_interested = FALSE,
    set_by = p_set_by;
    
  RAISE LOG 'set_priority_match - SUCCESS - Operation completed successfully';
END;
$$;
