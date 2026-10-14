/*
 * ---------------------------------------------------------------------------
 * Recipe Sharing — Đưa hàm thu hồi session sang schema public (TASK 6)
 *
 * Migration 20261014310000 tạo `kit.revoke_user_sessions`, nhưng PostgREST
 * (Supabase API) theo mặc định chỉ expose schema `public` cho RPC, nên lệnh
 * gọi `supabase.rpc('revoke_user_sessions')` từ server action
 * `lockAccountAction` sẽ 404 ở runtime. Migration này tạo lại hàm trong
 * schema `public` (giữ nguyên logic SECURITY DEFINER, chỉ service_role
 * được EXECUTE) và xóa bản cũ ở schema `kit` để tránh trùng lặp.
 * ---------------------------------------------------------------------------
 */

drop function if exists kit.revoke_user_sessions(uuid);

create or replace function public.revoke_user_sessions(p_user_id uuid)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_deleted integer;
begin
  delete from auth.sessions
  where user_id = p_user_id;

  get diagnostics v_deleted = row_count;

  return v_deleted;
end;
$$;

revoke all on function public.revoke_user_sessions(uuid) from public, anon, authenticated;
grant execute on function public.revoke_user_sessions(uuid) to service_role;

comment on function public.revoke_user_sessions(uuid) is
  'Thu hồi toàn bộ session (refresh token) của một user khi admin khóa tài khoản. Chỉ service_role được gọi qua RPC.';
