'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import type { Provider } from '@supabase/supabase-js';

import { isBrowser } from '@kit/shared/utils';
import { If } from '@kit/ui/if';
import { Separator } from '@kit/ui/separator';

import { MagicLinkAuthContainer } from './magic-link-auth-container';
import { OauthProviders } from './oauth-providers';
import { PasswordSignInContainer } from './password-sign-in-container';

function getRedirectTarget(
  nextFromQuery: string | null,
  fallbackHome: string,
): string {
  if (
    nextFromQuery &&
    nextFromQuery.startsWith('/') &&
    !nextFromQuery.startsWith('//') &&
    !nextFromQuery.startsWith('/auth')
  ) {
    return nextFromQuery;
  }

  if (isBrowser()) {
    try {
      const stored = sessionStorage.getItem('last_visited_path');
      if (
        stored &&
        stored.startsWith('/') &&
        !stored.startsWith('//') &&
        !stored.startsWith('/auth')
      ) {
        return stored;
      }
    } catch {
      // ignore storage access error
    }

    if (document.referrer) {
      try {
        const refUrl = new URL(document.referrer);
        if (refUrl.origin === window.location.origin) {
          const path = refUrl.pathname + refUrl.search;
          if (!path.startsWith('/auth')) {
            return path;
          }
        }
      } catch {
        // ignore URL parse error
      }
    }
  }

  return fallbackHome;
}

export function SignInMethodsContainer(props: {
  paths: {
    callback: string;
    home: string;
  };

  providers: {
    password: boolean;
    magicLink: boolean;
    oAuth: Provider[];
  };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextFromQuery = searchParams.get('next');
  const targetPath = getRedirectTarget(nextFromQuery, props.paths.home);

  const redirectUrl = isBrowser()
    ? new URL(
        `${props.paths.callback}?next=${encodeURIComponent(targetPath)}`,
        window?.location.origin,
      ).toString()
    : '';

  const onSignIn = () => {
    try {
      sessionStorage.removeItem('last_visited_path');
    } catch {
      // ignore
    }

    router.replace(targetPath);
  };

  return (
    <>
      <If condition={props.providers.password}>
        <PasswordSignInContainer onSignIn={onSignIn} />
      </If>

      <If condition={props.providers.magicLink}>
        <MagicLinkAuthContainer
          redirectUrl={redirectUrl}
          shouldCreateUser={false}
        />
      </If>

      <If condition={props.providers.oAuth.length}>
        <Separator />

        <OauthProviders
          enabledProviders={props.providers.oAuth}
          shouldCreateUser={false}
          paths={{
            callback: props.paths.callback,
            returnPath: targetPath,
          }}
        />
      </If>
    </>
  );
}
