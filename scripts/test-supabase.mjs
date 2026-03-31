import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uqmcipazqilxjliennfe.supabase.co';
const supabaseKey = 'sb_secret_hpLUSC2Fn7Nguwy8ZeRBsw_-acSL88G';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('🔄 测试 Supabase 连接...\n');

  // 1. 检查 tools 表数量
  const { count, error: countErr } = await supabase
    .from('tools')
    .select('*', { count: 'exact', head: true });
  console.log('✅ tools 表记录数:', count, countErr ? 'err: ' + JSON.stringify(countErr) : '');

  // 2. 插入一条测试数据
  const { data: insertData, error: insertErr } = await supabase
    .from('tools')
    .insert({
      slug: 'test-' + Date.now(),
      name_en: 'Supabase Test',
      name_zh: 'Supabase 测试',
      url: 'https://supabase.com',
      category: 'infrastructure',
      pricing: 'Free',
      status: 'active',
      votes: 0,
      views: 0,
      is_featured: false,
      is_deal: false,
      source: 'test',
    })
    .select('id')
    .single();

  if (insertErr) {
    console.log('❌ 插入失败:', JSON.stringify(insertErr));
  } else {
    console.log('✅ 插入成功! id:', insertData?.id);
  }

  // 3. 清理测试数据
  if (insertData?.id) {
    const { error: deleteErr } = await supabase.from('tools').delete().eq('id', insertData.id);
    console.log(deleteErr ? '🧹 清理失败' : '🧹 清理完成');
  }
}

main();
