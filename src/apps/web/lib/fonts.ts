import localFont from 'next/font/local';

/**
 * @sans
 * @description Define here the sans font.
 * Inter is self-hosted (public/fonts/inter-latin.woff2) so the build does
 * not depend on reaching Google Fonts at build time.
 */
const sans = localFont({
  src: '../public/fonts/inter-latin.woff2',
  variable: '--font-sans',
  weight: '300 700',
  fallback: ['system-ui', 'Helvetica Neue', 'Helvetica', 'Arial'],
  preload: true,
});

/**
 * @heading
 * @description Define here the heading font.
 */
const heading = sans;

// we export these fonts into the root layout
export { sans, heading };
