'use client';

import Link from 'next/link';
import UserMenu from './UserMenu';
import { useEffect, useState } from 'react';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-background/90 backdrop-blur-md shadow-sm border-b'
          : 'bg-background/70 backdrop-blur-sm border-b border-transparent'
      }`}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-[--brand-orange] flex items-center justify-center text-white font-heading text-lg font-bold shadow-sm transition-transform group-hover:scale-110">
            AI
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-heading text-xl font-medium tracking-tight text-[--brand-dark]">
              导航
            </span>
            <span className="text-[10px] tracking-widest uppercase text-[--muted-foreground] font-sans">
              Discover
            </span>
          </div>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          {[
            { href: '/tools',      label: '全部' },
            { href: '/new',        label: '最新' },
            // 优惠暂时隐藏（上线前关闭）
            // { href: '/deals',      label: '优惠' },
            { href: '/graveyard',  label: '墓碑' },
            { href: '/submit',     label: '提交' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="px-3.5 py-2 text-sm font-medium text-muted-foreground hover:text-[--brand-dark] rounded-lg hover:bg-[--muted] transition-all duration-150"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
