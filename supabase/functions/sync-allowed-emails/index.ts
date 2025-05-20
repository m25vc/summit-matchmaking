
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { create } from "https://deno.land/x/djwt@v2.8/mod.ts";
import { sheets } from 'https://esm.sh/@googleapis/sheets@4.0.1';

// Constants
const ALLOWED_EMAILS_SHEET_NAME = "EBData"; // Sheet name
const EMAIL_COLUMN_INDEX = 5; // Column F is index 5 (0-based indexing)
const DATA_START_ROW = 3; // Row 4 is index 3 (0-based indexing)

// Define CORS headers - must be added to all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

serve(async (req: Request) => {
  console.log("📝 Function invoked with method:", req.method);
  console.log("📝 Request headers:", JSON.stringify(Object.fromEntries(req.headers.entries()), null, 2));

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    console.log("🔎 Handling OPTIONS request - returning CORS headers");
    return new Response('ok', { 
      status: 204,
      headers: corsHeaders 
    });
  }

  try {
    // Parse request body
    const { authorization } = req.headers;
    if (!authorization) {
      console.error("🛑 Missing authorization header");
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log("🔐 Authorization header present, validating JWT...");
    console.log("🔐 Authorization header length:", authorization.length);
    console.log("🔐 Authorization header first 20 chars:", authorization.substring(0, 20));

    // Validate JWT
    const supabaseAdminClient = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    console.log("🔄 Supabase admin client created");
    console.log("🔄 SUPABASE_URL set:", !!Deno.env.get('SUPABASE_URL'));
    console.log("🔄 SUPABASE_SERVICE_ROLE_KEY set:", !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));

    const jwt = authorization.replace('Bearer ', '');
    console.log("🔑 JWT extracted, length:", jwt.length);
    console.log("🔑 JWT first 20 chars:", jwt.substring(0, 20));

    const { data: { user }, error: userError } = await supabaseAdminClient.auth.getUser(jwt);

    if (userError) {
      console.error("⛔ User authentication failed:", userError);
      console.error("⛔ Error details:", JSON.stringify(userError, null, 2));
      return new Response(
        JSON.stringify({ error: 'Unauthorized', details: userError }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!user) {
      console.error("⛔ User not found in authentication response");
      return new Response(
        JSON.stringify({ error: 'Unauthorized - User not found' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log("✅ User authenticated:", user.id);
    console.log("👤 User email:", user.email);

    // Check if the user is an admin
    console.log("👑 Checking admin status for user:", user.id);
    const { data: profileData, error: profileError } = await supabaseAdminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error("❌ Error fetching profile:", profileError);
      console.error("❌ Error details:", JSON.stringify(profileError, null, 2));
    }

    console.log("👤 User profile data:", JSON.stringify(profileData, null, 2));

    if (profileData?.role !== 'admin') {
      console.error("🚫 User is not an admin. Role:", profileData?.role);
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log("✅ Admin access confirmed");

    // Verify all required environment variables are set
    console.log("🔍 Checking environment variables...");
    const GOOGLE_SHEETS_PRIVATE_KEY = Deno.env.get('GOOGLE_SHEETS_API_KEY');
    const GOOGLE_SHEETS_CLIENT_EMAIL = Deno.env.get('GOOGLE_SHEETS_CLIENT_EMAIL');
    const ALLOWLIST_SPREADSHEET_ID = Deno.env.get('GOOGLE_SHEETS_ALLOWLIST_SPREADSHEET_ID');
    
    console.log("🔑 GOOGLE_SHEETS_API_KEY set:", !!GOOGLE_SHEETS_PRIVATE_KEY);
    console.log("📧 GOOGLE_SHEETS_CLIENT_EMAIL set:", !!GOOGLE_SHEETS_CLIENT_EMAIL);
    console.log("📊 GOOGLE_SHEETS_ALLOWLIST_SPREADSHEET_ID set:", !!ALLOWLIST_SPREADSHEET_ID);
    console.log("📊 GOOGLE_SHEETS_ALLOWLIST_SPREADSHEET_ID value:", ALLOWLIST_SPREADSHEET_ID);

    if (!GOOGLE_SHEETS_PRIVATE_KEY || !GOOGLE_SHEETS_CLIENT_EMAIL || !ALLOWLIST_SPREADSHEET_ID) {
      console.error("🛑 Missing required Google Sheets credentials");
      const missingVars = [];
      if (!GOOGLE_SHEETS_PRIVATE_KEY) missingVars.push('GOOGLE_SHEETS_API_KEY');
      if (!GOOGLE_SHEETS_CLIENT_EMAIL) missingVars.push('GOOGLE_SHEETS_CLIENT_EMAIL');
      if (!ALLOWLIST_SPREADSHEET_ID) missingVars.push('GOOGLE_SHEETS_ALLOWLIST_SPREADSHEET_ID');
      
      return new Response(
        JSON.stringify({ 
          error: 'Missing required environment variables', 
          missingVariables: missingVars 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get Google OAuth2 token using service account credentials
    console.log("🔄 Getting Google OAuth token...");
    let accessToken;
    try {
      accessToken = await getGoogleAuthToken();
      console.log("✅ Successfully obtained Google OAuth token");
    } catch (tokenError) {
      console.error("❌ Error getting Google OAuth token:", tokenError);
      console.error("❌ Error stack:", tokenError.stack || 'No stack trace available');
      return new Response(
        JSON.stringify({ 
          error: 'Failed to authenticate with Google API', 
          details: tokenError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Fetch spreadsheet metadata to verify it exists and we have access
    console.log("🔍 Fetching spreadsheet metadata to verify access...");
    
    // Get the dedicated spreadsheet ID for allowed emails
    const spreadsheetId = ALLOWLIST_SPREADSHEET_ID;
    console.log("📊 Using spreadsheet ID:", spreadsheetId);
    
    try {
      // Create sheets client
      console.log("🔄 Creating Google Sheets client...");
      const sheetsClient = sheets({
        version: 'v4',
        auth: accessToken, // Use the token directly
      });
      
      console.log("✅ Google Sheets client created");
      
      // Verify spreadsheet access
      console.log("🔄 Verifying spreadsheet access...");
      const metadataResponse = await sheetsClient.spreadsheets.get({
        spreadsheetId,
      });
      
      console.log("✅ Successfully accessed spreadsheet metadata");
      console.log("📑 Spreadsheet title:", metadataResponse.data.properties?.title);
      console.log("📋 Available sheets:", metadataResponse.data.sheets?.map(s => s.properties?.title).join(", "));
      
      // Fetch allowed emails from Google Sheets - targeting column F
      console.log(`📑 Fetching data from sheet "${ALLOWED_EMAILS_SHEET_NAME}", column F, starting from row 4`);
      console.log("🔄 Fetching values from spreadsheet...");
      
      const response = await sheetsClient.spreadsheets.values.get({
        spreadsheetId,
        range: `${ALLOWED_EMAILS_SHEET_NAME}!F:F`, // Column F for emails
      });

      const rows = response.data.values || [];
      console.log("📊 Raw data from spreadsheet:", JSON.stringify(rows.slice(0, 5), null, 2) + (rows.length > 5 ? "..." : ""));
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
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
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
        console.error('❌ Error details:', JSON.stringify(clearError, null, 2));
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
      console.log("📧 First few emails to insert:", emailRows.slice(0, 3));
      
      const { error: insertError, count: insertedCount } = await supabaseAdminClient
        .from('allowed_emails')
        .insert(emailRows)
        .select('count');

      if (insertError) {
        console.error('❌ Error inserting emails:', insertError);
        console.error('❌ Error details:', JSON.stringify(insertError, null, 2));
        return new Response(
          JSON.stringify({ error: 'Error inserting emails', details: insertError }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
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
    } catch (sheetError) {
      console.error('❌ Sheets API Error:', sheetError);
      console.error('❌ Error details:', sheetError.stack || 'No stack trace available');
      console.error('❌ Error message:', sheetError.message);
      if (sheetError.response) {
        console.error('❌ API response:', JSON.stringify(sheetError.response, null, 2));
      }
      return new Response(
        JSON.stringify({ error: 'Google Sheets API error', details: sheetError.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
  } catch (error) {
    console.error('❌ Sync allowed emails error:', error);
    console.error('❌ Error stack:', error.stack || 'No stack trace available');
    console.error('❌ Error message:', error.message);
    
    return new Response(
      JSON.stringify({ error: 'Server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
    );
  }
});

// Get Google OAuth2 token using service account credentials
async function getGoogleAuthToken() {
  const GOOGLE_SHEETS_PRIVATE_KEY = Deno.env.get('GOOGLE_SHEETS_API_KEY')?.replace(/\\n/g, '\n');
  const GOOGLE_SHEETS_CLIENT_EMAIL = Deno.env.get('GOOGLE_SHEETS_CLIENT_EMAIL');

  if (!GOOGLE_SHEETS_PRIVATE_KEY || !GOOGLE_SHEETS_CLIENT_EMAIL) {
    throw new Error('Missing Google service account credentials');
  }

  try {
    console.log("🔑 Creating JWT payload for Google OAuth...");
    // Create JWT payload for Google's OAuth2 service
    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + 3600; // Token expires in 1 hour
    
    const payload = {
      iss: GOOGLE_SHEETS_CLIENT_EMAIL,
      scope: 'https://www.googleapis.com/auth/spreadsheets',
      aud: 'https://oauth2.googleapis.com/token',
      exp,
      iat,
    };
    
    console.log("🔑 Preparing private key...");
    console.log("🔑 Private key format check:", 
      GOOGLE_SHEETS_PRIVATE_KEY.includes('-----BEGIN PRIVATE KEY-----') ? 
      "Contains header/footer" : "Missing header/footer");
    console.log("🔑 Private key length:", GOOGLE_SHEETS_PRIVATE_KEY.length);
    
    // Remove header and footer if present and decode base64
    let privateKeyContent = GOOGLE_SHEETS_PRIVATE_KEY;
    if (privateKeyContent.includes('-----BEGIN PRIVATE KEY-----')) {
      console.log("🔑 Removing header/footer from key");
      privateKeyContent = privateKeyContent
        .replace('-----BEGIN PRIVATE KEY-----', '')
        .replace('-----END PRIVATE KEY-----', '')
        .replace(/\s+/g, '');
    }
    
    console.log("🔑 Processed key length:", privateKeyContent.length);
    
    // Import the private key using crypto APIs
    console.log("🔑 Importing private key...");
    try {
      // First, try to decode the base64 key
      console.log("🔑 Decoding base64 key...");
      const binaryKey = Uint8Array.from(atob(privateKeyContent), c => c.charCodeAt(0));
      console.log("🔑 Binary key length:", binaryKey.length);
      
      // Import the key
      console.log("🔑 Importing key as PKCS8...");
      const privateKey = await crypto.subtle.importKey(
        'pkcs8',
        binaryKey,
        {
          name: 'RSASSA-PKCS1-v1_5',
          hash: 'SHA-256'
        },
        false,
        ['sign']
      );
      
      console.log("🔑 Key successfully imported");
      
      // Create and sign the JWT
      console.log("🔑 Creating and signing JWT...");
      const jwt = await create({ alg: 'RS256', typ: 'JWT' }, payload, privateKey);
      
      console.log("🔑 JWT created, exchanging for access token...");
      console.log("🔑 JWT length:", jwt.length);
      
      // Exchange JWT for access token
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
          assertion: jwt,
        }),
      });
      
      console.log("🔑 Token response status:", tokenResponse.status);
      
      const tokenData = await tokenResponse.json();
      
      if (!tokenResponse.ok) {
        console.error('Token error response:', tokenData);
        throw new Error(`Failed to get Google auth token: ${tokenData.error}: ${tokenData.error_description}`);
      }
      
      console.log("🔑 Successfully obtained access token");
      console.log("🔑 Token type:", tokenData.token_type);
      console.log("🔑 Expires in:", tokenData.expires_in, "seconds");
      
      return tokenData.access_token;
    } catch (importError) {
      console.error("❌ Error importing key:", importError);
      console.error("❌ Error stack:", importError.stack || 'No stack trace available');
      throw new Error(`Failed to import private key: ${importError.message}`);
    }
  } catch (error) {
    console.error("❌ Error in getGoogleAuthToken:", error);
    console.error("❌ Error stack:", error.stack || 'No stack trace available');
    throw error;
  }
}
