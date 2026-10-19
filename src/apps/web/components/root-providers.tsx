'use client';

import type { AbstractIntlMessages } from 'next-intl';
import { ThemeProvider } from 'next-themes';

import { CaptchaProvider } from '@kit/auth/captcha/client';
import { I18nClientProvider } from '@kit/i18n/provider';
import { If } from '@kit/ui/if';
import { VersionUpdater } from '@kit/ui/version-updater';

import { AuthProvider } from '~/components/auth-provider';
import { AuthModalProvider } from '~/components/recipes/auth-modal';
import appConfig from '~/config/app.config';
import featuresFlagConfig from '~/config/feature-flags.config';

import { ReactQueryProvider } from './react-query-provider';

// Bỏ qua cảnh báo false-positive của React 19 đối với thẻ inline <script> của next-themes
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Encountered a script tag')
    ) {
      return;
    }
    originalError.apply(console, args);
  };
}

export function RootProviders({
  locale,
  messages,
  theme = appConfig.theme,
  children,
}: React.PropsWithChildren<{
  // The locale to use for the app
  locale: string;
  // The i18n messages
  messages: AbstractIntlMessages;
  theme?: string;
}>) {
  return (
    <ReactQueryProvider>
      <I18nClientProvider locale={locale} messages={messages}>
        <CaptchaProvider>
          <AuthProvider>
            <ThemeProvider
              attribute="class"
              enableSystem
              disableTransitionOnChange
              defaultTheme={theme}
              enableColorScheme={false}
            >
              <AuthModalProvider>
                {children}
              </AuthModalProvider>
            </ThemeProvider>
          </AuthProvider>
        </CaptchaProvider>

        <If condition={featuresFlagConfig.enableVersionUpdater}>
          <VersionUpdater />
        </If>
      </I18nClientProvider>
    </ReactQueryProvider>
  );
}
