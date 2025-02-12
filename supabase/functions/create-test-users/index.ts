
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const testUsers = [
  {
    email: 'founder1@test.com',
    password: 'testpass123',
    user_metadata: {
      first_name: 'John',
      last_name: 'Smith',
      company_name: 'TechStart',
      job_title: 'CEO',
      user_type: 'founder'
    },
    profile_data: {
      company_description: 'AI-powered productivity platform',
      company_stage: 'Seed',
      funding_stage: 'Pre-seed',
      industry: 'Software',
      target_raise_amount: 1000000
    }
  },
  {
    email: 'founder2@test.com',
    password: 'testpass123',
    user_metadata: {
      first_name: 'Sarah',
      last_name: 'Johnson',
      company_name: 'GreenEnergy',
      job_title: 'Founder',
      user_type: 'founder'
    },
    profile_data: {
      company_description: 'Renewable energy storage solution',
      company_stage: 'Series A',
      funding_stage: 'Seed',
      industry: 'CleanTech',
      target_raise_amount: 5000000
    }
  },
  {
    email: 'investor1@test.com',
    password: 'testpass123',
    user_metadata: {
      first_name: 'Emily',
      last_name: 'Brown',
      company_name: 'Venture Capital Inc',
      job_title: 'Partner',
      user_type: 'investor'
    },
    profile_data: {
      firm_description: 'Early-stage technology fund',
      investment_thesis: 'Backing ambitious founders in emerging tech',
      min_investment_amount: 250000,
      max_investment_amount: 2000000,
      preferred_industries: ['Software', 'AI', 'SaaS'],
      preferred_stages: ['Seed', 'Pre-seed']
    }
  },
  {
    email: 'investor2@test.com',
    password: 'testpass123',
    user_metadata: {
      first_name: 'David',
      last_name: 'Wilson',
      company_name: 'Growth Fund',
      job_title: 'Managing Director',
      user_type: 'investor'
    },
    profile_data: {
      firm_description: 'Growth-focused venture fund',
      investment_thesis: 'Supporting scalable technology companies',
      min_investment_amount: 1000000,
      max_investment_amount: 10000000,
      preferred_industries: ['FinTech', 'Healthcare', 'Enterprise'],
      preferred_stages: ['Series A', 'Series B']
    }
  }
]

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Clear existing data first
    console.log('Clearing existing data...')
    const { error: deleteMatchesError } = await supabase
      .from('priority_matches')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')
    
    if (deleteMatchesError) console.error('Error deleting matches:', deleteMatchesError)

    // Delete all existing users
    console.log('Deleting existing users...')
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    for (const user of existingUsers.users) {
      const { error } = await supabase.auth.admin.deleteUser(user.id)
      if (error) console.error('Error deleting user:', error)
    }

    // Create new test users
    console.log('Creating new test users...')
    const createdUsers = []
    for (const testUser of testUsers) {
      // Create auth user
      const { data: userData, error: userError } = await supabase.auth.admin.createUser({
        email: testUser.email,
        password: testUser.password,
        email_confirm: true,
        user_metadata: testUser.user_metadata
      })

      if (userError) {
        console.error('Error creating user:', userError)
        continue
      }

      console.log('Created user:', userData.user.id)
      createdUsers.push({
        userId: userData.user.id,
        email: testUser.email,
        userType: testUser.user_metadata.user_type
      })

      // Add profile details
      if (testUser.user_metadata.user_type === 'founder') {
        const { error: founderError } = await supabase
          .from('founder_details')
          .insert({
            profile_id: userData.user.id,
            ...testUser.profile_data
          })
        
        if (founderError) console.error('Error creating founder details:', founderError)
      } else {
        const { error: investorError } = await supabase
          .from('investor_details')
          .insert({
            profile_id: userData.user.id,
            ...testUser.profile_data
          })
        
        if (investorError) console.error('Error creating investor details:', investorError)
      }
    }

    // Create some priority matches
    console.log('Creating priority matches...')
    const founders = createdUsers.filter(u => u.userType === 'founder')
    const investors = createdUsers.filter(u => u.userType === 'investor')

    for (let i = 0; i < founders.length && i < investors.length; i++) {
      const { error: matchError } = await supabase
        .from('priority_matches')
        .insert({
          founder_id: founders[i].userId,
          investor_id: investors[i].userId,
          priority: i === 0 ? 'high' : 'medium'
        })
      
      if (matchError) console.error('Error creating match:', matchError)
    }

    return new Response(
      JSON.stringify({ 
        message: 'Test users created successfully',
        users: createdUsers
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error in create-test-users function:', error)
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
