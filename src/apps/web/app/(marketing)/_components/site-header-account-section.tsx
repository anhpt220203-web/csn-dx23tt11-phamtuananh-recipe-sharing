'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';

import { Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PersonalAccountDropdown } from '@kit/accounts/personal-account-dropdown';
import { useSignOut } from '@kit/supabase/hooks/use-sign-out';
import { useUser } from '@kit/supabase/hooks/use-user';
import { Button } from '@kit/ui/button';
import { If } from '@kit/ui/if';
import { Trans } from '@kit/ui/trans';

import featuresFlagConfig from '~/config/feature-flags.config';
import pathsConfig from '~/config/paths.config';

const ModeToggle = dynamic(
  () =>
    import('@kit/ui/mode-toggle').then((mod) => ({
      default: mod.ModeToggle,
    })),
  {
    ssr: false,
  },
);

const paths = {
  home: '/',
  profile: '/profile',
};

const features = {
  enableThemeToggle: featuresFlagConfig.enableThemeToggle,
};

/**
 * The session is read on the client, never on the server. Reading it in the
 * marketing layout put user data into the server HTML, which is why those pages
 * had to be kept out of shared caches. The server response is now identical for
 * every visitor, so marketing pages are safe on any CDN.
 *
 * The trade-off is that a signed-in visitor briefly sees the signed-out actions
 * until the session resolves on the client.
 */
export function SiteHeaderAccountSection() {
  const signOut = useSignOut();
  const { data: user } = useUser();

  if (!user) {
    return <AuthButtons />;
  }

  return (
    <div className={'flex items-center gap-1.5'}>
      <If condition={features.enableThemeToggle}>
        <div className={'hidden sm:block'}>
          <ModeToggle />
        </div>
      </If>

      <Button
        variant={'ghost'}
        size={'sm'}
        nativeButton={false}
        render={<Link href={'/yeu-thich'} />}
        className={'flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-red-500'}
        title={'Danh sách món yêu thích'}
      >
        <Heart className={'h-4 w-4 fill-red-500 text-red-500'} aria-hidden={true} />
        <span className={'hidden sm:inline'}>Món yêu thích</span>
      </Button>

      <PersonalAccountDropdown
        showProfileName={false}
        paths={paths}
        features={features}
        user={user}
        signOutRequested={() => signOut.mutateAsync()}
      />
    </div>
  );
}

function AuthButtons() {
  const router = useRouter();

  const handleNavigate = (path: string) => (e: React.MouseEvent) => {
    if (typeof window !== 'undefined') {
      const current = window.location.pathname + window.location.search;
      if (current && !current.startsWith('/auth')) {
        e.preventDefault();
        router.push(`${path}?next=${encodeURIComponent(current)}`);
      }
    }
  };

  return (
    <div className={'flex space-x-2'}>
      <div className={'hidden space-x-0.5 md:flex'}>
        <If condition={features.enableThemeToggle}>
          <ModeToggle />
        </If>

        <Button
          nativeButton={false}
          render={
            <Link
              href={pathsConfig.auth.signIn}
              onClick={handleNavigate(pathsConfig.auth.signIn)}
            />
          }
          variant={'ghost'}
        >
          <Trans i18nKey={'auth.signIn'} />
        </Button>
      </div>

      <Button
        nativeButton={false}
        render={
          <Link
            href={pathsConfig.auth.signUp}
            onClick={handleNavigate(pathsConfig.auth.signUp)}
          />
        }
        className="group"
        variant={'default'}
      >
        <Trans i18nKey={'auth.signUp'} />
      </Button>
    </div>
  );
}
