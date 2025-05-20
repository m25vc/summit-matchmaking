
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { create } from "https://deno.land/x/djwt@v2.8/mod.ts";
import { sheets } from 'https://esm.sh/@googleapis/sheets@4.0.1';

// Constants
const ALLOWED_EMAILS_SHEET_NAME = "EBData"; // Sheet name
const EMAIL_COLUMN_INDEX = 5; // Column F is index 5 (0-based indexing)
const DATA_START_ROW = 3; // Row 4 is index 3 (0-based indexing)

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

/**
 * Log messages with timestamp and prefix
 */
function logMessage(level, prefix, message) {
  console.log(`[${level}-${Date.now()}] ${prefix}: ${message}`);
}

/**
 * Helper to safely stringify objects including errors
 */
function safeStringify(obj) {
  try {
    return JSON.stringify(obj, (key, value) => {
      if (value instanceof Error) {
        return { message: value.message, stack: value.stack, ...value };
      }
      return value;
    }, 2);
  } catch (e) {
    return `[Error serializing object: ${e.message}]`;
  }
}

/**
 * Validate environment variables
 */
function validateEnvironment() {
  logMessage("INFO", "ENV", "Checking environment variables");
  
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const sheetsPrivateKey = Deno.env.get('GOOGLE_SHEETS_API_KEY');
  const sheetsClientEmail = Deno.env.get('GOOGLE_SHEETS_CLIENT_EMAIL');
  const spreadsheetId = Deno.env.get('GOOGLE_SHEETS_SPREADSHEET_ID');
  
  logMessage("INFO", "ENV", `SUPABASE_URL set: ${!!supabaseUrl}`);
  logMessage("INFO", "ENV", `SUPABASE_SERVICE_ROLE_KEY set: ${!!supabaseServiceRoleKey}`);
  logMessage("INFO", "ENV", `GOOGLE_SHEETS_API_KEY set: ${!!sheetsPrivateKey}`);
  logMessage("INFO", "ENV", `GOOGLE_SHEETS_CLIENT_EMAIL set: ${!!sheetsClientEmail}`);
  logMessage("INFO", "ENV", `GOOGLE_SHEETS_SPREADSHEET_ID set: ${!!spreadsheetId}`);
  
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Missing required Supabase credentials");
  }
  
  if (!sheetsPrivateKey || !sheetsClientEmail || !spreadsheetId) {
    throw new Error("Missing required Google Sheets credentials");
  }
  
  return {
    supabaseUrl,
    supabaseServiceRoleKey,
    sheetsPrivateKey,
    sheetsClientEmail,
    spreadsheetId
  };
}

/**
 * Validate user JWT and check if admin
 */
async function validateAdminUser(supabaseClient, authHeader) {
  logMessage("INFO", "AUTH", "Starting user validation");
  
  if (!authHeader) {
    throw new Error("Missing authorization header");
  }
  
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

  if (userError) {
    logMessage("ERROR", "AUTH", `User validation failed: ${safeStringify(userError)}`);
    throw new Error(`Unauthorized: ${userError.message}`);
  }

  if (!user) {
    logMessage("ERROR", "AUTH", "User not found in authentication response");
    throw new Error('Unauthorized - User not found');
  }

  logMessage("INFO", "AUTH", `User authenticated: ${user.id}, email: ${user.email}`);

  // Check if the user is an admin
  const { data: profileData, error: profileError } = await supabaseClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError) {
    logMessage("ERROR", "AUTH", `Error fetching profile: ${safeStringify(profileError)}`);
    throw new Error(`Error fetching user profile: ${profileError.message}`);
  }

  if (profileData?.role !== 'admin') {
    logMessage("ERROR", "AUTH", `User is not an admin. Role: ${profileData?.role}`);
    throw new Error('Admin access required');
  }

  logMessage("INFO", "AUTH", "Admin access confirmed");
  return user;
}

/**
 * Get Google OAuth token for sheets access
 */
async function getGoogleAuthToken(sheetsClientEmail, sheetsPrivateKey) {
  logMessage("INFO", "GOOGLE", "Starting Google OAuth token process");

  try {
    // Clean private key format
    const privateKey = sheetsPrivateKey.replace(/\\n/g, '\n');
    
    // Create JWT payload
    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + 3600; // 1 hour
    
    const jwtPayload = {
      iss: sheetsClientEmail,
      scope: 'https://www.googleapis.com/auth/spreadsheets',
      aud: 'https://oauth2.googleapis.com/token',
      exp,
      iat,
    };
    
    // Import private key for signing
    let privateKeyJWT;
    try {
      // Handle key with or without headers
      if (privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
        logMessage("INFO", "GOOGLE", "Using key with headers");
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
        // Direct base64 decode
        logMessage("INFO", "GOOGLE", "Using key without headers");
        const binaryKey = Uint8Array.from(atob(privateKey), c => c.charCodeAt(0));
        privateKeyJWT = await crypto.subtle.importKey(
          'pkcs8',
          binaryKey,
          { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
          false,
          ['sign']
        );
      }
      
      logMessage("INFO", "GOOGLE", "Successfully imported private key");
      
      // Create and sign JWT
      const jwt = await create(
        { alg: 'RS256', typ: 'JWT' },
        jwtPayload,
        privateKeyJWT
      );
      
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
      
      const tokenData = await tokenResponse.json();
      
      if (!tokenResponse.ok) {
        logMessage("ERROR", "GOOGLE", `Failed to get token: ${safeStringify(tokenData)}`);
        throw new Error(`Failed to get Google auth token: ${tokenData.error}: ${tokenData.error_description}`);
      }
      
      logMessage("INFO", "GOOGLE", "Successfully obtained access token");
      return tokenData.access_token;
    } catch (error) {
      logMessage("ERROR", "GOOGLE", `Error with JWT or token: ${safeStringify(error)}`);
      throw error;
    }
  } catch (error) {
    logMessage("ERROR", "GOOGLE", `Error in getGoogleAuthToken: ${safeStringify(error)}`);
    throw error;
  }
}

/**
 * Fetch emails from Google Sheets
 */
async function fetchEmails(accessToken, spreadsheetId) {
  logMessage("INFO", "SHEETS", "Creating Google Sheets client");
  
  // Create sheets client with auth token
  const sheetsClient = sheets({
    version: 'v4',
    auth: accessToken,  // This is where we pass the auth token
  });
  
  logMessage("INFO", "SHEETS", `Accessing spreadsheet: ${spreadsheetId}`);
  
  // Verify spreadsheet access and find sheet
  const metadata = await sheetsClient.spreadsheets.get({
    spreadsheetId: spreadsheetId,
  });
  
  logMessage("INFO", "SHEETS", `Spreadsheet title: ${metadata.data.properties?.title}`);
  
  // Check if our target sheet exists
  const sheetExists = metadata.data.sheets?.some(
    s => s.properties?.title === ALLOWED_EMAILS_SHEET_NAME
  );
  
  if (!sheetExists) {
    logMessage("ERROR", "SHEETS", `Sheet "${ALLOWED_EMAILS_SHEET_NAME}" not found`);
    throw new Error(`Sheet "${ALLOWED_EMAILS_SHEET_NAME}" not found in spreadsheet`);
  }
  
  // Fetch data from column F
  logMessage("INFO", "SHEETS", `Fetching column F from row ${DATA_START_ROW + 1}`);
  
  const response = await sheetsClient.spreadsheets.values.get({
    spreadsheetId: spreadsheetId,
    range: `${ALLOWED_EMAILS_SHEET_NAME}!F:F`, // Column F for emails
  });
  
  const rows = response.data.values || [];
  logMessage("INFO", "SHEETS", `Found ${rows.length} rows in total`);
  
  // Extract valid emails, starting from the specified row
  const emails = rows.slice(DATA_START_ROW)
    .map(row => {
      const email = row[0]?.trim().toLowerCase();
      return email;
    })
    .filter(email => email && email.includes('@'));
  
  logMessage("INFO", "SHEETS", `Found ${emails.length} valid emails`);
  
  if (emails.length === 0) {
    logMessage("WARN", "SHEETS", "No valid emails found in spreadsheet");
    throw new Error('No valid emails found in the spreadsheet');
  }
  
  logMessage("INFO", "SHEETS", `First 3 emails sample: ${emails.slice(0, 3).join(', ')}`);
  return emails;
}

/**
 * Update allowed_emails table in Supabase
 */
async function syncEmailsToDatabase(supabaseClient, emails) {
  // Clear existing emails from DB
  logMessage("INFO", "DB", "Clearing existing synced emails from database");
  const { error: clearError, count: deletedCount } = await supabaseClient
    .from('allowed_emails')
    .delete()
    .eq('synced_from_sheet', true)
    .select('count');

  if (clearError) {
    logMessage("ERROR", "DB", `Error clearing emails: ${safeStringify(clearError)}`);
    throw new Error(`Error clearing existing emails: ${clearError.message}`);
  } else {
    logMessage("INFO", "DB", `Deleted ${deletedCount} existing synced emails`);
  }

  // Insert new emails
  const emailRows = emails.map(email => ({
    email,
    synced_from_sheet: true,
    active: true
  }));

  logMessage("INFO", "DB", `Inserting ${emailRows.length} emails into database`);
  
  const { error: insertError, count: insertedCount } = await supabaseClient
    .from('allowed_emails')
    .insert(emailRows)
    .select('count');

  if (insertError) {
    logMessage("ERROR", "DB", `Error inserting emails: ${safeStringify(insertError)}`);
    throw new Error(`Error inserting emails: ${insertError.message}`);
  }

  logMessage("SUCCESS", "DB", `Successfully inserted ${insertedCount} emails`);
  
  return {
    deletedCount,
    insertedCount
  };
}

/**
 * Main handler function for the edge function
 */
async function handleRequest(req) {
  try {
    // Initialize environment and create clients
    const { 
      supabaseUrl, 
      supabaseServiceRoleKey, 
      sheetsPrivateKey, 
      sheetsClientEmail, 
      spreadsheetId 
    } = validateEnvironment();
    
    const supabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey);
    
    // Validate admin user
    await validateAdminUser(supabaseClient, req.headers.get('authorization'));
    
    // Get Google OAuth token
    const accessToken = await getGoogleAuthToken(sheetsClientEmail, sheetsPrivateKey);
    
    // Fetch emails from Google Sheet
    const emails = await fetchEmails(accessToken, spreadsheetId);
    
    // Sync emails to database
    const { deletedCount, insertedCount } = await syncEmailsToDatabase(supabaseClient, emails);
    
    // Return success
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully synced ${emails.length} emails from Google Sheet`,
        stats: {
          totalEmails: emails.length,
          deleted: deletedCount,
          inserted: insertedCount
        },
        sampleEmails: emails.slice(0, 3) // Only show first 3 for security
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    logMessage("ERROR", "HANDLER", `Request failed: ${error.message}`);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Main entry point - serve HTTP requests
serve(async (req) => {
  logMessage("INFO", "REQUEST", `Received ${req.method} request`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }
  
  return handleRequest(req);
});
