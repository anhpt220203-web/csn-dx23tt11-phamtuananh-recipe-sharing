// Hằng số + type dùng chung cho form quản lý.
// PHẢI nằm ở file riêng (không "use server"): Next.js 16 chỉ cho phép file
// "use server" export async function — export object sẽ vỡ lúc build/dev.

export type RatingActionResult = { ok: true } | { ok: false; message: string };

export const RATING_ACTION_INITIAL: RatingActionResult = { ok: true };
