import type { CategoryRow } from '~/lib/recipes/database';

export type CategoryActionResult =
  | { ok: true; initial?: false; category?: CategoryRow }
  | { ok: false; message?: string; initial?: boolean };

export const CATEGORY_ACTION_INITIAL: CategoryActionResult = {
  ok: false,
  initial: true,
};
