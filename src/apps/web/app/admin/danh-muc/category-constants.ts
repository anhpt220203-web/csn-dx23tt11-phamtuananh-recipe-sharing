// Hằng số + type dùng chung cho form danh mục.
// PHẢI nằm ở file riêng (không "use server"): Next.js 16 chỉ cho phép file
// "use server" export async function — export object sẽ vỡ lúc build/dev.

export type CategoryActionResult =
  | { ok: true }
  | { ok: false; message: string };

export const CATEGORY_ACTION_INITIAL: CategoryActionResult = { ok: true };
