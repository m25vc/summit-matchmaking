
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { GoogleAuth } from 'https://esm.sh/google-auth-library@7.0.2';
import { sheets } from 'https://esm.sh/@googleapis/sheets@4.0.1';

// Constants
const ALLOWED_EMAILS_SHEET_NAME = "EBData"; // Sheet name
const EMAIL_COLUMN_INDEX = 5; // Column F is index 5 (0-based indexing)
const DATA_START_ROW = 3; // Row 4 is index 3 (0-based indexing)

serve(async (req: Request) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  console.log("📝 Function invoked with method:", req.method);

  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    console.log("🔎 Handling OPTIONS request - returning CORS headers");
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { authorization } = req.headers;
    if (!authorization) {
      console.error("🛑 Missing authorization header");
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("🔐 Authorization header present, validating JWT...");

    // Validate JWT
    const supabaseAdminClient = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    const jwt = authorization.replace('Bearer ', '');
    console.log("🔑 JWT extracted, getting user...");

    const { data: { user }, error: userError } = await supabaseAdminClient.auth.getUser(jwt);

    if (userError || !user) {
      console.error("⛔ User authentication failed:", userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized', details: userError }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("✅ User authenticated:", user.id);

    // Check if the user is an admin
    console.log("👑 Checking admin status for user:", user.id);
    const { data: profileData, error: profileError } = await supabaseAdminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error("❌ Error fetching profile:", profileError);
    }

    console.log("👤 User profile data:", profileData);

    if (profileData?.role !== 'admin') {
      console.error("🚫 User is not an admin. Role:", profileData?.role);
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("✅ Admin access confirmed");

    // Initialize Google Sheets client
    const credentials = {
      client_email: Deno.env.get('GOOGLE_SHEETS_CLIENT_EMAIL'),
      private_key: Deno.env.get('GOOGLE_SHEETS_API_KEY')?.replace(/\\n/g, '\n'),
    };

    console.log("🔄 Google credentials configured:");
    console.log("📧 Client email exists:", !!credentials.client_email);
    console.log("🔑 Private key exists:", !!credentials.private_key);

    try {
      console.log("🔄 Creating Google auth client...");
      const auth = new GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
      });

      console.log("✅ Google auth client created");
      console.log("🔄 Creating Google Sheets client...");

      const sheetsClient = sheets({
        version: 'v4',
        auth: await auth.getClient(),
      });

      console.log("✅ Google Sheets client created");

      // Get the dedicated spreadsheet ID for allowed emails
      const spreadsheetId = Deno.env.get('GOOGLE_SHEETS_ALLOWLIST_SPREADSHEET_ID');
      if (!spreadsheetId) {
        console.error("🛑 Missing spreadsheet ID in environment variables");
        throw new Error('Allowlist Spreadsheet ID not configured');
      }

      console.log("📊 Using spreadsheet ID:", spreadsheetId);
      console.log(`📑 Fetching data from sheet "${ALLOWED_EMAILS_SHEET_NAME}", column F, starting from row 4`);

      // Fetch spreadsheet metadata to verify it exists and we have access
      console.log("🔍 Fetching spreadsheet metadata to verify access...");
      try {
        const metadataResponse = await sheetsClient.spreadsheets.get({
          spreadsheetId,
        });
        console.log("✅ Successfully accessed spreadsheet metadata");
        console.log("📑 Spreadsheet title:", metadataResponse.data.properties?.title);
        console.log("📋 Available sheets:", metadataResponse.data.sheets?.map(s => s.properties?.title).join(", "));
      } catch (metaError) {
        console.error("❌ Failed to access spreadsheet metadata:", metaError);
        throw new Error(`Cannot access spreadsheet: ${metaError.message}`);
      }

      // Fetch allowed emails from Google Sheets - targeting column F
      console.log("🔄 Fetching values from spreadsheet...");
      const response = await sheetsClient.spreadsheets.values.get({
        spreadsheetId,
        range: `${ALLOWED_EMAILS_SHEET_NAME}!F:F`, // Column F for emails
      });

      const rows = response.data.values || [];
      console.log("📊 Raw data from spreadsheet:", JSON.stringify(rows));
      console.log(`📊 Total rows fetched: ${rows.length}`);
      
      // Skip to start row (4th row, index 3)
      // Extract emails, filter out empty rows
      const emails = rows.slice(DATA_START_ROW)
        .map(row => {
          const email = row[0]?.trim().toLowerCase();
          return email;
        })
        .filter(email => email && email.includes('@'));

      console.log(`✉️ Found ${emails.length} valid emails from sheet`);
      console.log("📧 First 5 emails (sample):", emails.slice(0, 5));

      if (emails.length === 0) {
        console.warn("⚠️ No valid emails found in the spreadsheet");
        return new Response(
          JSON.stringify({ error: 'No valid emails found in the spreadsheet' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Clear existing emails that were synced from sheet
      console.log("🗑️ Clearing existing synced emails from database...");
      const { error: clearError, count: deletedCount } = await supabaseAdminClient
        .from('allowed_emails')
        .delete()
        .eq('synced_from_sheet', true)
        .select('count');

      if (clearError) {
        console.error('❌ Error clearing existing emails:', clearError);
      } else {
        console.log(`✅ Deleted ${deletedCount} existing synced emails`);
      }

      // Insert new emails
      const emailRows = emails.map(email => ({
        email,
        synced_from_sheet: true,
        active: true
      }));

      console.log(`🔄 Inserting ${emailRows.length} emails into database...`);
      
      const { error: insertError, count: insertedCount } = await supabaseAdminClient
        .from('allowed_emails')
        .insert(emailRows)
        .select('count');

      if (insertError) {
        console.error('❌ Error inserting emails:', insertError);
        return new Response(
          JSON.stringify({ error: 'Error inserting emails', details: insertError }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`✅ Successfully inserted ${insertedCount} emails`);

      // Return success response
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Successfully synced ${emails.length} emails from dedicated Google Sheet (column F)`,
          totalEmails: emails.length,
          sampleEmails: emails.slice(0, 5) // Only show first 5 for security
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } catch (googleError) {
      console.error('❌ Google API Error:', googleError);
      console.error('❌ Error details:', googleError.stack || 'No stack trace available');
      return new Response(
        JSON.stringify({ error: 'Google API error', details: googleError.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
  } catch (error) {
    console.error('❌ Sync allowed emails error:', error);
    console.error('❌ Error stack:', error.stack || 'No stack trace available');
    
    return new Response(
      JSON.stringify({ error: 'Server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
