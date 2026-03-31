import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function testInsert() {
  console.log('🔄 测试插入一条记录...');

  const { data, error } = await supabase
    .from('tools')
    .insert({
      slug: 'test-tool-' + Date.now(),
      name_en: 'Test Tool',
      name_zh: '测试工具',
      url: 'https://example.com',
      category: 'other',
      tags: ['test'],
      pricing: 'Free',
      votes: 1,
      status: 'active',
    })
    .select()
    .single();

  console.log('Insert result:', error ? 'err: ' + JSON.stringify(error) : 'success! id: ' + data?.id);
}

testInsert();
