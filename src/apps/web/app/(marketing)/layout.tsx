import { Suspense } from 'react';

import { BackToTop } from '~/components/content/back-to-top';
import { CookieConsent } from '~/components/cookie-consent';
import { SiteFooter } from '~/(marketing)/_components/site-footer';
import { SiteHeader } from '~/(marketing)/_components/site-header';

/**
 * Synchronous on purpose. This layout used to await the session so the header
 * could render the signed-in state, which put user data into the server HTML of
 * every marketing page and forced them out of shared caches. The header now
 * reads the session on the client, so this response is identical for everyone.
 *
 * SiteHeader dùng `usePathname()` (đánh dấu menu đang chọn) nên phải bọc trong
 * `<Suspense>`: khi prerender, phần header sẽ stream sau thay vì làm fail build.
 */
import { AuthModalProvider } from '~/components/recipes/auth-modal';

function SiteLayout(props: React.PropsWithChildren) {
  return (
    <AuthModalProvider>
      <div className={'flex min-h-[100vh] flex-col'}>
        <Suspense>
          <SiteHeader />
        </Suspense>

        {props.children}

        <SiteFooter />

        <BackToTop />

        <CookieConsent />
      </div>
    </AuthModalProvider>
  );
}

export default SiteLayout;
