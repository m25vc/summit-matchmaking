
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { create } from "https://deno.land/x/djwt@v2.8/mod.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// Get environment variables
const GOOGLE_SHEETS_PRIVATE_KEY = Deno.env.get('GOOGLE_SHEETS_API_KEY')?.replace(/\\n/g, '\n')
const GOOGLE_SHEETS_CLIENT_EMAIL = Deno.env.get('GOOGLE_SHEETS_CLIENT_EMAIL')
const SPREADSHEET_ID = Deno.env.get('GOOGLE_SHEETS_SPREADSHEET_ID')
const MATCH_SHEET_NAME = 'Matches' // Default sheet name for matches
const AVAILABILITY_SHEET_NAME = 'Availability' // New sheet for availability data
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Initialize Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

// Get Google OAuth2 token using service account credentials
async function getGoogleAuthToken() {
  if (!GOOGLE_SHEETS_PRIVATE_KEY || !GOOGLE_SHEETS_CLIENT_EMAIL) {
    throw new Error('Missing Google service account credentials')
  }

  try {
    console.log("Creating JWT payload...")
    // Create JWT payload for Google's OAuth2 service
    const iat = Math.floor(Date.now() / 1000)
    const exp = iat + 3600 // Token expires in 1 hour
    
    const payload = {
      iss: GOOGLE_SHEETS_CLIENT_EMAIL,
      scope: 'https://www.googleapis.com/auth/spreadsheets',
      aud: 'https://oauth2.googleapis.com/token',
      exp,
      iat,
    }
    
    console.log("Preparing private key...")
    
    // Remove header and footer if present and decode base64
    let privateKeyContent = GOOGLE_SHEETS_PRIVATE_KEY;
    if (privateKeyContent.includes('-----BEGIN PRIVATE KEY-----')) {
      privateKeyContent = privateKeyContent
        .replace('-----BEGIN PRIVATE KEY-----', '')
        .replace('-----END PRIVATE KEY-----', '')
        .replace(/\s+/g, '');
    }
    
    // Import the private key using crypto APIs
    console.log("Importing private key...")
    try {
      // First, try to decode the base64 key
      const binaryKey = Uint8Array.from(atob(privateKeyContent), c => c.charCodeAt(0));
      
      // Import the key
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
      
      console.log("Key successfully imported, creating JWT...");
      
      // Create and sign the JWT
      const jwt = await create({ alg: 'RS256', typ: 'JWT' }, payload, privateKey);
      
      console.log("JWT created, exchanging for access token...");
      
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
        console.error('Token error response:', tokenData);
        throw new Error(`Failed to get Google auth token: ${tokenData.error}: ${tokenData.error_description}`);
      }
      
      console.log("Successfully obtained access token");
      return tokenData.access_token;
    } catch (importError) {
      console.error("Error importing key:", importError);
      throw new Error(`Failed to import private key: ${importError.message}`);
    }
  } catch (error) {
    console.error("Error in getGoogleAuthToken:", error);
    throw error;
  }
}

// Function to ensure the sheet exists
async function ensureSheetExists(accessToken, spreadsheetId, sheetName) {
  console.log(`Checking if sheet ${sheetName} exists in spreadsheet ${spreadsheetId}...`);
  
  // First, get the spreadsheet to check if the sheet exists
  const getUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`;
  const getResponse = await fetch(getUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  
  if (!getResponse.ok) {
    const errorText = await getResponse.text();
    console.error('Error getting spreadsheet:', getResponse.status, errorText);
    throw new Error(`Failed to get spreadsheet: ${getResponse.status} ${errorText}`);
  }
  
  const spreadsheet = await getResponse.json();
  const sheetExists = spreadsheet.sheets.some(sheet => 
    sheet.properties.title === sheetName
  );
  
  if (sheetExists) {
    console.log(`Sheet ${sheetName} already exists.`);
    return;
  }
  
  console.log(`Sheet ${sheetName} doesn't exist. Creating it...`);
  
  // Sheet doesn't exist, so create it
  const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`;
  const updateResponse = await fetch(updateUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [
        {
          addSheet: {
            properties: {
              title: sheetName,
            },
          },
        },
      ],
    }),
  });
  
  if (!updateResponse.ok) {
    const errorText = await updateResponse.text();
    console.error('Error creating sheet:', updateResponse.status, errorText);
    throw new Error(`Failed to create sheet: ${updateResponse.status} ${errorText}`);
  }
  
  console.log(`Successfully created sheet ${sheetName}.`);
}

// Process match data to prepare it for Google Sheets
function processMatchesData(matches) {
  if (!matches || !Array.isArray(matches) || matches.length === 0) {
    return [['No matches data available']];
  }
  
  // Add headers as the first row
  const headers = [
    'ID',
    'Founder ID',
    'Investor ID', 
    'Priority',
    'Not Interested',
    'Set By',
    'Created At'
  ];
  
  // Format the match data for Google Sheets
  const matchRows = matches.map((match) => [
    match.id || '',
    match.founder_id || '',
    match.investor_id || '',
    match.priority || 'low',
    match.not_interested ? 'Yes' : 'No',
    match.set_by || '',
    match.created_at ? new Date(match.created_at).toISOString() : ''
  ]);
  
  // Combine headers and data
  return [headers, ...matchRows];
}

// Process availability data for Google Sheets
function processAvailabilityData(users) {
  if (!users || !Array.isArray(users) || users.length === 0) {
    return [['No availability data']];
  }
  
  // Add headers as the first row
  const headers = [
    'User ID',
    'Email',
    'First Name',
    'Last Name',
    'Date 1',
    'Time Slots (Day 1)',
    'Date 2',
    'Time Slots (Day 2)'
  ];
  
  // Format the user availability data for Google Sheets
  const userRows = users.map((user) => {
    const availability = user.raw_user_meta_data?.availability || {};
    const dates = Object.keys(availability).sort();
    
    // Handle case with no availability data
    if (dates.length === 0) {
      return [
        user.id || '',
        user.email || '',
        user.raw_user_meta_data?.first_name || '',
        user.raw_user_meta_data?.last_name || '',
        '', '', '', ''
      ];
    }
    
    // Get first date's data
    const date1 = dates[0] || '';
    const timeSlots1 = availability[date1] ? availability[date1].join(', ') : '';
    
    // Get second date's data if available
    const date2 = dates[1] || '';
    const timeSlots2 = availability[date2] ? availability[date2].join(', ') : '';
    
    return [
      user.id || '',
      user.email || '',
      user.raw_user_meta_data?.first_name || '',
      user.raw_user_meta_data?.last_name || '',
      date1,
      timeSlots1,
      date2,
      timeSlots2
    ];
  });
  
  // Combine headers and data
  return [headers, ...userRows];
}

// Update a specific sheet with data
async function updateSheet(accessToken, spreadsheetId, sheetName, values) {
  if (!values || values.length === 0) {
    console.log(`No data to update in sheet ${sheetName}`);
    return { updatedRows: 0, updatedColumns: 0, updatedCells: 0 };
  }
  
  console.log(`Updating sheet ${sheetName} with ${values.length} rows of data`);
  
  const rowCount = values.length;
  const columnCount = values[0].length;
  const sheetUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!A1:${String.fromCharCode(65 + columnCount - 1)}${rowCount}?valueInputOption=RAW`;
  
  const response = await fetch(sheetUrl, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      range: `${sheetName}!A1:${String.fromCharCode(65 + columnCount - 1)}${rowCount}`,
      majorDimension: 'ROWS',
      values,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Error updating sheet ${sheetName}:`, response.status, errorText);
    throw new Error(`Failed to update sheet ${sheetName}: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  console.log(`Successfully updated ${result.updatedCells} cells in sheet ${sheetName}`);
  return result;
}

serve(async (req) => {
  console.log("Function invoked with method:", req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log("Parsing request body...");
    // Get matches data from the request
    const data = await req.json();
    const matches = data.matches || [];
    
    console.log(`Processing ${matches.length} matches...`);
    
    // Format the match data for Google Sheets
    const matchValues = processMatchesData(matches);

    console.log("Getting Google OAuth token...");
    const accessToken = await getGoogleAuthToken();

    // Ensure both sheets exist
    await ensureSheetExists(accessToken, SPREADSHEET_ID, MATCH_SHEET_NAME);
    await ensureSheetExists(accessToken, SPREADSHEET_ID, AVAILABILITY_SHEET_NAME);
    
    // Update matches sheet
    console.log(`Updating matches in Google Sheet ${SPREADSHEET_ID}, sheet ${MATCH_SHEET_NAME}...`);
    const matchesResult = await updateSheet(accessToken, SPREADSHEET_ID, MATCH_SHEET_NAME, matchValues);
    
    // Fetch user data with availability information
    console.log("Fetching user availability data...");
    const { data: usersWithAvailability, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error("Error fetching users:", usersError);
      throw new Error(`Failed to fetch users: ${usersError.message}`);
    }
    
    // Process and update availability data
    console.log(`Processing availability data for ${usersWithAvailability.users.length} users...`);
    const availabilityValues = processAvailabilityData(usersWithAvailability.users);
    
    console.log(`Updating availability in Google Sheet ${SPREADSHEET_ID}, sheet ${AVAILABILITY_SHEET_NAME}...`);
    const availabilityResult = await updateSheet(accessToken, SPREADSHEET_ID, AVAILABILITY_SHEET_NAME, availabilityValues);

    console.log("Google Sheets update successful");

    return new Response(
      JSON.stringify({ 
        success: true, 
        matchesUpdated: matchesResult.updatedCells,
        availabilityUpdated: availabilityResult.updatedCells
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
