import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import ToolCard from '@/components/ToolCard';

export const dynamic = 'force-dynamic';

export default async function NewPage() {
  const supabase = await createServerSupabaseClient();

  const { data: tools, count } = await supabase
    .from('tools')
    .select('id, slug, name_en, name_zh, category, pricing, votes, tags, discovered_at', {
      count: 'exact',
    })
    .eq('status', 'active')
    .order('discovered_at', { ascending: false })
    .limit(60);

  return (
    <div className="min-h-screen hero-gradient">
      <main className="container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <div className="reveal mb-10">
            <div
              className="h-0.5 w-16 rounded-full mb-5"
              style={{ backgroundColor: '#788c5d' }}
            />
            <div className="flex items-start gap-4 mb-2">
              <span className="text-5xl" role="img" aria-hidden="true">✨</span>
              <div>
                <h1 className="font-heading text-4xl font-medium text-[--brand-dark]">
                  最新收录
                </h1>
                <p className="text-sm text-muted-foreground mt-1 font-sans">
                  Recently Added · 共 {count ?? 0} 个工具
                </p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="reveal reveal-delay-1 mb-10">
            <form method="get" action="/search" className="flex gap-2">
              <div className="flex-1 flex items-center gap-2 border border-border rounded-xl px-3.5 bg-card shadow-sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground shrink-0">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
                <Input
                  name="q"
                  placeholder="搜索最新工具..."
                  className="h-10 flex-1 border-0 shadow-none text-sm bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
                />
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tools.map((tool, i) => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  animationDelay={0.2 + i * 0.04}
                  meta={`收录于 ${tool.discovered_at ?? '—'}`}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 border border-dashed border-border rounded-2xl">
              <p className="font-heading text-xl text-muted-foreground mb-2">暂无最新工具</p>
              <p className="text-sm text-muted-foreground">数据导入后这里会显示</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
