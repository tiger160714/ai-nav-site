import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

/* ── Category definitions with brand accent colors ── */
const CATEGORIES = [
  { id: 'writing',   label: '写作',   emoji: '✍️',  accent: '#6a9bcc' },
  { id: 'image',     label: '图像',   emoji: '🎨',  accent: '#c4a35a' },
  { id: 'video',     label: '视频',   emoji: '🎬',  accent: '#d97757' },
  { id: 'coding',    label: '编程',   emoji: '💻',  accent: '#788c5d' },
  { id: 'audio',     label: '音频',   emoji: '🎵',  accent: '#8e6b5a' },
  { id: 'chatbot',   label: '对话',   emoji: '💬',  accent: '#7c6a9b' },
  { id: 'marketing', label: '营销',   emoji: '📈',  accent: '#5a8ec4' },
  { id: 'other',     label: '其他',   emoji: '🔧',  accent: '#b0aea5' },
];

function CategoryPill({
  cat,
  delay,
}: {
  cat: (typeof CATEGORIES)[0];
  delay: number;
}) {
  return (
    <Link
      href={`/category/${cat.id}`}
      className="reveal cat-pill inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium border border-border bg-card shadow-sm hover:border-[--brand-orange]"
      style={{ animationDelay: `${delay}s` }}
    >
      <span
        className="w-2 h-2 rounded-full shrink-0"
        style={{ backgroundColor: cat.accent }}
      />
      <span>{cat.emoji}</span>
      <span className="text-muted-foreground">{cat.label}</span>
    </Link>
  );
}

function ToolCard({
  tool,
  delay,
}: {
  tool: {
    id: string;
    slug: string;
    name_en: string;
    name_zh: string | null;
    category: string;
    pricing: string | null;
    votes: number | null;
    tags: string[] | null;
  };
  delay: number;
}) {
  const cat = CATEGORIES.find((c) => c.id === tool.category) ?? {
    label: tool.category,
    emoji: '🔧',
    accent: '#b0aea5',
  };

  return (
    <Link
      href={`/tool/${tool.slug}`}
      className="group block reveal"
      style={{ animationDelay: `${delay}s` }}
    >
      <Card className="card-lift h-full border-border/70 bg-card overflow-hidden">
        {/* Top accent bar */}
        <div
          className="h-0.5 w-full transition-all duration-300 group-hover:w-[60%]"
          style={{ backgroundColor: cat.accent }}
        />

        <CardHeader className="pb-3 pt-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <CardTitle className="text-base font-medium leading-snug group-hover:text-[--brand-orange] transition-colors duration-200 truncate">
                {tool.name_zh || tool.name_en}
              </CardTitle>
              <CardDescription className="text-xs mt-0.5 truncate">
                {tool.name_en}
              </CardDescription>
            </div>

            {/* Pricing badge */}
            <Badge
              variant="secondary"
              className="text-[10px] shrink-0 px-2 py-0.5 font-medium"
            >
              {tool.pricing ?? 'Free'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="flex items-center justify-between gap-2">
            {/* Tags */}
            <div className="flex gap-1 flex-wrap min-w-0">
              {tool.tags?.slice(0, 2).map((tag: string) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 text-muted-foreground truncate max-w-[80px]"
                >
                  {tag}
                </Badge>
              ))}
              {tool.tags && tool.tags.length > 2 && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground">
                  +{tool.tags.length - 2}
                </Badge>
              )}
            </div>

            {/* Votes */}
            <div className="flex items-center gap-1 shrink-0 text-sm text-muted-foreground">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="text-[--brand-orange]"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              <span className="text-xs font-medium">{tool.votes ?? 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default async function HomePage() {
  const supabase = await createServerSupabaseClient();

  const [{ data: latestTools }, { count: totalCount }] = await Promise.all([
    supabase
      .from('tools')
      .select('id, slug, name_en, name_zh, category, pricing, votes, tags')
      .eq('status', 'active')
      .order('discovered_at', { ascending: false })
      .limit(12),
    supabase
      .from('tools')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active'),
  ]);

  const toolCount = totalCount ?? 0;

  return (
    <div className="min-h-screen hero-gradient">
      <main className="container mx-auto px-4">

        {/* ── Hero ── */}
        <section className="relative pt-20 pb-16 text-center">
          {/* Decorative large numeral */}
          <div
            className="absolute top-12 left-1/2 -translate-x-1/2 font-heading text-[160px] font-bold leading-none select-none pointer-events-none"
            style={{
              color: 'rgba(217,119,87,0.04)',
              letterSpacing: '-0.06em',
            }}
            aria-hidden
          >
            {toolCount > 0 ? toolCount.toLocaleString() : '2500+'}
          </div>

          <p className="reveal reveal-delay-1 text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4 font-sans font-medium">
            AI Tools Discovery
          </p>

          <h1 className="reveal reveal-delay-2 font-heading text-5xl md:text-7xl font-medium mb-5 tracking-tight text-[--brand-dark]">
            发现最好的
            <span className="gradient-text"> AI 工具</span>
          </h1>

          <p className="reveal reveal-delay-3 text-base md:text-lg text-muted-foreground mb-9 max-w-lg mx-auto leading-relaxed font-sans">
            收录 {toolCount > 0 ? `${toolCount.toLocaleString()}+` : '2500+'} 个 AI
            工具，持续追踪更新，帮你找到真正有用的那一个。
          </p>

          {/* Search */}
          <form
            action="/search"
            method="get"
            className="reveal reveal-delay-4 max-w-lg mx-auto"
          >
            <div className="flex gap-2 shadow-sm border border-border rounded-xl p-1.5 bg-card">
              <Input
                name="q"
                placeholder="搜索 AI 工具..."
                className="h-11 flex-1 border-0 shadow-none text-sm bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-2"
              />
              <Button
                type="submit"
                size="sm"
                className="h-9 px-5 bg-[--brand-orange] hover:bg-[#c4674a] text-white font-medium shadow-sm transition-colors"
              >
                搜索
              </Button>
            </div>
          </form>
        </section>

        {/* ── Categories ── */}
        <section className="reveal reveal-delay-5 mb-14">
          <div className="flex flex-wrap justify-center gap-2">
            {CATEGORIES.map((cat, i) => (
              <CategoryPill
                key={cat.id}
                cat={cat}
                delay={0.3 + i * 0.05}
              />
            ))}
          </div>
        </section>

        {/* ── Latest tools ── */}
        <section className="pb-24">
          <div className="flex items-baseline justify-between mb-8">
            <div>
              <h2 className="font-heading text-2xl md:text-3xl font-medium text-[--brand-dark]">
                最新收录
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Recently Added
              </p>
            </div>
            <Link
              href="/new"
              className="text-sm text-[--brand-orange] hover:underline font-medium"
            >
              查看全部 →
            </Link>
          </div>

          {latestTools && latestTools.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {latestTools.map((tool, i) => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  delay={0.4 + i * 0.06}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 border border-dashed border-border rounded-2xl">
              <p className="font-heading text-xl text-muted-foreground mb-2">
                暂无工具数据
              </p>
              <p className="text-sm text-muted-foreground">
                等待数据导入...
              </p>
            </div>
          )}
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-border bg-card">
        <div className="container mx-auto px-4 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-[--brand-orange] flex items-center justify-center text-white text-[10px] font-bold">
              AI
            </div>
            <span>AI 导航 · {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-6">
            <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="hover:text-[--brand-dark] transition-colors">
              Supabase
            </a>
            <a href="https://nextjs.org" target="_blank" rel="noopener noreferrer" className="hover:text-[--brand-dark] transition-colors">
              Next.js
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
