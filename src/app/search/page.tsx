import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import ToolCard from '@/components/ToolCard';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

type Props = {
  searchParams: Promise<{
    q?: string;
    category?: string;
    tag?: string;
    page?: string;
  }>;
};

const CATEGORY_LABELS: Record<string, string> = {
  writing: '✍️ 写作',
  image: '🎨 图像',
  video: '🎬 视频',
  coding: '💻 编程',
  audio: '🎵 音频',
  chatbot: '💬 对话',
  marketing: '📈 营销',
  other: '🔧 其他',
};

export async function generateMetadata({ searchParams }: Props) {
  const { q, category, tag } = await searchParams;
  const base = 'AI 导航';
  if (q) return { title: `"${q}" 搜索结果 - ${base}` };
  if (category) return { title: `${category} 类 AI 工具 - ${base}` };
  if (tag) return { title: `标签: ${tag} - ${base}` };
  return { title: `搜索 - ${base}` };
}

export default async function SearchPage({ searchParams }: Props) {
  const { q, category, tag, page } = await searchParams;
  const supabase = await createServerSupabaseClient();

  const pageNum = Math.max(1, parseInt(page ?? '1'));
  const perPage = 24;
  const offset = (pageNum - 1) * perPage;

  let query = supabase
    .from('tools')
    .select('id, slug, name_en, name_zh, category, pricing, votes, tags, status', {
      count: 'exact',
    })
    .eq('status', 'active')
    .range(offset, offset + perPage - 1)
    .order('votes', { ascending: false });

  if (q) {
    query = query.or(
      `name_en.ilike.%${q}%,name_zh.ilike.%${q}%,description_en.ilike.%${q}%,description_zh.ilike.%${q}%`
    );
  }
  if (category) query = query.eq('category', category);
  if (tag) query = query.contains('tags', [tag]);

  const { data: tools, count } = await query;
  const totalPages = Math.ceil((count ?? 0) / perPage);

  // Build query string
  const params: Record<string, string> = {};
  if (q) params.q = q;
  if (category) params.category = category;
  if (tag) params.tag = tag;
  const qs = new URLSearchParams(params);

  return (
    <div className="min-h-screen hero-gradient">
      <main className="container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <div className="reveal mb-8">
            <div
              className="h-0.5 w-16 rounded-full mb-5"
              style={{ backgroundColor: '#6a9bcc' }}
            />
            <h1 className="font-heading text-3xl font-medium text-[--brand-dark]">
              {q
                ? <>搜索结果：<span className="text-[--brand-orange]">"{q}"</span></>
                : category
                ? CATEGORY_LABELS[category] ?? category
                : tag
                ? <>标签：<BadgePill tag={tag} /></>
                : '全部工具'}
            </h1>
            <p className="text-xs text-muted-foreground mt-1 font-sans">
              共 {count ?? 0} 个结果
              {totalPages > 1 ? ` · 第 ${pageNum} / ${totalPages} 页` : ''}
            </p>
          </div>

          {/* Search bar */}
          <div className="reveal reveal-delay-1 mb-8">
            <form method="get" className="flex gap-2">
              <div className="flex-1 flex items-center gap-2 border border-border rounded-xl px-3.5 bg-card shadow-sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground shrink-0">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
                <Input
                  name="q"
                  defaultValue={q}
                  placeholder="搜索 AI 工具..."
                  className="h-10 flex-1 border-0 shadow-none text-sm bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
                />
                {category && <input type="hidden" name="category" value={category} />}
                {tag && <input type="hidden" name="tag" value={tag} />}
              </div>
              <Button
                type="submit"
                className="h-10 px-5 bg-[--brand-orange] hover:bg-[#c4674a] text-white font-medium shadow-sm"
              >
                搜索
              </Button>
            </form>
          </div>

          {/* Grid */}
          {tools && tools.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
              {tools.map((tool, i) => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  animationDelay={0.15 + i * 0.04}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 border border-dashed border-border rounded-2xl mb-10">
              <p className="font-heading text-xl text-muted-foreground mb-2">没有找到相关工具</p>
              <p className="text-sm text-muted-foreground">
                换个关键词试试，或者{' '}
                <Link href="/submit" className="text-[--brand-orange] hover:underline">
                  提交新工具
                </Link>
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="reveal flex items-center justify-center gap-3">
              {pageNum > 1 ? (
                <a href={`?${qs.toString()}&page=${pageNum - 1}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 gap-1.5 border-border text-sm"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M15 18l-6-6 6-6" />
                    </svg>
                    上一页
                  </Button>
                </a>
              ) : (
                <Button variant="outline" size="sm" className="h-9 gap-1.5 border-border text-sm opacity-40" disabled>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                  上一页
                </Button>
              )}

              <span className="text-sm text-muted-foreground px-2 font-sans tabular-nums">
                {pageNum} / {totalPages}
              </span>

              {pageNum < totalPages ? (
                <a href={`?${qs.toString()}&page=${pageNum + 1}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 gap-1.5 border-border text-sm"
                  >
                    下一页
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </Button>
                </a>
              ) : (
                <Button variant="outline" size="sm" className="h-9 gap-1.5 border-border text-sm opacity-40" disabled>
                  下一页
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </Button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function BadgePill({ tag }: { tag: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[--brand-lightgray] text-sm text-[--brand-dark] font-medium">
      {tag}
    </span>
  );
}
