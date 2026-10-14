'use client';

import { useActionState } from 'react';

import { Button } from '@kit/ui/button';

import {
  ACCOUNT_ACTION_INITIAL,
  lockAccountAction,
  unlockAccountAction,
} from '../actions';

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

export function LockAccountButton({ userId }: { userId: string }) {
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
        disabled={pending}
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
