import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

let client = null;
if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
  client = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
} else {
  console.warn('Supabase server env missing: set SUPABASE_URL and SUPABASE_SERVICE_KEY');
}

export default client;
