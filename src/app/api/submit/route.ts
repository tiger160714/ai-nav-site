import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name_en, name_zh, url, description, category, pricing } = body;

    if (!name_en || !url) {
      return NextResponse.json(
        { error: 'name_en and url are required' },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // 生成 slug
    const slug = name_en
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 100) + '-' + Date.now().toString(36);

    const { data, error } = await supabase
      .from('submissions')
      .insert({
        name_en,
        name_zh: name_zh || null,
        url,
        description: description || null,
        category: category || null,
        pricing: pricing || 'Unknown',
        status: 'pending',
      })
      .select('id')
      .single();

    if (error) {
      console.error('Submission error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: data.id });
  } catch (err) {
    console.error('Submit API error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
