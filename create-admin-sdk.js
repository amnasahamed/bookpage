const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function signUpUser() {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  let supabaseUrl = '';
  let anonKey = '';

  envContent.split('\n').forEach(line => {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
      supabaseUrl = line.split('=')[1].trim();
    }
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
      anonKey = line.split('=')[1].trim();
    }
  });

  const supabase = createClient(supabaseUrl, anonKey);
  const email = 'admin@bookpage.com';
  const password = 'AdminPassword!2026';

  console.log('Attempting to create user with email:', email);
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        property_name: 'BookPage Admin',
        property_slug: 'bookpage-admin',
      }
    }
  });

  if (error) {
    if (error.message.includes('already registered')) {
      console.log('User already registered. Trying to sign in to verify...');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (signInError) {
        console.error('Sign in failed:', signInError);
      } else {
        console.log('Sign in successful for existing admin account.');
      }
    } else {
      console.error('Signup error:', error);
    }
  } else {
    console.log('User created:', data.user?.id);
  }
}

signUpUser();
