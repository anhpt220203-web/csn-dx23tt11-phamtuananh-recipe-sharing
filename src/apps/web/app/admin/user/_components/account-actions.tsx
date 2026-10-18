'use client';

import { useActionState } from 'react';

import { Button } from '@kit/ui/button';

import {
  deleteAccountAction,
  grantAdminAction,
  lockAccountAction,
  revokeAdminAction,
  unlockAccountAction,
} from '../actions';
import { ACCOUNT_ACTION_INITIAL } from '../user-constants';

function ActionMessage({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p role={'alert'} className={'text-destructive mt-1 text-xs'}>
      {message}
    </p>
  );
}

type ProtectedActionButtonProps = {
  userId: string;
  /** Vô hiệu hóa nút (ví dụ: không cho thao tác lên chính mình). */
  disabled?: boolean;
  /** Tooltip hiển thị khi nút bị vô hiệu hóa. */
  disabledTitle?: string;
};

export function LockAccountButton({
  userId,
  disabled,
  disabledTitle,
}: ProtectedActionButtonProps) {
  const [state, formAction, pending] = useActionState(
    lockAccountAction,
    ACCOUNT_ACTION_INITIAL,
  );

  return (
    <form action={formAction}>
      <input type={'hidden'} name={'userId'} value={userId} />

      <Button
        type={'submit'}
        size={'sm'}
        variant={'destructive'}
        disabled={pending || disabled}
        title={disabled ? disabledTitle : undefined}
        onClick={(event) => {
          if (
            !window.confirm(
              'Khóa tài khoản này? Người dùng sẽ bị đăng xuất khỏi mọi thiết bị và không thể đăng nhập lại.',
            )
          ) {
            event.preventDefault();
          }
        }}
      >
        {pending ? 'Đang khóa...' : 'Khóa'}
      </Button>

      <ActionMessage
        message={!state.ok ? state.message : undefined}
      />
    </form>
  );
}

export function UnlockAccountButton({ userId }: { userId: string }) {
  const [state, formAction, pending] = useActionState(
    unlockAccountAction,
    ACCOUNT_ACTION_INITIAL,
  );

  return (
    <form action={formAction}>
      <input type={'hidden'} name={'userId'} value={userId} />

      <Button
        type={'submit'}
        size={'sm'}
        variant={'outline'}
        disabled={pending}
      >
        {pending ? 'Đang mở...' : 'Mở khóa'}
      </Button>

      <ActionMessage
        message={!state.ok ? state.message : undefined}
      />
    </form>
  );
}

export function GrantAdminButton({ userId }: { userId: string }) {
  const [state, formAction, pending] = useActionState(
    grantAdminAction,
    ACCOUNT_ACTION_INITIAL,
  );

  return (
    <form action={formAction}>
      <input type={'hidden'} name={'userId'} value={userId} />

      <Button
        type={'submit'}
        size={'sm'}
        variant={'outline'}
        disabled={pending}
        onClick={(event) => {
          if (
            !window.confirm(
              'Cấp quyền quản trị viên cho tài khoản này? Họ sẽ có toàn quyền quản trị website.',
            )
          ) {
            event.preventDefault();
          }
        }}
      >
        {pending ? 'Đang cấp...' : 'Cấp admin'}
      </Button>

      <ActionMessage
        message={!state.ok ? state.message : undefined}
      />
    </form>
  );
}

export function RevokeAdminButton({
  userId,
  disabled,
  disabledTitle,
}: ProtectedActionButtonProps) {
  const [state, formAction, pending] = useActionState(
    revokeAdminAction,
    ACCOUNT_ACTION_INITIAL,
  );

  return (
    <form action={formAction}>
      <input type={'hidden'} name={'userId'} value={userId} />

      <Button
        type={'submit'}
        size={'sm'}
        variant={'outline'}
        disabled={pending || disabled}
        title={disabled ? disabledTitle : undefined}
        onClick={(event) => {
          if (
            !window.confirm(
              'Thu hồi quyền quản trị viên của tài khoản này? Họ sẽ trở thành người dùng thường.',
            )
          ) {
            event.preventDefault();
          }
        }}
      >
        {pending ? 'Đang thu hồi...' : 'Thu hồi admin'}
      </Button>

      <ActionMessage
        message={!state.ok ? state.message : undefined}
      />
    </form>
  );
}

export function DeleteAccountButton({
  userId,
  disabled,
  disabledTitle,
}: ProtectedActionButtonProps) {
  const [state, formAction, pending] = useActionState(
    deleteAccountAction,
    ACCOUNT_ACTION_INITIAL,
  );

  return (
    <form action={formAction}>
      <input type={'hidden'} name={'userId'} value={userId} />

      <Button
        type={'submit'}
        size={'sm'}
        variant={'destructive'}
        disabled={pending || disabled}
        title={disabled ? disabledTitle : undefined}
        onClick={(event) => {
          if (
            !window.confirm(
              'Xóa vĩnh viễn tài khoản này? Hành động này không thể hoàn tác.',
            )
          ) {
            event.preventDefault();
          }
        }}
      >
        {pending ? 'Đang xóa...' : 'Xóa'}
      </Button>

      <ActionMessage
        message={!state.ok ? state.message : undefined}
      />
    </form>
  );
}
