const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

// Only create client if credentials are provided
let supabase = null;

if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client connected successfully');
  } catch (error) {
    console.error('❌ Failed to create Supabase client:', error.message);
  }
} else {
  console.log('⚠️  Supabase credentials not found - running in development mode');
  console.log('   Create a .env file with SUPABASE_URL and SUPABASE_SERVICE_KEY');
}

module.exports = supabase;