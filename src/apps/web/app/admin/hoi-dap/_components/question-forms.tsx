'use client';

import { useActionState, useState } from 'react';

import { Button } from '@kit/ui/button';
import { Label } from '@kit/ui/label';
import { Textarea } from '@kit/ui/textarea';

import {
  ANSWER_ACTION_INITIAL,
  answerQuestionAction,
  deleteQuestionAction,
} from '../actions';

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

export function QuestionRowActions({
  id,
  currentAnswer,
}: {
  id: number;
  currentAnswer: string | null;
}) {
  const [editing, setEditing] = useState(false);
  const [answerState, answerAction, answerPending] = useActionState(
    answerQuestionAction,
    ANSWER_ACTION_INITIAL,
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteQuestionAction,
    ANSWER_ACTION_INITIAL,
  );

  return (
    <div className={'flex shrink-0 items-center gap-2'}>
      <Button
        type={'button'}
        variant={'outline'}
        size={'sm'}
        onClick={() => setEditing((v) => !v)}
      >
        {currentAnswer ? 'Sửa trả lời' : 'Trả lời'}
      </Button>

      <form action={deleteAction}>
        <input type={'hidden'} name={'id'} value={id} />
        <Button
          type={'submit'}
          variant={'destructive'}
          size={'sm'}
          disabled={deletePending}
        >
          Xóa
        </Button>
      </form>

      {editing ? (
        <form
          action={answerAction}
          className={
            'absolute z-10 mt-2 grid w-80 gap-3 rounded-lg border bg-background p-4 shadow-lg'
          }
        >
          <input type={'hidden'} name={'id'} value={id} />

          <div className={'grid gap-1.5'}>
            <Label htmlFor={`answer-${id}`}>Câu trả lời</Label>
            <Textarea
              id={`answer-${id}`}
              name={'answer'}
              rows={4}
              required
              defaultValue={currentAnswer ?? ''}
            />
          </div>

          <FormError
            message={answerState.ok ? undefined : answerState.message}
          />
          <FormError
            message={deleteState.ok ? undefined : deleteState.message}
          />

          <div className={'flex gap-2'}>
            <Button type={'submit'} size={'sm'} disabled={answerPending}>
              Lưu
            </Button>
            <Button
              type={'button'}
              variant={'ghost'}
              size={'sm'}
              onClick={() => setEditing(false)}
            >
              Đóng
            </Button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
