import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const CATEGORY_MAP: Record<string, { label: string; emoji: string; accent: string; desc: string }> = {
  writing:   { label: '写作',   emoji: '✍️', accent: '#6a9bcc', desc: 'AI 写作与文本生成工具' },
  image:     { label: '图像',   emoji: '🎨', accent: '#c4a35a', desc: 'AI 图像生成与编辑工具' },
  video:     { label: '视频',   emoji: '🎬', accent: '#d97757', desc: 'AI 视频创作与剪辑工具' },
  coding:    { label: '编程',   emoji: '💻', accent: '#788c5d', desc: 'AI 编程与代码辅助工具' },
  audio:     { label: '音频',   emoji: '🎵', accent: '#8e6b5a', desc: 'AI 音频生成与处理工具' },
  chatbot:   { label: '对话',   emoji: '💬', accent: '#7c6a9b', desc: 'AI 对话与助手工具' },
  marketing: { label: '营销',   emoji: '📈', accent: '#5a8ec4', desc: 'AI 营销与增长工具' },
  other:     { label: '其他',   emoji: '🔧', accent: '#b0aea5', desc: '其他 AI 工具' },
};

const PRICING_BADGE: Record<string, string> = {
  Free:     'bg-[#788c5d]/10 text-[#788c5d] border-[#788c5d]/20',
  Freemium: 'bg-[#6a9bcc]/10 text-[#6a9bcc] border-[#6a9bcc]/20',
  Paid:     'bg-[#d97757]/10 text-[#d97757] border-[#d97757]/20',
  Unknown:  'bg-muted text-muted-foreground border-border',
};

function CategoryCard({
  tool,
  accent,
  delay,
}: {
  tool: {
    id: string;
    slug: string;
    name_en: string;
    name_zh: string | null;
    pricing: string | null;
    votes: number | null;
    tags: string[] | null;
  };
  accent: string;
  delay: number;
}) {
  return (
    <Link
      href={`/tool/${tool.slug}`}
      className="group block reveal"
      style={{ animationDelay: `${delay}s` }}
    >
      <Card className="card-lift border-border/70 bg-card overflow-hidden">
        {/* Top accent line */}
        <div
          className="h-0.5 w-full transition-all duration-300 group-hover:w-[50%]"
          style={{ backgroundColor: accent }}
        />
        <CardHeader className="pb-3 pt-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <CardTitle className="text-sm font-medium group-hover:text-[--brand-orange] transition-colors truncate">
                {tool.name_zh || tool.name_en}
              </CardTitle>
              <CardDescription className="text-xs mt-0.5 truncate text-muted-foreground/70">
                {tool.name_en}
              </CardDescription>
            </div>
            <Badge
              variant="secondary"
              className={`text-[10px] shrink-0 px-1.5 py-0 border font-medium ${
                PRICING_BADGE[tool.pricing ?? 'Unknown'] ?? PRICING_BADGE.Unknown
              }`}
            >
              {tool.pricing ?? 'Free'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex gap-1 flex-wrap">
              {tool.tags?.slice(0, 2).map((t: string) => (
                <Badge
                  key={t}
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 text-muted-foreground truncate max-w-[72px]"
                >
                  {t}
                </Badge>
              ))}
              {tool.tags && tool.tags.length > 2 && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground">
                  +{tool.tags.length - 2}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" className="text-[--brand-orange]">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              <span className="font-medium">{tool.votes ?? 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: tools, count } = await supabase
    .from('tools')
    .select('id, slug, name_en, name_zh, pricing, votes, tags', {
      count: 'exact',
    })
    .eq('status', 'active')
    .eq('category', name)
    .order('votes', { ascending: false })
    .limit(60);

  const cat = CATEGORY_MAP[name];

  return (
    <div className="min-h-screen hero-gradient">
      <main className="container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto">

          {/* ── Category Header ── */}
          <div className="reveal mb-10">
            <div
              className="h-0.5 w-16 rounded-full mb-5"
              style={{ backgroundColor: cat?.accent ?? '#b0aea5' }}
            />
            <div className="flex items-start gap-4 mb-2">
              <span className="text-5xl" role="img" aria-hidden="true">
                {cat?.emoji ?? '🔧'}
              </span>
              <div>
                <h1 className="font-heading text-4xl font-medium text-[--brand-dark]">
                  {cat?.label ?? name}
                </h1>
                <p className="text-sm text-muted-foreground mt-1 font-sans">
                  {cat?.desc ?? ''}
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground font-sans">
              共收录 <span className="font-medium text-[--brand-dark]">{count ?? 0}</span>{' '}
              个工具
            </p>
          </div>

          {/* ── Search ── */}
          <div className="reveal reveal-delay-1 mb-10">
            <form
              method="get"
              action="/search"
              className="flex gap-2"
            >
              <div className="flex-1 flex items-center gap-2 border border-border rounded-xl px-3.5 bg-card shadow-sm">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-muted-foreground shrink-0"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <Input
                  name="q"
                  placeholder={`在 ${cat?.label ?? name} 中搜索...`}
                  className="h-10 flex-1 border-0 shadow-none text-sm bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
                />
                {name && <input type="hidden" name="category" value={name} />}
              </div>
              <Button
                type="submit"
                className="h-10 px-5 bg-[--brand-orange] hover:bg-[#c4674a] text-white font-medium shadow-sm"
              >
                搜索
              </Button>
            </form>
          </div>

          {/* ── Tool Grid ── */}
          {tools && tools.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tools.map((tool, i) => (
                <CategoryCard
                  key={tool.id}
                  tool={tool}
                  accent={cat?.accent ?? '#b0aea5'}
                  delay={0.2 + i * 0.04}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 border border-dashed border-border rounded-2xl">
              <p className="font-heading text-xl text-muted-foreground mb-2">
                该分类暂无工具
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                成为第一个贡献者
              </p>
              <Link
                href="/submit"
                className="inline-flex items-center gap-1.5 text-sm text-[--brand-orange] hover:underline font-medium"
              >
                提交工具 →
              </Link>
            </div>
          )}

          {/* ── Back link ── */}
          <div className="mt-12 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-[--brand-dark] transition-colors"
            >
              ← 返回首页
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
