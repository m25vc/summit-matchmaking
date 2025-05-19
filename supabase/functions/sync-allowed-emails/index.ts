
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { GoogleAuth } from 'https://esm.sh/google-auth-library@7.0.2';
import { sheets } from 'https://esm.sh/@googleapis/sheets@4.0.1';

// Constants
const ALLOWED_EMAILS_SHEET_NAME = "Allowed Emails"; // Adjust if your sheet name is different
const EMAIL_COLUMN_INDEX = 0; // Assuming emails are in column A, adjust if different

serve(async (req: Request) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { authorization } = req.headers;
    if (!authorization) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate JWT
    const supabaseAdminClient = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    const jwt = authorization.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdminClient.auth.getUser(jwt);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', details: userError }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if the user is an admin
    const { data: profileData, error: profileError } = await supabaseAdminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profileData?.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Google Sheets client
    const credentials = {
      client_email: Deno.env.get('GOOGLE_SHEETS_CLIENT_EMAIL'),
      private_key: Deno.env.get('GOOGLE_SHEETS_API_KEY')?.replace(/\\n/g, '\n'),
    };

    const auth = new GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheetsClient = sheets({
      version: 'v4',
      auth: await auth.getClient(),
    });

    // Get the dedicated spreadsheet ID for allowed emails from environment variable
    const spreadsheetId = Deno.env.get('GOOGLE_SHEETS_ALLOWLIST_SPREADSHEET_ID');
    if (!spreadsheetId) {
      throw new Error('Allowlist Spreadsheet ID not configured');
    }

    // Fetch allowed emails from Google Sheets
    const response = await sheetsClient.spreadsheets.values.get({
      spreadsheetId,
      range: `${ALLOWED_EMAILS_SHEET_NAME}!A:A`, // Assuming emails are in column A
    });

    const rows = response.data.values || [];
    
    // Skip header row if present
    const startRow = rows[0] && rows[0][0]?.toLowerCase().includes('email') ? 1 : 0;
    
    // Extract emails, filter out empty rows
    const emails = rows.slice(startRow)
      .map(row => row[EMAIL_COLUMN_INDEX]?.trim().toLowerCase())
      .filter(email => email && email.includes('@'));

    console.log(`Found ${emails.length} emails from sheet`);

    if (emails.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No valid emails found in the spreadsheet' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Clear existing emails that were synced from sheet
    const { error: clearError } = await supabaseAdminClient
      .from('allowed_emails')
      .delete()
      .eq('synced_from_sheet', true);

    if (clearError) {
      console.error('Error clearing existing emails:', clearError);
    }

    // Insert new emails
    const emailRows = emails.map(email => ({
      email,
      synced_from_sheet: true,
      active: true
    }));

    const { error: insertError } = await supabaseAdminClient
      .from('allowed_emails')
      .insert(emailRows);

    if (insertError) {
      return new Response(
        JSON.stringify({ error: 'Error inserting emails', details: insertError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully synced ${emails.length} emails from dedicated Google Sheet` 
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Sync allowed emails error:', error);
    
    return new Response(
      JSON.stringify({ error: 'Server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
