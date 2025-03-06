
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { create } from "https://deno.land/x/djwt@v2.8/mod.ts"

// Get environment variables
const GOOGLE_SHEETS_PRIVATE_KEY = Deno.env.get('GOOGLE_SHEETS_API_KEY')?.replace(/\\n/g, '\n')
const GOOGLE_SHEETS_CLIENT_EMAIL = Deno.env.get('GOOGLE_SHEETS_CLIENT_EMAIL')
const SPREADSHEET_ID = Deno.env.get('GOOGLE_SHEETS_SPREADSHEET_ID')
const SHEET_NAME = 'Matches' // Default sheet name, will be created if it doesn't exist

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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
    
    if (!data.matches || !Array.isArray(data.matches)) {
      console.error("Invalid request data:", data);
      throw new Error('Invalid or missing matches data in request');
    }
    
    const matches = data.matches;
    console.log(`Processing ${matches.length} matches...`);
    
    // Format the match data for Google Sheets
    // Each row will contain: 
    // [Initiator Name, Initiator Company, Initiator Email, Target Name, Target Company, Target Email, Score, Mutual Match]
    const values = matches.map((match) => [
      `${match.initiator?.first_name || ''} ${match.initiator?.last_name || ''}`, 
      match.initiator?.company_name || '',
      match.initiator?.email || '',
      `${match.target?.first_name || ''} ${match.target?.last_name || ''}`,
      match.target?.company_name || '',
      match.target?.email || '',
      match.score || 0,
      match.has_mutual_match ? 'Yes' : 'No',
      new Date(match.created_at).toISOString()
    ]);
    
    // Add headers as the first row
    const headers = [
      'Initiator Name', 
      'Initiator Company', 
      'Initiator Email', 
      'Target Name', 
      'Target Company', 
      'Target Email', 
      'Score', 
      'Mutual Match',
      'Date'
    ];
    
    values.unshift(headers);

    console.log("Getting Google OAuth token...");
    const accessToken = await getGoogleAuthToken();

    // Ensure the sheet exists
    await ensureSheetExists(accessToken, SPREADSHEET_ID, SHEET_NAME);

    // Update Google Sheets with OAuth2 token
    console.log(`Updating Google Sheet ${SPREADSHEET_ID}, sheet ${SHEET_NAME}...`);
    const sheetUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}!A1:I${values.length}?valueInputOption=RAW`;
    
    console.log("Sending request to Google Sheets API...");
    const response = await fetch(sheetUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range: `${SHEET_NAME}!A1:I${values.length}`,
        majorDimension: 'ROWS',
        values,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Sheets API Error:', response.status, errorText);
      let errorData = {};
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        console.error('Could not parse error response as JSON');
      }
      throw new Error(`Failed to update Google Sheets: ${response.status} ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();
    console.log(`Google Sheets update successful: Updated ${result.updatedCells} cells`);

    return new Response(
      JSON.stringify({ success: true, updatedCells: result.updatedCells }),
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
