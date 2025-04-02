
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
    // Parse the request body only once
    const requestBody = await req.json();
    const { action, adminId } = requestBody;
    
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
      
      if (!adminId) {
        return new Response(
          JSON.stringify({ error: 'Admin ID is required to preserve admin account' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return await clearAllData(supabaseAdmin, adminId);
    } 
    else if (action === 'create') {
      // Create test data - existing functionality
      const count = 10;
      console.log(`Creating ${count} test users...`);
      const testUsers = Array.from({ length: count }, (_, i) => ({
        email: `test${i + 1}@test.com`,
        first_name: `Test`,
        last_name: `User ${i + 1}`,
        company_name: `Test Company ${i + 1}`,
        role: 'founder',
        user_type: 'founder'
      }));
    
      // Insert test users into the database
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .insert(testUsers);
    
      if (error) {
        console.error('Error creating test users:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to create test users' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Helper function to clear all data except admin user
async function clearAllData(supabase, adminId) {
  try {
    console.log('Starting to clear all data except admin user...');
    
    if (!adminId) {
      console.error('No admin ID provided');
      return new Response(
        JSON.stringify({ error: 'Admin ID is required to preserve admin account' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Helper function to delete all data for a set of user IDs
async function deleteUserData(supabase, userIds) {
  console.log(`Deleting data for ${userIds.length} users in the correct order...`);

  try {
    // First delete ALL priority_matches that could reference users being deleted
    console.log('Deleting priority matches data...');
    
    // 1. Delete priority matches where founder_id is in userIds
    const { error: founderPriorityMatchesError } = await supabase
      .from('priority_matches')
      .delete()
      .in('founder_id', userIds);
    
    if (founderPriorityMatchesError) {
      console.error('Error deleting founder priority matches:', founderPriorityMatchesError);
      throw new Error('Failed to delete priority matches where founder_id references users');
    }
    
    // 2. Delete priority matches where investor_id is in userIds
    const { error: investorPriorityMatchesError } = await supabase
      .from('priority_matches')
      .delete()
      .in('investor_id', userIds);
    
    if (investorPriorityMatchesError) {
      console.error('Error deleting investor priority matches:', investorPriorityMatchesError);
      throw new Error('Failed to delete priority matches where investor_id references users');
    }
    
    // 3. Delete priority matches where set_by is in userIds
    const { error: setByPriorityMatchesError } = await supabase
      .from('priority_matches')
      .delete()
      .in('set_by', userIds);
    
    if (setByPriorityMatchesError) {
      console.error('Error deleting set_by priority matches:', setByPriorityMatchesError);
      throw new Error('Failed to delete priority matches where set_by references users');
    }
    
    console.log('All priority matches deleted successfully');
    
    // Next delete matches table data
    console.log('Deleting matches data...');
    const { error: founderMatchesError } = await supabase
      .from('matches')
      .delete()
      .in('founder_id', userIds);
    
    if (founderMatchesError) {
      console.error('Error deleting founder matches:', founderMatchesError);
      throw new Error('Failed to delete matches where user is founder');
    } else {
      console.log('Founder matches deleted successfully');
    }

    const { error: investorMatchesError } = await supabase
      .from('matches')
      .delete()
      .in('investor_id', userIds);
    
    if (investorMatchesError) {
      console.error('Error deleting investor matches:', investorMatchesError);
      throw new Error('Failed to delete matches where user is investor');
    } else {
      console.log('Investor matches deleted successfully');
    }

    // Then delete founder_details and investor_details
    console.log('Deleting profile details...');
    const { error: founderDetailsError } = await supabase
      .from('founder_details')
      .delete()
      .in('profile_id', userIds);
    
    if (founderDetailsError) {
      console.error('Error deleting founder details:', founderDetailsError);
      throw new Error('Failed to delete founder details');
    } else {
      console.log('Founder details deleted');
    }

    const { error: investorDetailsError } = await supabase
      .from('investor_details')
      .delete()
      .in('profile_id', userIds);
    
    if (investorDetailsError) {
      console.error('Error deleting investor details:', investorDetailsError);
      throw new Error('Failed to delete investor details');
    } else {
      console.log('Investor details deleted');
    }

    // Finally delete profiles (they should now have no dependencies)
    console.log('Deleting user profiles...');
    const { error: profilesError } = await supabase
      .from('profiles')
      .delete()
      .in('id', userIds);
    
    if (profilesError) {
      console.error('Error deleting profiles:', profilesError);
      throw new Error('Failed to delete user profiles');
    }
    console.log('User profiles deleted successfully');

    // We don't delete from auth.users table because that will happen
    // automatically via cascade when the profiles are deleted
    console.log('All user data deleted successfully');
  } catch (error) {
    console.error('Error in deleteUserData:', error);
    throw error; // Rethrow to be handled by the calling function
  }
}

// Required for Supabase Edge Functions
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.33.1';
