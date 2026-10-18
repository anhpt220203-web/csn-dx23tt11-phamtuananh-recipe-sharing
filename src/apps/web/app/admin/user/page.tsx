import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import type { User } from '@supabase/supabase-js';
import { ShieldCheck, User as UserIcon } from 'lucide-react';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';
import { Input } from '@kit/ui/input';

import { PaginationNav } from '~/(marketing)/_components/pagination-nav';
import type { RecipeSchema } from '~/lib/recipes/database';
import { requireAdminInServerComponent } from '~/lib/server/require-admin';

import {
  DeleteAccountButton,
  GrantAdminButton,
  LockAccountButton,
  RevokeAdminButton,
  UnlockAccountButton,
} from './_components/account-actions';

export const metadata: Metadata = {
  title: 'Quản lý tài khoản',
};

export const instant = false;

const PER_PAGE = 8;
const MAX_USERS_FETCH = 200;

const ROLE_FILTERS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'admin', label: 'Quản trị viên' },
  { value: 'user', label: 'Người dùng' },
  { value: 'banned', label: 'Đang bị khóa' },
] as const;

type RoleFilter = (typeof ROLE_FILTERS)[number]['value'];

function parsePage(value: string | undefined): number {
  const page = Number.parseInt(value ?? '1', 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

function buildAccountsHref({
  role = 'all',
  q = '',
  page = 1,
}: {
  role?: RoleFilter;
  q?: string;
  page?: number;
}): string {
  const params = new URLSearchParams();

  if (role !== 'all') {
    params.set('role', role);
  }

  const trimmed = q.trim();
  if (trimmed) {
    params.set('q', trimmed);
  }

  if (page > 1) {
    params.set('page', String(page));
  }

  const queryString = params.toString();
  return queryString ? `/admin/user?${queryString}` : '/admin/user';
}

function getDisplayName(user: User): string {
  const meta = user.user_metadata ?? {};

  const name =
    meta['name'] ?? meta['full_name'] ?? meta['display_name'] ?? meta['ten'];

  return typeof name === 'string' && name.trim().length > 0
    ? name
    : 'Chưa đặt tên';
}

function isBanned(user: User): boolean {
  if (!user.banned_until) {
    return false;
  }

  return new Date(user.banned_until).getTime() > Date.now();
}

function isAdmin(user: User): boolean {
  return user.app_metadata?.['role'] === 'admin';
}

function formatDateTime(value: string | undefined): string {
  if (!value) {
    return '—';
  }

  return new Date(value).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

type AccountsPageProps = {
  searchParams: Promise<{ role?: string; q?: string; page?: string }>;
};

export default async function AccountsPage({ searchParams }: AccountsPageProps) {
  // Trang admin đọc DB mỗi request, không prerender lúc build.
  await connection();

  const params = await searchParams;
  const page = parsePage(params.page);
  const q = (params.q ?? '').trim();
  const query = q.toLowerCase();
  const roleFilter: RoleFilter =
    params.role === 'admin' || params.role === 'user' || params.role === 'banned'
      ? params.role
      : 'all';

  // ID của admin đang đăng nhập (đã cache ở layout) — dùng để khóa các nút
  // thao tác nguy hiểm trên chính dòng tài khoản của mình.
  const { userId: currentAdminId } = await requireAdminInServerComponent();

  const adminClient = getSupabaseServerAdminClient<RecipeSchema>();

  const { data, error } = await adminClient.auth.admin.listUsers({
    page: 1,
    perPage: MAX_USERS_FETCH,
  });

  if (error) {
    throw new Error(`Không tải được danh sách tài khoản: ${error.message}`);
  }

  const allFilteredUsers = (data?.users ?? []).filter((user) => {
    const admin = isAdmin(user);
    const banned = isBanned(user);

    if (roleFilter === 'admin' && !admin) return false;
    if (roleFilter === 'user' && admin) return false;
    if (roleFilter === 'banned' && !banned) return false;

    if (!query) {
      return true;
    }

    const email = (user.email ?? '').toLowerCase();
    const name = getDisplayName(user).toLowerCase();

    return email.includes(query) || name.includes(query);
  });

  const total = allFilteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const safePage = Math.min(page, totalPages);

  if (page > totalPages && total > 0) {
    redirect(
      buildAccountsHref({
        role: roleFilter,
        q,
        page: totalPages,
      }),
    );
  }

  const from = (safePage - 1) * PER_PAGE;
  const to = safePage * PER_PAGE;
  const users = allFilteredUsers.slice(from, to);

  const hasActiveFilter = q !== '' || roleFilter !== 'all';

  return (
    <div className={'flex flex-col gap-6'}>
      {/* Header trang */}
      <div className={'flex flex-wrap items-start justify-between gap-3'}>
        <div>
          <h1 className={'text-2xl font-bold tracking-tight'}>
            Quản lý tài khoản
          </h1>

          <p className={'text-muted-foreground mt-1 text-sm'}>
            Tổng cộng {total} tài khoản trong hệ thống. Khóa tài khoản sẽ đăng xuất người dùng khỏi mọi thiết bị ngay lập tức.
          </p>
        </div>
      </div>

      {/* Tabs lọc theo vai trò / trạng thái */}
      <div className={'flex flex-wrap gap-2'}>
        {ROLE_FILTERS.map((filter) => {
          const active = roleFilter === filter.value;

          return (
            <Link
              key={filter.value}
              href={buildAccountsHref({
                role: filter.value,
                q,
                page: 1,
              })}
              aria-current={active ? 'page' : undefined}
              className={
                active
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-3 py-1.5 text-sm font-medium'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md px-3 py-1.5 text-sm font-medium'
              }
            >
              {filter.label}
            </Link>
          );
        })}
      </div>

      {/* Bộ lọc theo từ khóa */}
      <form
        action={'/admin/user'}
        method={'GET'}
        role={'search'}
        className={'flex flex-col gap-2 sm:flex-row sm:items-end'}
      >
        {roleFilter !== 'all' && (
          <input type={'hidden'} name={'role'} value={roleFilter} />
        )}

        <div className={'flex-1'}>
          <label
            htmlFor={'admin-user-search'}
            className={'mb-1 block text-xs font-medium'}
          >
            Tìm kiếm theo email hoặc tên
          </label>

          <Input
            id={'admin-user-search'}
            name={'q'}
            type={'search'}
            defaultValue={q}
            placeholder={'Nhập email hoặc tên người dùng…'}
            className={'max-w-md'}
          />
        </div>

        <div className={'flex gap-2'}>
          <Button type={'submit'} size={'sm'}>
            Lọc
          </Button>

          {hasActiveFilter && (
            <Button
              nativeButton={false}
              size={'sm'}
              variant={'outline'}
              render={
                <Link
                  href={buildAccountsHref({
                    role: 'all',
                    q: '',
                    page: 1,
                  })}
                >
                  Xoá lọc
                </Link>
              }
            />
          )}
        </div>
      </form>

      {/* Danh sách tài khoản */}
      {users.length === 0 ? (
        <Card>
          <CardContent className={'py-10 text-center'}>
            <p className={'text-muted-foreground text-sm'}>
              {hasActiveFilter
                ? 'Không tìm thấy tài khoản nào phù hợp với bộ lọc hiện tại.'
                : 'Chưa có tài khoản nào trong hệ thống.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className={'flex flex-col gap-4'}>
          {total > 0 && (
            <div className={'flex items-center justify-between text-xs text-muted-foreground'}>
              <span>
                Hiển thị {from + 1}–{Math.min(to, total)} trên tổng số {total} tài khoản
              </span>
            </div>
          )}

          <div className={'grid grid-cols-1 gap-3 lg:grid-cols-2'}>
            {users.map((user) => {
              const banned = isBanned(user);
              const admin = isAdmin(user);
              // Không cho thao tác nguy hiểm lên chính tài khoản đang đăng nhập.
              const isSelf = user.id === currentAdminId;
              const displayName = getDisplayName(user);
              const initialLetter = (displayName || user.email || 'U').charAt(0).toUpperCase();

              return (
                <Card key={user.id} className={'hover:shadow-xs transition-shadow'}>
                  <CardHeader className={'pb-3'}>
                    <div className={'flex gap-3'}>
                      <div
                        className={
                          'bg-primary/10 text-primary flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-base font-bold border'
                        }
                      >
                        {initialLetter}
                      </div>

                      <div className={'min-w-0 flex-1'}>
                        <div className={'flex items-center gap-2'}>
                          <CardTitle className={'truncate text-base'} title={displayName}>
                            {displayName}
                          </CardTitle>

                          {admin ? (
                            <Badge variant={'default'} className={'gap-1 shrink-0'}>
                              <ShieldCheck className={'h-3 w-3'} />
                              <span>Admin</span>
                            </Badge>
                          ) : (
                            <Badge variant={'secondary'} className={'shrink-0'}>
                              Người dùng
                            </Badge>
                          )}

                          {banned && (
                            <Badge variant={'destructive'} className={'shrink-0'}>
                              Đã khóa
                            </Badge>
                          )}
                        </div>

                        <CardDescription className={'truncate font-mono text-xs mt-0.5'} title={user.email ?? ''}>
                          {user.email ?? '(không có email)'}
                        </CardDescription>

                        <div className={'mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground'}>
                          <span>Tạo lúc: {formatDateTime(user.created_at)}</span>
                          <span>Đăng nhập gần nhất: {formatDateTime(user.last_sign_in_at)}</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className={'flex flex-wrap items-center gap-2 pt-0'}>
                    {admin ? (
                      <RevokeAdminButton
                        userId={user.id}
                        disabled={isSelf}
                        disabledTitle={'Không thể thu hồi quyền của chính mình'}
                      />
                    ) : (
                      <GrantAdminButton userId={user.id} />
                    )}

                    {!admin &&
                      (banned ? (
                        <UnlockAccountButton userId={user.id} />
                      ) : (
                        <LockAccountButton
                          userId={user.id}
                          disabled={isSelf}
                          disabledTitle={'Không thể khóa chính mình'}
                        />
                      ))}

                    <DeleteAccountButton
                      userId={user.id}
                      disabled={isSelf}
                      disabledTitle={'Không thể xóa chính mình'}
                    />
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Phân trang */}
          <div className={'pt-2'}>
            <PaginationNav
              currentPage={safePage}
              totalPages={totalPages}
              buildHref={(p: number) =>
                buildAccountsHref({
                  role: roleFilter,
                  q,
                  page: p,
                })
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}
