/**
 * ESLint bổ trợ cho app web — chạy riêng qua `pnpm lint:eslint`.
 *
 * Vai trò: linter phụ, KHÔNG thay thế oxlint (oxlint vẫn là cổng verify
 * chính). Mọi rule ở đây đều hạ xuống `warn` để không chặn code legacy
 * trước demo 19/10; chỉ lỗi parse/syntax mới fail.
 *
 * Lưu ý kỹ thuật: typescript-eslint 8.x từ chối chạy với TypeScript 7.0
 * (repo đang dùng typescript 7.0.2), nên toàn bộ toolchain ESLint được cài
 * độc lập trong `./eslint-deps/` (kèm typescript 5.9.3 chỉ để parse) và
 * config này import qua đường dẫn tương đối. Chi tiết xem
 * `./eslint-deps/package.json`.
 */

import js from './eslint-deps/node_modules/@eslint/js/src/index.js';
import tseslint from './eslint-deps/node_modules/typescript-eslint/dist/index.js';
import reactPlugin from './eslint-deps/node_modules/eslint-plugin-react/index.js';
import reactHooks from './eslint-deps/node_modules/eslint-plugin-react-hooks/index.js';
import nextPlugin from './eslint-deps/node_modules/@next/eslint-plugin-next/dist/index.js';
import globals from './eslint-deps/node_modules/globals/index.js';

/**
 * Hạ mọi rule `error` trong (các) config xuống `warn`.
 * Rule `off` giữ nguyên `off`.
 */
function asWarnings(configs) {
  const list = Array.isArray(configs) ? configs : [configs];

  return list.map((entry) => {
    if (!entry || !entry.rules) {
      return entry;
    }

    const rules = {};

    for (const [name, value] of Object.entries(entry.rules)) {
      if (value === 'off' || value === 0) {
        rules[name] = 'off';
      } else if (Array.isArray(value)) {
        rules[name] = ['warn', ...value.slice(1)];
      } else {
        rules[name] = 'warn';
      }
    }

    return { ...entry, rules };
  });
}

export default tseslint.config(
  {
    name: 'tests-eslint/ignores',
    ignores: [
      'node_modules/**',
      '.next/**',
      'dist/**',
      'build/**',
      'coverage/**',
      'eslint-deps/**',
      'public/**',
    ],
  },
  {
    name: 'tests-eslint/base-language-options',
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2024,
      },
    },
  },

  // JS cơ bản.
  ...asWarnings(js.configs.recommended),

  // TypeScript: chỉ parse (không type-aware) để chạy nhanh.
  ...asWarnings(tseslint.configs.recommended),

  // React: chỉ áp cho file JSX/TSX.
  ...asWarnings(reactPlugin.configs.flat.recommended).map((entry) => ({
    name: 'tests-eslint/react',
    ...entry,
    files: ['**/*.jsx', '**/*.tsx'],
    settings: { react: { version: 'detect' } },
    rules: {
      ...entry.rules,
      // Không cần import React với jsx runtime tự động / Next.js.
      'react/react-in-jsx-scope': 'off',
      // TypeScript đã kiểm tra props.
      'react/prop-types': 'off',
    },
  })),

  // React Hooks.
  ...asWarnings(reactHooks.configs.flat.recommended),

  // Đăng ký plugin Next.js để các `eslint-disable @next/next/...` có sẵn
  // trong code không bị báo "rule not found". Không bật rule nào của
  // Next ở đây để giữ đúng triết lý warn-tối-thiểu của config này.
  {
    name: 'tests-eslint/next-plugin',
    files: ['**/*.jsx', '**/*.tsx'],
    plugins: { '@next/next': nextPlugin },
  },
);
