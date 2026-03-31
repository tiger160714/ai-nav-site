import type { Metadata } from 'next';
import { Instrument_Serif, Instrument_Sans } from 'next/font/google';
import Header from '@/components/Header';
import { Toaster } from 'sonner';
import './globals.css';

const instrumentSerif = Instrument_Serif({
  variable: '--font-heading',
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  display: 'swap',
});

const instrumentSans = Instrument_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'AI 导航 - 发现最好的 AI 工具',
    template: '%s - AI 导航',
  },
  description:
    '收录 2500+ AI 工具，中文介绍，持续更新。发现最好用的 AI 工具，提升工作效率。',
  keywords: [
    'AI工具', 'AI导航', '人工智能', 'AI软件', 'AI工具集',
    'ChatGPT', 'Midjourney', 'Claude',
  ],
  authors: [{ name: 'AI Navigation', url: BASE_URL }],
  creator: 'AI Navigation',
  publisher: 'AI Navigation',
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    siteName: 'AI 导航',
    title: 'AI 导航 - 发现最好的 AI 工具',
    description: '收录 2500+ AI 工具，中文介绍，持续更新。',
    url: BASE_URL,
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'AI 导航' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI 导航 - 发现最好的 AI 工具',
    description: '收录 2500+ AI 工具，中文介绍，持续更新。',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: { canonical: BASE_URL },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="zh-CN"
      className={`${instrumentSerif.variable} ${instrumentSans.variable} noise-bg h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Header />
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
