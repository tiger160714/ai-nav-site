/**
 * 从 dang.ai 采集数据导入到 Supabase
 *
 * 使用方法：
 *   1. 先设置环境变量
 *      export NEXT_PUBLIC_SUPABASE_URL="https://uqmcipazqilxjliennfe.supabase.co"
 *      export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
 *   2. 运行
 *      npx tsx scripts/import-to-supabase.ts
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import os from 'os';

// ─── 配置 ─────────────────────────────────────────────
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uqmcipazqilxjliennfe.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ 请设置 SUPABASE_SERVICE_ROLE_KEY 环境变量');
  console.error('   在 Supabase Dashboard → Settings → API → service_role key');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// dang.ai 数据目录
const DANG_DATA_DIR = path.join(os.homedir(), '.openclaw/workspace-dang-ai-curator/ai-nav-project/dang-ai/data/tools');

// ─── 类型 ─────────────────────────────────────────────
interface DangToolJson {
  name: string;
  slug: string;
  url: string;
  domain: string;
  tags: string[];
  pricing: string;
  votes: number;
  status?: string;
  discovered_at: string;
  detail?: {
    description_en?: string;
    pricing?: string;
    raw_text_sample?: string;
  };
}

// ─── 分类推断 ─────────────────────────────────────────
function guessCategory(tags: string[], description: string): string {
  const text = (tags.join(' ') + ' ' + (description || '')).toLowerCase();

  const rules: [RegExp, string][] = [
    [/video|视频/, 'video'],
    [/image|图片|photo|图像/, 'image'],
    [/write|写作|text|文本/, 'writing'],
    [/code|编程|developer|deve/, 'coding'],
    [/market|sale|营销|seo|广告/, 'marketing'],
    [/music|audio|sound|语音|配音/, 'audio'],
    [/chat|对话|assistant|客服|bot/, 'chatbot'],
    [/data|数据|analyt|分析/, 'analytics'],
    [/product|产品|project|项目|manage/, 'productivity'],
    [/design|设计|ui|ux|logo/, 'design'],
    [/learn|study|教育|学术|论文/, 'education'],
    [/api|集成|embed/, 'developer'],
    [/voice|说话|text.?to.?speech|tts/, 'audio'],
    [/translate|翻译/, 'translation'],
    [/search|搜索/, 'search'],
    [/game|游戏|entertain/, 'gaming'],
    [/social|社交|twitter|instagram/, 'social'],
    [/finance|金融|stock|投资/, 'finance'],
    [/health|健康|medical|医疗/, 'health'],
    [/real.?estate|房地产|housing/, 'real-estate'],
    [/hr|招聘|job|求职|简历/, 'hr'],
    [/legal|法律/, 'legal'],
    [/video.?edit|剪辑/, 'video-editing'],
    [/3d|模型|blender/, '3d'],
    [/prompt|提示词/, 'prompt'],
    [/avatar|虚拟形象|数字人/, 'avatar'],
    [/translate|翻译/, 'translation'],
  ];

  for (const [regex, category] of rules) {
    if (regex.test(text)) return category;
  }

  return 'other';
}

// ─── 主导入逻辑 ───────────────────────────────────────
async function importTools() {
  console.log('🚀 开始导入 dang.ai 数据到 Supabase...\n');

  // 检查目录
  if (!fs.existsSync(DANG_DATA_DIR)) {
    console.error(`❌ 数据目录不存在: ${DANG_DATA_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(DANG_DATA_DIR).filter(f => f.endsWith('.json'));
  console.log(`📁 发现 ${files.length} 个工具文件\n`);

  let imported = 0;
  let skipped = 0;
  let errors = 0;
  const errorLog: string[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = path.join(DANG_DATA_DIR, file);

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(content) as DangToolJson;

      if (!data.name || !data.slug) {
        skipped++;
        continue;
      }

      // 决定状态：dang.ai 的 graveyard 数据标记为 dead
      const status = data.status === 'dead' ? 'dead' : 'active';

      // 构建 upsert 数据
      const toolData = {
        slug: data.slug,
        name_en: data.name,
        name_zh: '',
        url: data.url || `https://dang.ai/tool/${data.slug}`,
        description_en: data.detail?.description_en || data.description || '',
        description_zh: '',
        category: guessCategory(data.tags || [], data.description || ''),
        tags: data.tags || [],
        pricing: data.detail?.pricing || data.pricing || 'Unknown',
        votes: data.votes || 0,
        status,
        source: 'dang_ai',
        discovered_at: data.discovered_at || new Date().toISOString().split('T')[0],
      };

      const { error } = await supabase.from('tools').upsert(toolData, {
        onConflict: 'slug',
        // 不更新已存在的 name_en（保留原始数据）
      });

      if (error) {
        errors++;
        errorLog.push(`${data.name}: ${error.message}`);
      } else {
        imported++;
      }

      // 进度输出
      if ((i + 1) % 100 === 0 || i === files.length - 1) {
        console.log(`📊 进度: ${i + 1}/${files.length} | 导入: ${imported} | 跳过: ${skipped} | 错误: ${errors}`);
      }

      // 限速：Supabase 免费版 60 req/s
      if ((i + 1) % 50 === 0) {
        await new Promise(r => setTimeout(r, 100));
      }

    } catch (err) {
      errors++;
      errorLog.push(`${file}: ${err}`);
    }
  }

  console.log('\n═══════════════════════════════════════');
  console.log(`✅ 导入完成`);
  console.log(`   成功: ${imported}`);
  console.log(`   跳过: ${skipped}`);
  console.log(`   错误: ${errors}`);
  console.log('═══════════════════════════════════════\n');

  if (errorLog.length > 0) {
    console.log('前 10 个错误：');
    errorLog.slice(0, 10).forEach(e => console.log(`  - ${e}`));
  }

  // 验证数据
  const { count } = await supabase.from('tools').select('*', { count: 'exact', head: true });
  console.log(`\n📦 Supabase tools 表总记录数: ${count}`);
}

// ─── 分类统计 ─────────────────────────────────────────
async function showStats() {
  console.log('\n📊 分类统计...\n');

  const { data, error } = await supabase
    .from('tools')
    .select('category, status, count')
    .in('status', ['active', 'dead'])
    .groupBy('category, status');

  if (error) {
    console.error('查询失败:', error.message);
    return;
  }

  const stats: Record<string, { active: number; dead: number }> = {};
  for (const row of data || []) {
    const cat = row.category as string;
    const st = row.status as string;
    if (!stats[cat]) stats[cat] = { active: 0, dead: 0 };
    stats[cat][st as 'active' | 'dead'] = row.count as number;
  }

  const sorted = Object.entries(stats).sort((a, b) =>
    (b[1].active + b[1].dead) - (a[1].active + a[1].dead)
  );

  for (const [cat, { active, dead }] of sorted) {
    console.log(`  ${cat.padEnd(15)} 活跃: ${String(active).padStart(4)}  |  死亡: ${String(dead).padStart(4)}`);
  }
}

// ─── 运行 ─────────────────────────────────────────────
async function main() {
  try {
    await importTools();
    await showStats();
  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  }
}

main();
