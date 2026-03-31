import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createServerSupabaseClient();

  console.log('ENV:', process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 10));

  const { data, error, count } = await supabase
    .from('tools')
    .select('id, name_en, name_zh', { count: 'exact' })
    .eq('status', 'active')
    .limit(3);

  return NextResponse.json({
    env: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
    data,
    error,
    count,
  });
}
