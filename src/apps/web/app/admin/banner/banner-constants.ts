// Hằng số + type dùng chung cho form quản lý.
// PHẢI nằm ở file riêng (không "use server"): Next.js 16 chỉ cho phép file
// "use server" export async function — export object sẽ vỡ lúc build/dev.

export type BannerActionResult =
  | { ok: true; initial?: false }
  | { ok: false; message?: string; initial?: boolean };

export const BANNER_ACTION_INITIAL: BannerActionResult = {
  ok: false,
  initial: true,
};
