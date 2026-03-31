import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    // 获取当前用户
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const { tool_id } = await request.json();

    if (!tool_id) {
      return NextResponse.json({ error: 'tool_id is required' }, { status: 400 });
    }

    // 检查是否已经投过票
    const { data: existing } = await supabase
      .from('votes')
      .select('id')
      .eq('tool_id', tool_id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existing) {
      // 取消投票
      await supabase
        .from('votes')
        .delete()
        .eq('id', existing.id);

      // 重新获取最新票数
      const { data: tool } = await supabase
        .from('tools')
        .select('votes')
        .eq('id', tool_id)
        .single();

      return NextResponse.json({ voted: false, votes: tool?.votes || 0 });
    } else {
      // 投票
      await supabase
        .from('votes')
        .insert({ tool_id, user_id: user.id });

      // 重新获取最新票数
      const { data: tool } = await supabase
        .from('tools')
        .select('votes')
        .eq('id', tool_id)
        .single();

      return NextResponse.json({ voted: true, votes: (tool?.votes || 0) + 1 });
    }
  } catch (err) {
    console.error('Vote error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
