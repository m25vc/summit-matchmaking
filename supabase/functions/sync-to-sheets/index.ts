
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const GOOGLE_SHEETS_API_KEY = Deno.env.get('GOOGLE_SHEETS_API_KEY')
const SPREADSHEET_ID = Deno.env.get('GOOGLE_SHEETS_SPREADSHEET_ID')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get matches data from the request
    const { matches } = await req.json()

    // Format data for Google Sheets
    const values = matches.map((match: any) => [
      match.founder_id,
      match.investor_id,
      match.priority,
      match.created_at,
      match.set_by
    ])

    // Update Google Sheets
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Matches!A2:E${values.length + 1}?valueInputOption=RAW`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${GOOGLE_SHEETS_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          range: `Matches!A2:E${values.length + 1}`,
          majorDimension: 'ROWS',
          values,
        }),
      }
    )

    if (!response.ok) {
      throw new Error('Failed to update Google Sheets')
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
