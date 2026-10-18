// Hằng số + type dùng chung cho trang quản lý media.
// PHẢI nằm ở file riêng (không "use server"): Next.js 16 chỉ cho phép file
// "use server" export async function — export object sẽ vỡ lúc build/dev.

export type MediaActionResult = { ok: true } | { ok: false; message: string };

export const MEDIA_ACTION_INITIAL: MediaActionResult = { ok: true };
