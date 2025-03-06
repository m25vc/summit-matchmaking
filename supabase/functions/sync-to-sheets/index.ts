
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { createJWT } from "https://deno.land/x/djwt@v2.8/mod.ts"

const PRIVATE_KEY = Deno.env.get('GOOGLE_SHEETS_API_KEY')
const SPREADSHEET_ID = Deno.env.get('GOOGLE_SHEETS_SPREADSHEET_ID')
const CLIENT_EMAIL = Deno.env.get('GOOGLE_SHEETS_CLIENT_EMAIL')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Create a JWT token for Google API authentication
async function getGoogleAuthToken() {
  if (!PRIVATE_KEY || !CLIENT_EMAIL) {
    throw new Error('Missing required environment variables for Google Sheets authentication')
  }

  const privateKey = PRIVATE_KEY.replace(/\\n/g, '\n')
  
  const now = Math.floor(Date.now() / 1000)
  const payload = {
    iss: CLIENT_EMAIL,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  }

  const header = { alg: "RS256", typ: "JWT" }
  
  // Create JWT assertion
  const key = await crypto.subtle.importKey(
    "pkcs8",
    new TextEncoder().encode(privateKey),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  )
  
  const jwt = await createJWT(header, payload, key)
  
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
    console.error('Token exchange error:', tokenData)
    throw new Error(`Failed to get access token: ${JSON.stringify(tokenData)}`)
  }
  
  return tokenData.access_token
}

serve(async (req) => {
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

    // Get Google API access token
    const accessToken = await getGoogleAuthToken()

    // Update Google Sheets
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

    return new Response(
      JSON.stringify({ success: true }),
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
