'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import Link from 'next/link';

const CATEGORIES = [
  { value: 'writing',   label: '✍️ 写作' },
  { value: 'image',    label: '🎨 图像' },
  { value: 'video',    label: '🎬 视频' },
  { value: 'coding',   label: '💻 编程' },
  { value: 'audio',     label: '🎵 音频' },
  { value: 'chatbot',   label: '💬 对话' },
  { value: 'marketing', label: '📈 营销' },
  { value: 'other',     label: '🔧 其他' },
];

const PRICING_OPTIONS = [
  { value: 'Free',     label: '免费' },
  { value: 'Freemium', label: '免费+付费' },
  { value: 'Paid',     label: '付费' },
  { value: 'Unknown',  label: '未知' },
];

export default function SubmitPage() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name_en: '',
    name_zh: '',
    url: '',
    description: '',
    category: '',
    pricing: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name_en || !form.url || !form.category) {
      toast.error('请填写必填项：工具名称和官网链接');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error('提交失败');

      toast.success('✅ 提交成功！我们会尽快审核。');
      setForm({ name_en: '', name_zh: '', url: '', description: '', category: '', pricing: '' });
    } catch {
      toast.error('提交失败，请稍后重试。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen hero-gradient">
      <main className="container mx-auto px-4 py-10">
        <div className="max-w-2xl mx-auto">

          {/* Header */}
          <div className="reveal mb-10">
            <div
              className="h-0.5 w-16 rounded-full mb-5"
              style={{ backgroundColor: '#788c5d' }}
            />
            <div className="flex items-start gap-4 mb-2">
              <span className="text-5xl" role="img" aria-hidden="true">📮</span>
              <div>
                <h1 className="font-heading text-4xl font-medium text-[--brand-dark]">
                  提交工具
                </h1>
                <p className="text-sm text-muted-foreground mt-1 font-sans">
                  发现好用的 AI 工具？分享给大家
                </p>
              </div>
            </div>
          </div>

          {/* Form card */}
          <Card className="reveal reveal-delay-1 shadow-sm border-border/70">
            {/* Top accent */}
            <div
              className="h-0.5 rounded-t-lg"
              style={{ backgroundColor: '#788c5d' }}
            />
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Name row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name_en" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      工具名称（英文） <span className="text-[--brand-orange]">*</span>
                    </Label>
                    <Input
                      id="name_en"
                      value={form.name_en}
                      onChange={e => setForm(f => ({ ...f, name_en: e.target.value }))}
                      placeholder="e.g. ChatGPT"
                      className="h-10 border-border/70 focus-visible:ring-[--brand-orange] focus-visible:border-[--brand-orange]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="name_zh" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      工具名称（中文）
                    </Label>
                    <Input
                      id="name_zh"
                      value={form.name_zh}
                      onChange={e => setForm(f => ({ ...f, name_zh: e.target.value }))}
                      placeholder="e.g. 对话助手"
                      className="h-10 border-border/70 focus-visible:ring-[--brand-orange] focus-visible:border-[--brand-orange]"
                    />
                  </div>
                </div>

                {/* URL */}
                <div className="space-y-1.5">
                  <Label htmlFor="url" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    官网链接 <span className="text-[--brand-orange]">*</span>
                  </Label>
                  <Input
                    id="url"
                    type="url"
                    value={form.url}
                    onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                    placeholder="https://..."
                    className="h-10 border-border/70 focus-visible:ring-[--brand-orange] focus-visible:border-[--brand-orange]"
                  />
                </div>

                {/* Category + Pricing */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      分类 <span className="text-[--brand-orange]">*</span>
                    </Label>
                    <Select
                      value={form.category}
                      onValueChange={v => setForm(f => ({ ...f, category: v || '' }))}
                    >
                      <SelectTrigger className="h-10 border-border/70 focus-visible:ring-[--brand-orange] focus-visible:border-[--brand-orange]">
                        <SelectValue placeholder="选择分类" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      定价
                    </Label>
                    <Select
                      value={form.pricing}
                      onValueChange={v => setForm(f => ({ ...f, pricing: v || '' }))}
                    >
                      <SelectTrigger className="h-10 border-border/70 focus-visible:ring-[--brand-orange] focus-visible:border-[--brand-orange]">
                        <SelectValue placeholder="选择定价" />
                      </SelectTrigger>
                      <SelectContent>
                        {PRICING_OPTIONS.map(p => (
                          <SelectItem key={p.value} value={p.value}>
                            {p.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <Label htmlFor="description" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    工具描述
                  </Label>
                  <Textarea
                    id="description"
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="简要描述这个工具是做什么的..."
                    rows={4}
                    className="border-border/70 focus-visible:ring-[--brand-orange] focus-visible:border-[--brand-orange] resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-11 bg-[--brand-orange] hover:bg-[#c4674a] text-white font-medium shadow-sm transition-all active:scale-[0.98]"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 12a9 9 0 11-6.219-8.56" />
                      </svg>
                      提交中...
                    </span>
                  ) : (
                    '提交工具'
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground font-sans">
                  提交后我们会尽快审核并上线 ·{' '}
                  <Link href="/" className="text-[--brand-orange] hover:underline">
                    先看看其他工具
                  </Link>
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
