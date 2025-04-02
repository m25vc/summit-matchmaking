// Add Deno serve and CORS handling
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    const { action } = await req.json();
    
    // Obtain URL and key from environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    if (action === 'clear') {
      // Clear only test data (users with test emails)
      console.log('Clearing test data...');
      return await clearTestData(supabaseAdmin);
    } 
    else if (action === 'clear-all') {
      // Clear all data except admin user
      console.log('Clearing ALL data...');
      return await clearAllData(supabaseAdmin);
    } 
    else if (action === 'create') {
      // Create test data - existing functionality
      const count = 10;
      console.log(`Creating ${count} test users...`);
      // ... existing create test users code ...
      return new Response(
        JSON.stringify({ message: 'Test data successfully created' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } 
    else {
      return new Response(
        JSON.stringify({ error: 'Invalid action' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper function to clear test data
async function clearTestData(supabase) {
  try {
    console.log('Finding test users to delete...');
    // Get all users with test email pattern
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, email')
      .like('email', '%test.com');

    if (usersError) {
      console.error('Error fetching test users:', usersError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch test users' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!users || users.length === 0) {
      console.log('No test users found');
      return new Response(
        JSON.stringify({ message: 'No test users found to delete' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract test user IDs
    const testUserIds = users.map(user => user.id);
    console.log(`Found ${testUserIds.length} test users to delete`);

    // Delete test data in correct order (respecting foreign key constraints)
    await deleteUserData(supabase, testUserIds);

    return new Response(
      JSON.stringify({ message: `Successfully deleted ${testUserIds.length} test users and their data` }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error clearing test data:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to clear test data' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Helper function to clear all data except admin user
async function clearAllData(supabase) {
  try {
    console.log('Starting to clear all data except admin user...');

    // Get current authenticated user (assumed to be admin)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('Error getting authenticated user:', authError);
      return new Response(
        JSON.stringify({ error: 'Failed to identify admin user' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'No authenticated user found' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const adminId = user.id;
    console.log(`Admin user ID: ${adminId} will be preserved`);

    // Get all non-admin users
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, email, role')
      .neq('id', adminId);

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch users to delete' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!users || users.length === 0) {
      console.log('No users found to delete (except admin)');
      return new Response(
        JSON.stringify({ message: 'No users found to delete' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const nonAdminUserIds = users.map(user => user.id);
    console.log(`Found ${nonAdminUserIds.length} users to delete`);

    // Delete all data related to non-admin users in correct order (respecting foreign key constraints)
    await deleteUserData(supabase, nonAdminUserIds);

    return new Response(
      JSON.stringify({ message: `Successfully deleted all data except admin user (${nonAdminUserIds.length} users deleted)` }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error clearing all data:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to clear all data' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Helper function to delete all data for a set of user IDs
async function deleteUserData(supabase, userIds) {
  console.log(`Deleting data for ${userIds.length} users in the correct order...`);

  // Delete priority matches first
  await Promise.all([
    // Delete founder's matches
    supabase
      .from('priority_matches')
      .delete()
      .in('founder_id', userIds)
      .then(({ error }) => {
        if (error) console.error('Error deleting founder priority matches:', error);
        else console.log('Founder priority matches deleted');
      }),
    // Delete investor's matches
    supabase
      .from('priority_matches')
      .delete()
      .in('investor_id', userIds)
      .then(({ error }) => {
        if (error) console.error('Error deleting investor priority matches:', error);
        else console.log('Investor priority matches deleted');
      })
  ]);

  // Then delete founder_details and investor_details
  await Promise.all([
    supabase
      .from('founder_details')
      .delete()
      .in('profile_id', userIds)
      .then(({ error }) => {
        if (error) console.error('Error deleting founder details:', error);
        else console.log('Founder details deleted');
      }),
    supabase
      .from('investor_details')
      .delete()
      .in('profile_id', userIds)
      .then(({ error }) => {
        if (error) console.error('Error deleting investor details:', error);
        else console.log('Investor details deleted');
      })
  ]);

  // Finally delete profiles (they should now have no dependencies)
  const { error: profilesError } = await supabase
    .from('profiles')
    .delete()
    .in('id', userIds);
  
  if (profilesError) {
    console.error('Error deleting profiles:', profilesError);
    throw new Error('Failed to delete user profiles');
  }
  console.log('User profiles deleted');

  // We don't delete from auth.users table because that will happen
  // automatically via cascade when the profiles are deleted
  console.log('All user data deleted successfully');
}

// Required for Supabase Edge Functions
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.33.1';
