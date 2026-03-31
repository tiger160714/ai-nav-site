import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

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

export default async function GraveyardPage() {
  const supabase = await createServerSupabaseClient();

  const { data: tools, count } = await supabase
    .from('tools')
    .select('id, slug, name_en, name_zh, url, category, pricing, votes, tags, last_verified_at', {
      count: 'exact',
    })
    .eq('status', 'dead')
    .order('updated_at', { ascending: false })
    .limit(60);

  return (
    <div className="min-h-screen hero-gradient">
      <main className="container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <div className="reveal mb-8">
            <div
              className="h-0.5 w-16 rounded-full mb-5"
              style={{ backgroundColor: '#8e6b5a' }}
            />
            <div className="flex items-start gap-4 mb-2">
              <span className="text-5xl" role="img" aria-hidden="true">⚰️</span>
              <div>
                <h1 className="font-heading text-4xl font-medium text-[--brand-dark]">
                  墓碑
                </h1>
                <p className="text-sm text-muted-foreground mt-1 font-sans">
                  Graveyard · 共 {count ?? 0} 个已停止运营的 AI 工具
                </p>
              </div>
            </div>
          </div>

          {/* Warning banner */}
          <div className="reveal reveal-delay-1 mb-8 flex items-start gap-3 rounded-xl border border-[#c4a35a]/30 bg-[#c4a35a]/5 px-4 py-3 text-sm text-[--foreground]/70">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c4a35a" strokeWidth="2" className="shrink-0 mt-0.5">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span className="font-sans">
              以下工具可能已关闭、合并或停止服务。仅供参考，访问前请自行确认。
            </span>
          </div>

          {/* Grid */}
          {tools && tools.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tools.map((tool, i) => {
                const cat = CATEGORY_MAP[tool.category] ?? { label: tool.category, accent: '#b0aea5' };
                return (
                  <a
                    key={tool.id}
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block reveal"
                    style={{ animationDelay: `${0.2 + i * 0.04}s` }}
                  >
                    <Card className="card-lift h-full border-border/70 bg-card overflow-hidden opacity-75 hover:opacity-100 transition-opacity duration-300">
                      {/* Top accent — gray for dead */}
                      <div
                        className="h-0.5 w-full"
                        style={{ backgroundColor: cat.accent }}
                      />
                      <CardHeader className="pb-3 pt-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <CardTitle className="text-sm font-medium line-through decoration-[#8e6b5a]/40 text-muted-foreground truncate">
                              {tool.name_zh || tool.name_en}
                            </CardTitle>
                            <CardDescription className="text-xs mt-0.5 truncate text-muted-foreground/60">
                              {tool.name_en}
                            </CardDescription>
                          </div>
                          <Badge
                            variant="secondary"
                            className="text-[10px] shrink-0 px-1.5 py-0.5 border bg-[#8e6b5a]/10 text-[#8e6b5a] border-[#8e6b5a]/20 font-medium"
                          >
                            已关闭
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex gap-1 flex-wrap min-w-0">
                            {tool.tags?.slice(0, 2).map((t: string) => (
                              <Badge
                                key={t}
                                variant="outline"
                                className="text-[10px] px-1.5 py-0 text-muted-foreground truncate max-w-[72px]"
                              >
                                {t}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center gap-1 shrink-0 text-xs text-muted-foreground">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" className="text-[--brand-orange] opacity-50">
                              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                            <span className="tabular-nums">{tool.votes ?? 0}</span>
                          </div>
                        </div>
                        {tool.last_verified_at && (
                          <p className="text-[10px] text-muted-foreground mt-2 font-sans">
                            验证于 {new Date(tool.last_verified_at).toLocaleDateString('zh-CN')}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </a>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-24 border border-dashed border-border rounded-2xl">
              <p className="font-heading text-xl text-muted-foreground mb-2">暂无墓碑数据</p>
            </div>
          )}

          {/* Back */}
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
