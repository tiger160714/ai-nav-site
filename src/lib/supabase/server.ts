import { createClient } from '@supabase/supabase-js';

export async function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uqmcipazqilxjliennfe.supabase.co';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_publishable_G4BmqB2W4LEYrzp7sgOfSg_TUh6morm';

  return createClient(supabaseUrl, supabaseKey);
}
