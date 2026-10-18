/**
 * Setup chạy trước mỗi test file của Vitest.
 *
 * Dọn DOM sau mỗi test để các test render component không rò rỉ
 * sang nhau (vitest.config.ts để `globals: false` nên phải gọi
 * cleanup thủ công thay vì dựa vào auto-cleanup của Testing Library).
 */
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});
