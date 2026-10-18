'use client';

import { useActionState } from 'react';

import { Button } from '@kit/ui/button';
import { Card, CardContent } from '@kit/ui/card';
import { Label } from '@kit/ui/label';
import { Textarea } from '@kit/ui/textarea';

import { useAuthModal } from '~/components/recipes/auth-modal';
import type { RecipeQuestionRow } from '~/lib/recipes/database';
import { askQuestionAction, type QuestionActionResult } from './actions';

const QUESTION_ACTION_INITIAL: QuestionActionResult = { ok: true };

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

export function QuestionForm({
  recipeId,
  isAuthenticated,
}: {
  recipeId: number;
  isAuthenticated: boolean;
}) {
  const { openSignInModal } = useAuthModal();
  const [state, formAction, pending] = useActionState(
    askQuestionAction,
    QUESTION_ACTION_INITIAL,
  );

  if (!isAuthenticated) {
    return (
      <div className={'rounded-lg border border-dashed p-4 text-center'}>
        <p className={'text-muted-foreground text-sm'}>
          Vui lòng đăng nhập để đặt câu hỏi về công thức này.
        </p>
        <Button
          type={'button'}
          size={'sm'}
          variant={'outline'}
          className={'mt-2.5'}
          onClick={() =>
            openSignInModal({
              title: 'Đặt câu hỏi',
              description:
                'Đăng nhập để gửi câu hỏi về công thức này cho cộng đồng.',
            })
          }
        >
          Đăng nhập ngay
        </Button>
      </div>
    );
  }

  return (
    <form action={formAction} className={'grid gap-3'}>
      <input type={'hidden'} name={'recipe_id'} value={recipeId} />

      <div className={'grid gap-1.5'}>
        <Label htmlFor={'question'}>Đặt câu hỏi</Label>
        <Textarea
          id={'question'}
          name={'question'}
          rows={3}
          required
          maxLength={1000}
          placeholder={'VD: Món này có thể thay đường bằng mật ong không?'}
        />
      </div>

      <FormError message={state.ok ? undefined : state.message} />

      {state.ok && state.asked ? (
        <p className={'text-sm text-green-600'}>
          Câu hỏi của bạn đã được gửi. Quản trị viên sẽ trả lời sớm.
        </p>
      ) : null}

      <div>
        <Button type={'submit'} disabled={pending}>
          {pending ? 'Đang gửi...' : 'Gửi câu hỏi'}
        </Button>
      </div>
    </form>
  );
}

export function QuestionList({ questions }: { questions: RecipeQuestionRow[] }) {
  if (questions.length === 0) {
    return (
      <p className={'text-muted-foreground text-sm'}>
        Chưa có câu hỏi nào. Hãy là người đầu tiên đặt câu hỏi!
      </p>
    );
  }

  return (
    <ul className={'flex flex-col gap-4'}>
      {questions.map((item) => (
        <li key={item.id}>
          <Card>
            <CardContent className={'pt-6'}>
              <p className={'font-medium'}>{item.question}</p>

              <p className={'text-muted-foreground mt-1 text-xs'}>
                {new Date(item.created_at).toLocaleDateString('vi-VN')}
              </p>

              {item.answer ? (
                <div
                  className={'mt-3 rounded-lg bg-muted p-3 text-sm'}
                >
                  <p className={'font-medium text-primary'}>Trả lời:</p>
                  <p className={'mt-1'}>{item.answer}</p>
                </div>
              ) : (
                <p className={'text-muted-foreground mt-3 text-sm italic'}>
                  Đang chờ quản trị viên trả lời...
                </p>
              )}
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}
