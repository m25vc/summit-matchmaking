
CREATE OR REPLACE FUNCTION public.set_priority_match(p_founder_id uuid, p_investor_id uuid, p_priority text, p_set_by uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_debug_info text;
  v_sanitized_priority text;
BEGIN
  -- Build debug info string with all input parameters for logging
  v_debug_info := 'FUNCTION INPUTS: p_founder_id=' || COALESCE(p_founder_id::text, 'NULL') || 
                  ', p_investor_id=' || COALESCE(p_investor_id::text, 'NULL') || 
                  ', p_priority=' || COALESCE(p_priority, 'NULL') || 
                  ', p_set_by=' || COALESCE(p_set_by::text, 'NULL');
  
  RAISE LOG 'set_priority_match - BEGIN - %', v_debug_info;
  
  -- Explicitly sanitize the priority string to remove ALL control characters
  -- This is a much more aggressive cleaning approach for maximum safety
  v_sanitized_priority := regexp_replace(COALESCE(p_priority, 'low'), '[[:cntrl:]]', '', 'g');
  
  RAISE LOG 'set_priority_match - SANITIZED PRIORITY - before: %, after: %', p_priority, v_sanitized_priority;
  
  -- Validate input to prevent casting errors
  IF v_sanitized_priority IS NOT NULL AND v_sanitized_priority NOT IN ('high', 'medium', 'low') THEN
    RAISE LOG 'set_priority_match - VALIDATION ERROR - Invalid priority value: %', v_sanitized_priority;
    RAISE EXCEPTION 'Invalid priority value. Expected: high, medium, low';
  END IF;

  RAISE LOG 'set_priority_match - VALIDATION PASSED - About to execute insert/update';

  -- Use the sanitized priority value in the query
  INSERT INTO priority_matches (
    founder_id,
    investor_id,
    priority,
    not_interested,
    set_by
  ) VALUES (
    p_founder_id,
    p_investor_id,
    -- Default to 'low' if priority is NULL
    CASE WHEN v_sanitized_priority IS NULL OR v_sanitized_priority = '' 
         THEN 'low'::match_priority 
         ELSE v_sanitized_priority::match_priority 
    END,
    FALSE,
    p_set_by
  )
  ON CONFLICT (founder_id, investor_id)
  DO UPDATE SET
    priority = CASE WHEN v_sanitized_priority IS NULL OR v_sanitized_priority = '' 
                    THEN 'low'::match_priority 
                    ELSE v_sanitized_priority::match_priority 
               END,
    not_interested = FALSE,
    set_by = p_set_by;
    
  RAISE LOG 'set_priority_match - SUCCESS - Operation completed successfully';
END;
$$;
