'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface VoteButtonProps {
  toolId: string;
  initialVotes: number;
  toolSlug: string;
  className?: string;
}

export default function VoteButton({
  toolId,
  initialVotes,
  toolSlug,
  className,
}: VoteButtonProps) {
  const [votes, setVotes] = useState(initialVotes);
  const [voted, setVoted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [animating, setAnimating] = useState(false);

  const handleVote = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('请先登录后再投票');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool_id: toolId }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || '投票失败');
        return;
      }

      setVotes(data.votes ?? votes + 1);
      setVoted(data.voted);
      setAnimating(true);
      setTimeout(() => setAnimating(false), 400);
      toast.success(
        data.voted ? '✅ 感谢投票！' : '☑️ 已取消投票',
        { duration: 2000 }
      );
    } catch {
      toast.error('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleVote}
      disabled={loading}
      className={`
        vote-btn inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-medium
        transition-all duration-200
        ${voted
          ? 'border-[--brand-orange]/30 bg-[--brand-orange]/8 text-[--brand-orange]'
          : 'border-border bg-card text-muted-foreground hover:border-[--brand-orange]/40 hover:text-[--brand-dark]'
        }
        ${loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
        ${animating ? 'scale-110' : 'scale-100'}
        ${className ?? ''}
      `}
    >
      {/* Heart SVG — inline for brand color control */}
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill={voted ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.8"
        className={`transition-all duration-300 ${voted ? 'scale-110' : 'scale-100'}`}
      >
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
      </svg>

      <span className="font-semibold tabular-nums">{votes}</span>
      <span className="text-xs opacity-70">票</span>
    </button>
  );
}
