import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-black flex items-center justify-center">
      <div className="text-center px-4">
        <h1 className="text-9xl font-bold text-zinc-200 dark:text-zinc-800">404</h1>
        <h2 className="text-2xl font-semibold mb-4">页面未找到</h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          你访问的页面不存在，可能已被删除或地址有误。
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/">
            <Button>返回首页</Button>
          </Link>
          <Link href="/submit">
            <Button variant="outline">提交工具</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
