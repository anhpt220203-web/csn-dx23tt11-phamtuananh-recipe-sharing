// Hằng số + type dùng chung cho form quản lý.
// PHẢI nằm ở file riêng (không "use server"): Next.js 16 chỉ cho phép file
// "use server" export async function — export object sẽ vỡ lúc build/dev.

export type TipActionResult =
  | { ok: true; initial?: false }
  | { ok: false; message?: string; initial?: boolean };

export const TIP_ACTION_INITIAL: TipActionResult = {
  ok: false,
  initial: true,
};
