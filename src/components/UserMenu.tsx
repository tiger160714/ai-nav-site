'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
// Google 登录已隐藏（暂时禁用）
// import GoogleLoginButton from './GoogleLoginButton';

export default function UserMenu() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return <Button variant="ghost" size="sm" disabled>加载中...</Button>;
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground hidden md:inline">
          {user.email}
        </span>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          退出
        </Button>
      </div>
    );
  }

  return null; // 隐藏登录按钮
}
