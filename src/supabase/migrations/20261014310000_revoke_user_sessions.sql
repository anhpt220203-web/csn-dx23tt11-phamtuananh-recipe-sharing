/*
 * ---------------------------------------------------------------------------
 * Recipe Sharing — Thu hồi toàn bộ session của một user (TASK 5)
 *
 * Supabase Auth Admin API: đặt `ban_duration` chỉ chặn đăng nhập mới,
 * KHÔNG thu hồi session đang mở (theo tài liệu Supabase "User Management").
 * Vì vậy khi admin KHÓA tài khoản, server action sẽ gọi thêm hàm này để
 * xóa các dòng trong `auth.sessions` -> refresh token mất hiệu lực ngay,
 * user bị đăng xuất khỏi mọi thiết bị. (Access token JWT đã cấp vẫn còn hiệu
 * lực tới khi hết hạn `exp` — hành vi chuẩn của Supabase.)
 *
 * Hàm chạy SECURITY DEFINER, chỉ cấp EXECUTE cho service_role.
 * ---------------------------------------------------------------------------
 */

create or replace function kit.revoke_user_sessions(p_user_id uuid)
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

grant execute on function kit.revoke_user_sessions(uuid) to service_role;
