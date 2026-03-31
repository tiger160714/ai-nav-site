import { createServerSupabaseClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import VoteButton from '@/components/VoteButton';
import Link from 'next/link';

interface Props {
  params: Promise<{ slug: string }>;
}

const CATEGORY_MAP: Record<string, { label: string; accent: string }> = {
  writing:   { label: '写作',   accent: '#6a9bcc' },
  image:     { label: '图像',   accent: '#c4a35a' },
  video:     { label: '视频',   accent: '#d97757' },
  coding:    { label: '编程',   accent: '#788c5d' },
  audio:     { label: '音频',   accent: '#8e6b5a' },
  chatbot:   { label: '对话',   accent: '#7c6a9b' },
  marketing: { label: '营销',   accent: '#5a8ec4' },
  other:     { label: '其他',   accent: '#b0aea5' },
};

const PRICING_STYLES: Record<string, string> = {
  Free:     'bg-[#788c5d]/10 text-[#788c5d] border-[#788c5d]/20',
  Freemium: 'bg-[#6a9bcc]/10 text-[#6a9bcc] border-[#6a9bcc]/20',
  Paid:     'bg-[#d97757]/10 text-[#d97757] border-[#d97757]/20',
  Unknown:  'bg-muted text-muted-foreground border-border',
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from('tools')
    .select('name_en, name_zh, description_zh, description_en')
    .eq('slug', slug)
    .single();

  if (!data) return { title: '未找到工具' };
  const name = data.name_zh || data.name_en;
  return {
    title: `${name} - AI 导航`,
    description: data.description_zh || data.description_en,
  };
}

export default async function ToolPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: tool } = await supabase
    .from('tools')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!tool) notFound();

  // increment views
  await supabase
    .from('tools')
    .update({ views: (tool.views || 0) + 1 })
    .eq('id', tool.id);

  const category = CATEGORY_MAP[tool.category] ?? {
    label: tool.category,
    accent: '#b0aea5',
  };
  const pricingStyle =
    PRICING_STYLES[tool.pricing ?? 'Unknown'] ?? PRICING_STYLES.Unknown;

  const description =
    tool.description_zh || tool.description_en || null;

  // ── Similar tools ──────────────────────────────────────────
  const { data: similarTools } = await supabase
    .from('tools')
    .select('id, slug, name_en, name_zh, category, pricing, votes, tags')
    .eq('status', 'active')
    .neq('id', tool.id)
    .order('votes', { ascending: false })
    .limit(6);

  // Filter to same category first, then fill with others
  const sameCat = similarTools?.filter(t => t.category === tool.category) ?? [];
  const others  = similarTools?.filter(t => t.category !== tool.category) ?? [];
  const fill    = [...sameCat, ...others].slice(0, 4);

  // If tool has tags, boost tools that share tags
  let recommended = fill;
  if (tool.tags && tool.tags.length > 0 && similarTools) {
    const scored = (similarTools ?? []).map(t => {
      const overlap = (t.tags ?? []).filter((tag: string) => (tool.tags ?? []).includes(tag)).length;
      return { ...t, score: overlap };
    });
    scored.sort((a, b) => b.score - a.score);
    recommended = scored.slice(0, 4);
  }

  return (
    <div className="min-h-screen hero-gradient">
      <main className="container mx-auto px-4 py-10">
        <div className="max-w-3xl mx-auto">

          {/* ── Back + Breadcrumb ── */}
          <div className="reveal mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-[--brand-dark] transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
              返回首页
            </Link>
          </div>

          {/* ── Tool Header ── */}
          <div className="reveal reveal-delay-1 mb-8">
            {/* Category accent line */}
            <div
              className="h-0.5 w-16 rounded-full mb-5"
              style={{ backgroundColor: category.accent }}
            />

            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div>
                <h1 className="font-heading text-4xl md:text-5xl font-medium text-[--brand-dark] leading-tight mb-1">
                  {tool.name_zh || tool.name_en}
                </h1>
                {tool.name_zh && (
                  <p className="text-lg text-muted-foreground font-sans">
                    {tool.name_en}
                  </p>
                )}

                {/* Badges row */}
                <div className="flex flex-wrap items-center gap-2 mt-4">
                  <Badge className={`text-xs font-medium border ${pricingStyle}`}>
                    {tool.pricing ?? 'Free'}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-xs gap-1.5 border-[#e2dfd8] text-muted-foreground"
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: category.accent }}
                    />
                    {category.label}
                  </Badge>
                  {tool.status === 'dead' && (
                    <Badge variant="destructive" className="text-xs">
                      已停止运营
                    </Badge>
                  )}
                </div>
              </div>

              {/* Vote + Views */}
              <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
                <VoteButton
                  toolId={tool.id}
                  initialVotes={tool.votes ?? 0}
                  toolSlug={tool.slug}
                />
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <span className="text-xs">{tool.views ?? 0} 次浏览</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Tags ── */}
          {tool.tags && tool.tags.length > 0 && (
            <div className="reveal reveal-delay-2 flex flex-wrap gap-2 mb-8">
              {tool.tags.map((tag: string) => (
                <Link key={tag} href={`/search?q=${encodeURIComponent(tag)}`}>
                  <Badge
                    variant="secondary"
                    className="tag-pill text-xs cursor-pointer font-normal"
                  >
                    {tag}
                  </Badge>
                </Link>
              ))}
            </div>
          )}

          {/* ── Description ── */}
          {description && (
            <Card className="reveal reveal-delay-3 mb-8 border-border/70 bg-card shadow-sm">
              <CardContent className="pt-6">
                <p className="font-sans text-base leading-[1.85] text-[--foreground]/85 whitespace-pre-wrap">
                  {description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* ── Similar Tools ── */}
          {recommended.length > 0 && (
            <div className="reveal reveal-delay-4 mb-10">
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="h-0.5 flex-1 rounded-full"
                  style={{ backgroundColor: category.accent }}
                />
                <span className="text-sm font-medium text-muted-foreground shrink-0">
                  相关工具
                </span>
                <div
                  className="h-0.5 flex-1 rounded-full"
                  style={{ backgroundColor: category.accent }}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recommended.map((t, i) => (
                  <Link
                    key={t.id}
                    href={`/tool/${t.slug}`}
                    className="group flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-[--brand-dark]/30 hover:shadow-sm transition-all"
                  >
                    {/* Accent dot */}
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: CATEGORY_MAP[t.category]?.accent ?? '#b0aea5' }}
                    />
                    <div className="min-w-0">
                      <div className="font-medium text-sm group-hover:text-[--brand-dark] transition-colors truncate">
                        {t.name_zh || t.name_en}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {CATEGORY_MAP[t.category]?.label ?? t.category}
                        {(t.tags ?? []).length > 0 && (
                          <span className="ml-2 text-muted-foreground/60">
                            · {t.tags[0]}
                          </span>
                        )}
                      </div>
                    </div>
                    {t.votes && t.votes > 0 && (
                      <div className="ml-auto shrink-0 text-xs text-muted-foreground/60">
                        ▲ {t.votes}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* ── CTA ── */}
          <div className="reveal reveal-delay-5 mb-10 flex flex-wrap gap-3">
            <a
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[--brand-orange] hover:bg-[#c4674a] text-white font-medium text-sm shadow-sm transition-all hover:shadow-md active:scale-95"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
              </svg>
              访问官网
            </a>

            {tool.affiliate_url && (
              <a
                href={tool.affiliate_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="h-11 gap-2 border-border text-sm"
                >
                  🔗 Affiliate 链接
                </Button>
              </a>
            )}

            <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border text-sm text-muted-foreground hover:text-[--brand-dark] hover:border-[--brand-dark] transition-all">
              ← 返回首页
            </Link>
          </div>

          {/* ── Meta footer ── */}
          <div className="reveal reveal-delay-6 text-xs text-muted-foreground border-t border-border pt-6 grid grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <span className="uppercase tracking-wider text-[10px] text-muted-foreground/60 block mb-0.5">
                收录时间
              </span>
              <span className="font-sans">{tool.discovered_at ?? '—'}</span>
            </div>
            {tool.last_verified_at && (
              <div>
                <span className="uppercase tracking-wider text-[10px] text-muted-foreground/60 block mb-0.5">
                  最后验证
                </span>
                <span className="font-sans">
                  {new Date(tool.last_verified_at).toLocaleDateString('zh-CN')}
                </span>
              </div>
            )}
            <div>
              <span className="uppercase tracking-wider text-[10px] text-muted-foreground/60 block mb-0.5">
                数据来源
              </span>
              <span className="font-sans">{tool.source ?? '—'}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
