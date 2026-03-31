import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uqmcipazqilxjliennfe.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_G4BmqB2W4LEYrzp7sgOfSg_TUh6morm';

export const supabase = createClient(supabaseUrl, supabaseKey);
