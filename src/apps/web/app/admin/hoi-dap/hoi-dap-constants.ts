// Hằng số + type dùng chung cho form quản lý.
// PHẢI nằm ở file riêng (không "use server"): Next.js 16 chỉ cho phép file
// "use server" export async function — export object sẽ vỡ lúc build/dev.

export type AnswerActionResult =
  | { ok: true; initial?: false }
  | { ok: false; message?: string; initial?: boolean };

export const ANSWER_ACTION_INITIAL: AnswerActionResult = {
  ok: false,
  initial: true,
};
