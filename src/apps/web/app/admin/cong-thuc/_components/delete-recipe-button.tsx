'use client';

import { useActionState } from 'react';

import { Button } from '@kit/ui/button';

import {
  RECIPE_ACTION_INITIAL,
  deleteRecipeAction,
} from '../actions';

export function DeleteRecipeButton({
  id,
  title,
}: {
  id: number;
  title: string;
}) {
  const [, formAction, pending] = useActionState(
    deleteRecipeAction,
    RECIPE_ACTION_INITIAL,
  );

  return (
    <form action={formAction}>
      <input type={'hidden'} name={'id'} value={id} />

      <Button
        type={'submit'}
        size={'sm'}
        variant={'ghost'}
        className={'text-destructive hover:text-destructive'}
        disabled={pending}
        onClick={(event) => {
          if (!window.confirm(`Xóa công thức “${title}”? Thao tác không thể hoàn tác.`)) {
            event.preventDefault();
          }
        }}
      >
        {pending ? 'Đang xóa...' : 'Xóa'}
      </Button>
    </form>
  );
}
