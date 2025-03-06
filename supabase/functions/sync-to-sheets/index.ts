
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { create, getNumericDate } from "https://deno.land/x/djwt@v2.8/mod.ts"

// Get environment variables
const GOOGLE_SHEETS_PRIVATE_KEY = Deno.env.get('GOOGLE_SHEETS_API_KEY')?.replace(/\\n/g, '\n')
const GOOGLE_SHEETS_CLIENT_EMAIL = Deno.env.get('GOOGLE_SHEETS_CLIENT_EMAIL')
const SPREADSHEET_ID = Deno.env.get('GOOGLE_SHEETS_SPREADSHEET_ID')

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
  
  // Import the private key and create a signing key
  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    new TextEncoder().encode(GOOGLE_SHEETS_PRIVATE_KEY),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  )
  
  // Create and sign the JWT
  const jwt = await create({ alg: 'RS256', typ: 'JWT' }, payload, privateKey)
  
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
  })
  
  const tokenData = await tokenResponse.json()
  
  if (!tokenResponse.ok) {
    console.error('Token error:', tokenData)
    throw new Error(`Failed to get Google auth token: ${tokenData.error}`)
  }
  
  return tokenData.access_token
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get matches data from the request
    const { matches } = await req.json()
    
    // Format the match data for Google Sheets
    // Each row will contain: 
    // [Initiator Name, Initiator Company, Initiator Email, Target Name, Target Company, Target Email, Score, Mutual Match]
    const values = matches.map((match: any) => [
      `${match.initiator?.first_name || ''} ${match.initiator?.last_name || ''}`, 
      match.initiator?.company_name || '',
      match.initiator?.email || '',
      `${match.target?.first_name || ''} ${match.target?.last_name || ''}`,
      match.target?.company_name || '',
      match.target?.email || '',
      match.score || 0,
      match.has_mutual_match ? 'Yes' : 'No',
      new Date(match.created_at).toISOString()
    ])
    
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
    ]
    
    values.unshift(headers)

    console.log(`Getting Google OAuth token for authenticated request...`)
    const accessToken = await getGoogleAuthToken()
    console.log(`Successfully obtained Google OAuth token`)

    // Update Google Sheets with OAuth2 token
    console.log(`Updating Google Sheet ${SPREADSHEET_ID}...`)
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/PriorityMatches!A1:I${values.length}?valueInputOption=RAW`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          range: `PriorityMatches!A1:I${values.length}`,
          majorDimension: 'ROWS',
          values,
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Google Sheets API Error:', errorData)
      throw new Error(`Failed to update Google Sheets: ${response.status} ${JSON.stringify(errorData)}`)
    }

    const result = await response.json()
    console.log(`Google Sheets update successful: Updated ${result.updatedCells} cells`)

    return new Response(
      JSON.stringify({ success: true, updatedCells: result.updatedCells }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
