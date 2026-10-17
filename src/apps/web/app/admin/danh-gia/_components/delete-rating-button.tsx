'use client';

import { useActionState } from 'react';

import { Button } from '@kit/ui/button';

import { RATING_ACTION_INITIAL, deleteRatingAction } from '../actions';

function FormError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p role={'alert'} className={'text-destructive text-xs'}>
      {message}
    </p>
  );
}

export function DeleteRatingButton({
  id,
  recipeTitle,
}: {
  id: number;
  recipeTitle: string;
}) {
  const [state, formAction, pending] = useActionState(
    deleteRatingAction,
    RATING_ACTION_INITIAL,
  );

  return (
    <div className={'flex flex-col gap-1'}>
      <form action={formAction}>
        <input type={'hidden'} name={'id'} value={id} />

        <Button
          type={'submit'}
          size={'sm'}
          variant={'ghost'}
          className={'text-destructive hover:text-destructive'}
          disabled={pending}
          onClick={(event) => {
            if (
              !window.confirm(
                `Xóa đánh giá của món “${recipeTitle}”? Thao tác không thể hoàn tác.`,
              )
            ) {
              event.preventDefault();
            }
          }}
        >
          {pending ? 'Đang xóa...' : 'Xóa'}
        </Button>
      </form>

      <FormError message={!state.ok ? state.message : undefined} />
    </div>
  );
}
