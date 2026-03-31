import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 48;

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

const PRICING_STYLES: Record<string, string> = {
  Free:     'bg-[#788c5d]/10 text-[#788c5d] border-[#788c5d]/20',
  Freemium: 'bg-[#6a9bcc]/10 text-[#6a9bcc] border-[#6a9bcc]/20',
  Paid:     'bg-[#d97757]/10 text-[#d97757] border-[#d97757]/20',
  Unknown:  'bg-muted text-muted-foreground border-border',
};

function ToolCard({
  tool,
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
}) {
  const cat = CATEGORIES.find((c) => c.id === tool.category) ?? {
    label: tool.category,
    emoji: '🔧',
    accent: '#b0aea5',
  };
  const pricingStyle =
    PRICING_STYLES[tool.pricing ?? 'Unknown'] ?? PRICING_STYLES.Unknown;

  return (
    <Link href={`/tool/${tool.slug}`} className="group block">
      <Card className="card-lift h-full border-border/70 bg-card overflow-hidden hover:border-[--brand-dark]/30 transition-all">
        <div
          className="h-0.5 w-full transition-all duration-300 group-hover:w-[60%]"
          style={{ backgroundColor: cat.accent }}
        />
        <CardHeader className="pb-3 pt-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <CardTitle className="text-sm font-medium leading-snug group-hover:text-[--brand-orange] transition-colors duration-200 truncate">
                {tool.name_zh || tool.name_en}
              </CardTitle>
              <CardDescription className="text-xs mt-0.5 truncate">
                {tool.name_en}
              </CardDescription>
            </div>
            <Badge className={`text-[10px] shrink-0 px-2 py-0.5 font-medium border ${pricingStyle}`}>
              {tool.pricing ?? 'Free'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between gap-2">
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
            <div className="flex items-center gap-1 shrink-0">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="text-[--brand-orange]"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              <span className="text-xs font-medium text-muted-foreground">{tool.votes ?? 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

interface Props {
  searchParams: Promise<{ page?: string; category?: string }>;
}

export default async function ToolsPage({ searchParams }: Props) {
  const { page: pageStr, category } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? '1', 10));
  const offset = (page - 1) * PAGE_SIZE;

  const supabase = await createServerSupabaseClient();

  // Count total
  const countKey = category
    ? { status: 'active', category }
    : { status: 'active' };
  const { count: total } = await supabase
    .from('tools')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'active')
    .eq(category ? 'category' : 'id', category ? category : 'id')
    .neq('id', '00000000-0000-0000-0000-000000000000')
    .limit(1)
    .single() as any;

  // Simpler count query
  let countQuery = supabase
    .from('tools')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'active');
  if (category) countQuery = countQuery.eq('category', category);
  const { count: totalCount } = await countQuery;

  // Fetch tools
  let toolsQuery = supabase
    .from('tools')
    .select('id, slug, name_en, name_zh, category, pricing, votes, tags')
    .eq('status', 'active')
    .order('votes', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);
  if (category) toolsQuery = toolsQuery.eq('category', category);
  const { data: tools } = await toolsQuery;

  const totalPages = Math.ceil((totalCount ?? 0) / PAGE_SIZE);

  const currentCat = category ? CATEGORIES.find((c) => c.id === category) : null;

  return (
    <div className="min-h-screen hero-gradient">
      <main className="container mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-medium text-[--brand-dark] mb-2">
            {currentCat ? `${currentCat.emoji} ${currentCat.label}` : '🗂'} 所有工具
          </h1>
          <p className="text-muted-foreground text-sm">
            共 {totalCount ?? 0} 个工具
            {currentCat ? `（${currentCat.label}分类）` : ''}
          </p>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Link
            href="/tools"
            className={`px-4 py-1.5 rounded-full text-sm border transition-all ${
              !category
                ? 'bg-[--brand-orange] text-white border-[--brand-orange]'
                : 'border-border bg-card hover:border-[--brand-dark]/30'
            }`}
          >
            全部
          </Link>
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/tools?category=${cat.id}`}
              className={`px-4 py-1.5 rounded-full text-sm border transition-all ${
                category === cat.id
                  ? 'bg-[--brand-orange] text-white border-[--brand-orange]'
                  : 'border-border bg-card hover:border-[--brand-dark]/30'
              }`}
            >
              {cat.emoji} {cat.label}
            </Link>
          ))}
        </div>

        {/* Grid */}
        {tools && tools.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {tools.map((tool: any) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            暂无工具
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {page > 1 && (
              <Link
                href={`/tools?page=${page - 1}${category ? `&category=${category}` : ''}`}
                className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-all"
              >
                ← 上一页
              </Link>
            )}
            <span className="px-4 py-2 text-sm text-muted-foreground">
              第 {page} / {totalPages} 页
            </span>
            {page < totalPages && (
              <Link
                href={`/tools?page=${page + 1}${category ? `&category=${category}` : ''}`}
                className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-all"
              >
                下一页 →
              </Link>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
