import type { Metadata } from 'next';
import { connection } from 'next/server';
import Link from 'next/link';
import type { User } from '@supabase/supabase-js';

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
import { Label } from '@kit/ui/label';

import type { RecipeSchema } from '~/lib/recipes/database';

import {
  LockAccountButton,
  UnlockAccountButton,
} from './_components/account-actions';

export const metadata: Metadata = {
  title: 'Quản lý tài khoản',
};

const PAGE_SIZE = 100;

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
  searchParams: Promise<{ q?: string }>;
};

export default async function AccountsPage({ searchParams }: AccountsPageProps) {
  // Trang admin đọc DB mỗi request, không prerender lúc build.
  await connection();

  const params = await searchParams;
  const query = (params.q ?? '').trim().toLowerCase();

  const adminClient = getSupabaseServerAdminClient<RecipeSchema>();

  const { data, error } = await adminClient.auth.admin.listUsers({
    page: 1,
    perPage: PAGE_SIZE,
  });

  if (error) {
    throw new Error(`Không tải được danh sách tài khoản: ${error.message}`);
  }

  const users = (data?.users ?? []).filter((user) => {
    if (!query) {
      return true;
    }

    const email = (user.email ?? '').toLowerCase();
    const name = getDisplayName(user).toLowerCase();

    return email.includes(query) || name.includes(query);
  });

  return (
    <div className={'flex flex-col gap-6'}>
      <div>
        <h1 className={'text-2xl font-bold tracking-tight'}>
          Quản lý tài khoản
        </h1>

        <p className={'text-muted-foreground mt-1 text-sm'}>
          Tìm kiếm theo email hoặc tên. Khóa tài khoản sẽ đăng xuất người dùng
          khỏi mọi thiết bị ngay lập tức.
        </p>
      </div>

      <form
        method={'get'}
        className={'flex flex-col gap-2 sm:flex-row sm:items-end'}
      >
        <div className={'grid flex-1 gap-1.5'}>
          <Label htmlFor={'q'}>Tìm kiếm</Label>

          <Input
            id={'q'}
            name={'q'}
            type={'search'}
            placeholder={'Nhập email hoặc tên...'}
            defaultValue={params.q ?? ''}
          />
        </div>

        <div className={'flex gap-2'}>
          <Button type={'submit'}>Tìm</Button>

          {query && (
            <Button
              nativeButton={false}
              variant={'outline'}
              render={<Link href={'/admin/tai-khoan'}>Xóa lọc</Link>}
            />
          )}
        </div>
      </form>

      {users.length === 0 ? (
        <Card>
          <CardContent className={'py-10 text-center'}>
            <p className={'text-muted-foreground text-sm'}>
              {query
                ? `Không tìm thấy tài khoản nào khớp với “${params.q}”.`
                : 'Chưa có tài khoản nào.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className={'grid grid-cols-1 gap-3 lg:grid-cols-2'}>
          {users.map((user) => {
            const banned = isBanned(user);
            const admin = isAdmin(user);

            return (
              <Card key={user.id}>
                <CardHeader className={'pb-3'}>
                  <div className={'flex items-start justify-between gap-2'}>
                    <div className={'min-w-0'}>
                      <CardTitle
                        className={'truncate text-base'}
                        title={user.email ?? ''}
                      >
                        {user.email ?? '(không có email)'}
                      </CardTitle>

                      <CardDescription className={'truncate'}>
                        {getDisplayName(user)}
                      </CardDescription>
                    </div>

                    <div className={'flex shrink-0 gap-1'}>
                      {admin && <Badge variant={'default'}>Admin</Badge>}

                      {banned ? (
                        <Badge variant={'destructive'}>Đã khóa</Badge>
                      ) : (
                        <Badge variant={'secondary'}>Hoạt động</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent
                  className={
                    'flex flex-wrap items-center justify-between gap-3 pt-0'
                  }
                >
                  <dl className={'text-muted-foreground text-xs'}>
                    <div className={'flex gap-1'}>
                      <dt>Tạo lúc:</dt>
                      <dd>{formatDateTime(user.created_at)}</dd>
                    </div>

                    <div className={'flex gap-1'}>
                      <dt>Đăng nhập gần nhất:</dt>
                      <dd>{formatDateTime(user.last_sign_in_at)}</dd>
                    </div>
                  </dl>

                  {!admin &&
                    (banned ? (
                      <UnlockAccountButton userId={user.id} />
                    ) : (
                      <LockAccountButton userId={user.id} />
                    ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <p className={'text-muted-foreground text-xs'}>
        Hiển thị tối đa {PAGE_SIZE} tài khoản đầu tiên.
      </p>
    </div>
  );
}
