import { createClient } from '@supabase/supabase-js';

export async function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uqmcipazqilxjliennfe.supabase.co';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxbWNpcGF6cWlseGppZW5uZmUiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY4MjEwNzcwMywiZXhwIjoxOTc2NjgzNzAzfQ.Xf2u2j1U6U3m9zCyzLnQ_GZj61z2bZGLHL1U4HqQv2g';

  return createClient(supabaseUrl, supabaseKey);
}
