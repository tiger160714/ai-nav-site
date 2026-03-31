'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Tool {
  id: string;
  slug: string;
  name_en: string;
  name_zh: string | null;
  category: string;
  pricing: string | null;
  votes: number | null;
  tags: string[] | null;
  [key: string]: unknown;
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

interface ToolCardProps {
  tool: Tool;
  accentColor?: string;
  animationDelay?: number;
  extraBadges?: React.ReactNode;
  meta?: string;
}

export default function ToolCard({
  tool,
  accentColor,
  animationDelay = 0,
  extraBadges,
  meta,
}: ToolCardProps) {
  const cat = CATEGORY_MAP[tool.category] ?? { label: tool.category, accent: '#b0aea5' };
  const accent = accentColor ?? cat.accent;
  const pricingStyle = PRICING_STYLES[tool.pricing ?? 'Unknown'] ?? PRICING_STYLES.Unknown;

  return (
    <Link
      href={`/tool/${tool.slug}`}
      className="group block reveal"
      style={{ animationDelay: `${animationDelay}s` }}
    >
      <Card className="card-lift h-full border-border/70 bg-card overflow-hidden">
        {/* Top accent bar */}
        <div
          className="h-0.5 w-full transition-all duration-300 ease-out group-hover:w-[55%]"
          style={{ backgroundColor: accent }}
        />

        <CardHeader className="pb-3 pt-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <CardTitle className="text-sm font-medium leading-snug group-hover:text-[--brand-orange] transition-colors duration-200 truncate">
                {tool.name_zh || tool.name_en}
              </CardTitle>
              <CardDescription className="text-xs mt-0.5 truncate text-muted-foreground/70">
                {tool.name_en}
              </CardDescription>
            </div>

            <Badge
              variant="secondary"
              className={`text-[10px] shrink-0 px-1.5 py-0.5 border font-medium ${pricingStyle}`}
            >
              {tool.pricing ?? 'Free'}
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
              {tool.tags && tool.tags.length > 2 && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground">
                  +{tool.tags.length - 2}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0 text-xs text-muted-foreground">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" className="text-[--brand-orange]">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              <span className="font-medium tabular-nums">{tool.votes ?? 0}</span>
            </div>
          </div>

          {extraBadges && (
            <div className="mt-2">{extraBadges}</div>
          )}

          {meta && (
            <p className="text-[10px] text-muted-foreground mt-2 font-sans">{meta}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
