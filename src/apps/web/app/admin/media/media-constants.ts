// Hằng số + type dùng chung cho trang quản lý media.
// PHẢI nằm ở file riêng (không "use server"): Next.js 16 chỉ cho phép file
// "use server" export async function — export object sẽ vỡ lúc build/dev.

export type MediaActionResult =
  | { ok: true; initial?: false }
  | { ok: false; message?: string; initial?: boolean };

export const MEDIA_ACTION_INITIAL: MediaActionResult = {
  ok: false,
  initial: true,
};
