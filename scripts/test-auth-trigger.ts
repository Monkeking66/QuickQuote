import * as dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';

if (!process.env.SUPABASE_URL) {
  throw new Error('Missing SUPABASE_URL environment variable');
}

if (!process.env.SUPABASE_SERVICE_KEY) {
  throw new Error('Missing SUPABASE_SERVICE_KEY environment variable');
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const testUserSignup = async () => {
  try {
    console.log('Step 1: Creating a test user...');
    
    // Create a test user with a random email to avoid conflicts
    const testEmail = `qa+test${Math.floor(Math.random() * 10000)}@example.com`;
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: 'Test1234!',
      options: {
        data: {
          full_name: 'Test User',
          business_name: 'Test Business'
        }
      }
    });
    
    if (signUpError) {
      throw signUpError;
    }
    
    console.log('User created successfully!');
    console.log('User ID:', authData.user?.id);
    console.log('Email:', testEmail);
    
    // Wait a moment for the trigger to fire
    console.log('Waiting for database trigger to fire...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Step 2: Check if the profile was created by the trigger
    console.log('\nStep 2: Verifying profile creation...');
    const userId = authData.user?.id;
    
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (profileError) {
      console.error('Error fetching profile:', profileError);
      throw profileError;
    }
    
    console.log('Profile found in database:');
    console.log(profileData);
    
    console.log('\n✅ Test completed successfully! The database trigger is working correctly.');
    
    // Alternatively, you can check for trigger errors in the Postgres logs
    console.log('\nNext steps:');
    console.log('1. Check for trigger errors in Supabase Dashboard → Logs → Postgres Logs');
    console.log('2. Filter for "ERROR" or "handle_new_user" to see any trigger function errors');
    
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
};

testUserSignup();
