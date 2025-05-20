
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

// Helper function for consistent logging
function logDebug(prefix, message) {
  console.log(`[DEBUG-SYNC-EMAILS-${Date.now()}] ${prefix}: ${message}`);
}

// Helper function to stringify objects/errors safely
function safeStringify(obj) {
  try {
    return JSON.stringify(obj, (key, value) => {
      if (value instanceof Error) {
        return {
          message: value.message,
          stack: value.stack,
          ...value
        };
      }
      return value;
    }, 2);
  } catch (e) {
    return `[Error serializing object: ${e.message}]`;
  }
}

// Main entry point
serve(async (req: Request) => {
  logDebug("START", "Function invoked with method: " + req.method);
  logDebug("HEADERS", safeStringify(Object.fromEntries(req.headers.entries())));

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    logDebug("CORS", "Handling OPTIONS request");
    return new Response('ok', { 
      status: 204,
      headers: corsHeaders 
    });
  }

  try {
    // Check environment variables
    logDebug("ENV CHECK", "Starting environment variable check");
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const sheetsPrivateKey = Deno.env.get('GOOGLE_SHEETS_API_KEY');
    const sheetsClientEmail = Deno.env.get('GOOGLE_SHEETS_CLIENT_EMAIL');
    // Use the same spreadsheet ID as the priority matches function
    const spreadsheetId = Deno.env.get('GOOGLE_SHEETS_SPREADSHEET_ID');
    
    logDebug("ENV VARS", `SUPABASE_URL set: ${!!supabaseUrl}`);
    logDebug("ENV VARS", `SUPABASE_SERVICE_ROLE_KEY set: ${!!supabaseServiceRoleKey}`);
    logDebug("ENV VARS", `GOOGLE_SHEETS_API_KEY set: ${!!sheetsPrivateKey}`);
    logDebug("ENV VARS", `GOOGLE_SHEETS_API_KEY length: ${sheetsPrivateKey ? sheetsPrivateKey.length : 0}`);
    logDebug("ENV VARS", `GOOGLE_SHEETS_CLIENT_EMAIL set: ${!!sheetsClientEmail}`);
    logDebug("ENV VARS", `GOOGLE_SHEETS_SPREADSHEET_ID set: ${!!spreadsheetId}`);
    logDebug("ENV VARS", `GOOGLE_SHEETS_SPREADSHEET_ID value: ${spreadsheetId || 'not set'}`);
    
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error("Missing required Supabase credentials");
    }
    
    if (!sheetsPrivateKey || !sheetsClientEmail || !spreadsheetId) {
      throw new Error("Missing required Google Sheets credentials");
    }
    
    // Parse request body
    const { authorization } = req.headers;
    if (!authorization) {
      logDebug("AUTH", "Missing authorization header");
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    logDebug("AUTH", `Authorization header present, length: ${authorization.length}`);
    logDebug("AUTH", `First 20 chars: ${authorization.substring(0, 20)}...`);

    // Validate JWT
    const supabaseAdminClient = createClient(supabaseUrl, supabaseServiceRoleKey);
    logDebug("SUPABASE", "Created admin client");

    const jwt = authorization.replace('Bearer ', '');
    logDebug("JWT", `Extracted token, length: ${jwt.length}`);
    
    try {
      logDebug("AUTH VALIDATION", "Starting user validation");
      const { data: { user }, error: userError } = await supabaseAdminClient.auth.getUser(jwt);

      if (userError) {
        logDebug("AUTH ERROR", `User validation failed: ${safeStringify(userError)}`);
        return new Response(
          JSON.stringify({ error: 'Unauthorized', details: userError }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!user) {
        logDebug("AUTH ERROR", "User not found in authentication response");
        return new Response(
          JSON.stringify({ error: 'Unauthorized - User not found' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      logDebug("AUTH SUCCESS", `User authenticated: ${user.id}, email: ${user.email}`);

      // Check if the user is an admin
      logDebug("ADMIN CHECK", `Checking admin status for user: ${user.id}`);
      const { data: profileData, error: profileError } = await supabaseAdminClient
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError) {
        logDebug("ADMIN ERROR", `Error fetching profile: ${safeStringify(profileError)}`);
      }

      logDebug("PROFILE", `User profile data: ${safeStringify(profileData)}`);

      if (profileData?.role !== 'admin') {
        logDebug("ACCESS DENIED", `User is not an admin. Role: ${profileData?.role}`);
        return new Response(
          JSON.stringify({ error: 'Admin access required' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      logDebug("ACCESS GRANTED", "Admin access confirmed");

      // Get Google OAuth2 token
      logDebug("GOOGLE AUTH", "Starting Google OAuth token process");
      let accessToken;
      try {
        // Generate JWT for Google OAuth
        const privateKey = sheetsPrivateKey.replace(/\\n/g, '\n');
        logDebug("GOOGLE KEY", `Private key format check: ${privateKey.includes('-----BEGIN PRIVATE KEY-----') ? 'Contains header/footer' : 'Missing header/footer'}`);
        logDebug("GOOGLE KEY", `Private key length: ${privateKey.length}`);

        const iat = Math.floor(Date.now() / 1000);
        const exp = iat + 3600; // 1 hour
        
        // Create JWT claims
        const jwtPayload = {
          iss: sheetsClientEmail,
          scope: 'https://www.googleapis.com/auth/spreadsheets',
          aud: 'https://oauth2.googleapis.com/token',
          exp,
          iat,
        };
        
        logDebug("JWT PAYLOAD", `Created payload: ${safeStringify(jwtPayload)}`);

        // Create JWT token for Google authentication
        let privateKeyJWT;
        try {
          // First attempt to decode if base64 encoded
          if (privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
            logDebug("JWT SIGNING", "Using key with headers");
            // Remove header and footer and decode
            const keyContent = privateKey
              .replace('-----BEGIN PRIVATE KEY-----', '')
              .replace('-----END PRIVATE KEY-----', '')
              .replace(/\s+/g, '');
              
            const binaryKey = Uint8Array.from(atob(keyContent), c => c.charCodeAt(0));
            
            privateKeyJWT = await crypto.subtle.importKey(
              'pkcs8',
              binaryKey,
              { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
              false,
              ['sign']
            );
          } else {
            // Try direct base64 decoding
            logDebug("JWT SIGNING", "Using key without headers, trying direct base64 decode");
            const binaryKey = Uint8Array.from(atob(privateKey), c => c.charCodeAt(0));
            privateKeyJWT = await crypto.subtle.importKey(
              'pkcs8',
              binaryKey,
              { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
              false,
              ['sign']
            );
          }
          
          logDebug("JWT SIGNING", "Successfully imported private key");
          
          // Create JWT with djwt library
          const jwt = await create(
            { alg: 'RS256', typ: 'JWT' },
            jwtPayload,
            privateKeyJWT
          );
          
          logDebug("JWT CREATED", `JWT for Google auth created, length: ${jwt.length}`);
          
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
          
          logDebug("TOKEN RESPONSE", `Status: ${tokenResponse.status}`);
          
          const tokenData = await tokenResponse.json();
          
          if (!tokenResponse.ok) {
            logDebug("TOKEN ERROR", `Failed to get token: ${safeStringify(tokenData)}`);
            throw new Error(`Failed to get Google auth token: ${tokenData.error}: ${tokenData.error_description}`);
          }
          
          logDebug("TOKEN SUCCESS", `Token type: ${tokenData.token_type}, expires in: ${tokenData.expires_in}s`);
          accessToken = tokenData.access_token;
          
        } catch (jwtError) {
          logDebug("JWT ERROR", `Error creating JWT: ${safeStringify(jwtError)}`);
          throw new Error(`JWT signing failed: ${jwtError.message}`);
        }
      } catch (googleAuthError) {
        logDebug("GOOGLE AUTH ERROR", `Failed to get Google token: ${safeStringify(googleAuthError)}`);
        return new Response(
          JSON.stringify({ error: 'Failed to authenticate with Google', details: googleAuthError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Use token to access spreadsheet
      try {
        // Create sheets client
        logDebug("SHEETS", "Creating Google Sheets client");
        const sheetsClient = sheets({
          version: 'v4',
          auth: accessToken,
        });
        
        logDebug("SHEETS", "Client created successfully");
        
        // Verify spreadsheet access
        logDebug("SHEETS", `Verifying access to spreadsheet ID: ${spreadsheetId}`);
        const metadataResponse = await sheetsClient.spreadsheets.get({
          spreadsheetId: spreadsheetId,
        });
        
        logDebug("SHEETS", `Successfully accessed spreadsheet: ${metadataResponse.data.properties?.title}`);
        
        const sheetNames = metadataResponse.data.sheets?.map(s => s.properties?.title).join(", ");
        logDebug("SHEETS", `Available sheets: ${sheetNames}`);
        
        // Check if our target sheet exists
        const sheetExists = metadataResponse.data.sheets?.some(
          s => s.properties?.title === ALLOWED_EMAILS_SHEET_NAME
        );
        
        if (!sheetExists) {
          logDebug("SHEETS ERROR", `Sheet "${ALLOWED_EMAILS_SHEET_NAME}" not found in spreadsheet`);
          return new Response(
            JSON.stringify({ error: `Sheet "${ALLOWED_EMAILS_SHEET_NAME}" not found in spreadsheet` }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Fetch allowed emails
        logDebug("SHEETS", `Fetching data from sheet "${ALLOWED_EMAILS_SHEET_NAME}", column F (index ${EMAIL_COLUMN_INDEX}), starting from row ${DATA_START_ROW + 1}`);
        
        const response = await sheetsClient.spreadsheets.values.get({
          spreadsheetId: spreadsheetId,
          range: `${ALLOWED_EMAILS_SHEET_NAME}!F:F`, // Column F for emails
        });

        const rows = response.data.values || [];
        logDebug("SHEETS", `Raw rows fetched: ${rows.length}`);
        
        if (rows.length > 0) {
          logDebug("SHEETS", `First few rows sample: ${safeStringify(rows.slice(0, 5))}`);
        }
        
        // Skip to start row and extract emails
        const emails = rows.slice(DATA_START_ROW)
          .map(row => {
            const email = row[0]?.trim().toLowerCase();
            return email;
          })
          .filter(email => email && email.includes('@'));

        logDebug("EMAILS", `Found ${emails.length} valid emails`);
        
        if (emails.length > 0) {
          logDebug("EMAILS", `First 5 emails: ${safeStringify(emails.slice(0, 5))}`);
        }

        if (emails.length === 0) {
          logDebug("EMAILS", "No valid emails found in spreadsheet");
          return new Response(
            JSON.stringify({ error: 'No valid emails found in the spreadsheet' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Clear existing emails from DB
        logDebug("DB", "Clearing existing synced emails from database");
        const { error: clearError, count: deletedCount } = await supabaseAdminClient
          .from('allowed_emails')
          .delete()
          .eq('synced_from_sheet', true)
          .select('count');

        if (clearError) {
          logDebug("DB ERROR", `Error clearing emails: ${safeStringify(clearError)}`);
        } else {
          logDebug("DB", `Deleted ${deletedCount} existing synced emails`);
        }

        // Insert new emails
        const emailRows = emails.map(email => ({
          email,
          synced_from_sheet: true,
          active: true
        }));

        logDebug("DB", `Inserting ${emailRows.length} emails into database`);
        
        const { error: insertError, count: insertedCount } = await supabaseAdminClient
          .from('allowed_emails')
          .insert(emailRows)
          .select('count');

        if (insertError) {
          logDebug("DB ERROR", `Error inserting emails: ${safeStringify(insertError)}`);
          return new Response(
            JSON.stringify({ error: 'Error inserting emails', details: insertError }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        logDebug("SUCCESS", `Successfully inserted ${insertedCount} emails`);

        // Return success
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: `Successfully synced ${emails.length} emails from Google Sheet (column F)`,
            totalEmails: emails.length,
            sampleEmails: emails.slice(0, 5) // Only show first 5 for security
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (sheetError) {
        logDebug("SHEETS ERROR", `Error accessing sheets: ${safeStringify(sheetError)}`);
        return new Response(
          JSON.stringify({ error: 'Google Sheets API error', details: sheetError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } catch (authError) {
      logDebug("AUTH ERROR", `Error during authentication: ${safeStringify(authError)}`);
      return new Response(
        JSON.stringify({ error: 'Authentication error', details: authError.message }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    logDebug("FATAL ERROR", `Unhandled exception: ${safeStringify(error)}`);
    return new Response(
      JSON.stringify({ error: 'Server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
