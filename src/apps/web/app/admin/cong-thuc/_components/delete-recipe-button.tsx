'use client';

import { useActionState } from 'react';

import { Button } from '@kit/ui/button';

import { deleteRecipeAction } from '../actions';
import { RECIPE_ACTION_INITIAL } from '../cong-thuc-constants';

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
        onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
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
