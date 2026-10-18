import path from 'node:path';
import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

/**
 * Cấu hình Vitest cho app web.
 *
 * - environment jsdom: test component React.
 * - Test colocate cạnh source dưới dạng `*.test.ts` / `*.test.tsx`.
 * - Alias `~/` khớp với `paths` trong tsconfig.json
 *   (`~/lib/*` -> `./lib/*`, `~/components/*` -> `./components/*`,
 *   `~/config/*` -> `./config/*`, còn lại -> `./app/*`).
 * - Dùng @vitejs/plugin-react (6.x, tương thích vite 8 đi kèm vitest 5)
 *   để transform JSX cho test component.
 */
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: ['**/*.test.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'dist', 'build', 'eslint-deps'],
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: [
      // @kit/ui không khai báo react trong dependencies (dựa vào host
      // app như Next/webpack). Với pnpm strict, vitest không resolve được
      // `react` từ trong packages/ui -> trỏ thẳng về bản của app web để
      // chỉ có đúng một copy React khi test.
      {
        find: /^react$/,
        replacement: path.resolve(rootDir, 'node_modules/react'),
      },
      {
        find: /^react\/jsx-runtime$/,
        replacement: path.resolve(rootDir, 'node_modules/react/jsx-runtime.js'),
      },
      {
        find: /^react\/jsx-dev-runtime$/,
        replacement: path.resolve(
          rootDir,
          'node_modules/react/jsx-dev-runtime.js',
        ),
      },
      {
        find: /^react-dom$/,
        replacement: path.resolve(rootDir, 'node_modules/react-dom'),
      },
      {
        find: /^~\/lib\/(.*)/,
        replacement: path.resolve(rootDir, 'lib/$1'),
      },
      {
        find: /^~\/components\/(.*)/,
        replacement: path.resolve(rootDir, 'components/$1'),
      },
      {
        find: /^~\/config\/(.*)/,
        replacement: path.resolve(rootDir, 'config/$1'),
      },
      {
        find: /^~\/(.*)/,
        replacement: path.resolve(rootDir, 'app/$1'),
      },
    ],
  },
});
