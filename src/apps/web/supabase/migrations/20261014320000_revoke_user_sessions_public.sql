/*
 * ---------------------------------------------------------------------------
 * Recipe Sharing — Wrapper public cho kit.revoke_user_sessions (TASK 6 fix)
 *
 * Hàm gốc nằm ở schema `kit`, vốn KHÔNG được PostgREST expose
 * (supabase/config.toml: schemas = ["public", "storage", "graphql_public"]),
 * nên server action gọi `adminClient.rpc('revoke_user_sessions', …)` sẽ lỗi
 * 404 ở runtime. Wrapper public này chuyển tiếp cuộc gọi tới hàm gốc.
 *
 * Bảo mật giữ nguyên ý đồ của migration gốc (20261014310000):
 *   - Hàm chạy SECURITY DEFINER, chỉ service_role được EXECUTE
 *     (thu hồi quyền mặc định của PUBLIC).
 *   - Server action vẫn phải kiểm tra quyền admin ở phía server trước khi gọi.
 * ---------------------------------------------------------------------------
 */

create or replace function public.revoke_user_sessions(p_user_id uuid)
returns integer
language sql
security definer
set search_path = ''
as $$
  select kit.revoke_user_sessions(p_user_id);
$$;

revoke all on function public.revoke_user_sessions(uuid) from public;
grant execute on function public.revoke_user_sessions(uuid) to service_role;

comment on function public.revoke_user_sessions(uuid) is
  'Thu hồi toàn bộ session đang mở của một user (wrapper public cho kit.revoke_user_sessions). Chỉ service_role được gọi.';
