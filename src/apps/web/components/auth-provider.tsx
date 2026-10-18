'use client';

import { useEffect } from 'react';

import { useAuthChangeListener } from '@kit/supabase/hooks/use-auth-change-listener';

import pathsConfig from '~/config/paths.config';

export function AuthProvider(props: React.PropsWithChildren) {
  useAuthChangeListener({
    appHomePath: pathsConfig.app.home,
    privatePathPrefixes: ['/profile', '/update-password', '/admin'],
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const current = window.location.pathname + window.location.search;
    if (current && !current.startsWith('/auth')) {
      try {
        sessionStorage.setItem('last_visited_path', current);
      } catch {
        // ignore storage errors
      }
    }
  });

  return props.children;
}
