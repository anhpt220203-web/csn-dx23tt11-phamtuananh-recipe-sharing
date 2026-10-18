'use client';

import { useActionState } from 'react';

import { Button } from '@kit/ui/button';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';
import { Textarea } from '@kit/ui/textarea';

import type { TipRow } from '~/lib/content/database';

import {
  createTipAction,
  deleteTipAction,
  toggleTipPublishAction,
} from '../actions';
import { TIP_ACTION_INITIAL } from '../meo-vat-constants';

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

export function CreateTipForm() {
  const [state, formAction, pending] = useActionState(
    createTipAction,
    TIP_ACTION_INITIAL,
  );

  return (
    <form action={formAction} className={'grid grid-cols-1 gap-3 sm:grid-cols-2'}>
      <div className={'grid gap-1.5'}>
        <Label htmlFor={'tip-title'}>Tiêu đề *</Label>
        <Input id={'tip-title'} name={'title'} required maxLength={200} />
      </div>

      <div className={'grid gap-1.5'}>
        <Label htmlFor={'tip-slug'}>Slug (tự tạo nếu bỏ trống)</Label>
        <Input id={'tip-slug'} name={'slug'} maxLength={200} />
      </div>

      <div className={'grid gap-1.5 sm:col-span-2'}>
        <Label htmlFor={'tip-excerpt'}>Tóm tắt</Label>
        <Input id={'tip-excerpt'} name={'excerpt'} maxLength={300} />
      </div>

      <div className={'grid gap-1.5 sm:col-span-2'}>
        <Label htmlFor={'tip-image'}>URL ảnh</Label>
        <Input
          id={'tip-image'}
          name={'image_url'}
          type={'url'}
          maxLength={500}
          placeholder={'https://...'}
        />
      </div>

      <div className={'grid gap-1.5 sm:col-span-2'}>
        <Label htmlFor={'tip-content'}>Nội dung *</Label>
        <Textarea id={'tip-content'} name={'content'} rows={8} required />
      </div>

      <div className={'flex items-center gap-2'}>
        <input
          id={'tip-published'}
          name={'is_published'}
          type={'checkbox'}
          className={'h-4 w-4'}
        />
        <Label htmlFor={'tip-published'}>Xuất bản ngay</Label>
      </div>

      <div className={'sm:col-span-2'}>
        <FormError message={state.ok ? undefined : state.message} />
      </div>

      <div className={'sm:col-span-2'}>
        <Button type={'submit'} disabled={pending}>
          {pending ? 'Đang thêm...' : 'Thêm bài viết'}
        </Button>
      </div>
    </form>
  );
}

export function TipRowActions({ tip }: { tip: TipRow }) {
  const [toggleState, toggleAction, togglePending] = useActionState(
    toggleTipPublishAction,
    TIP_ACTION_INITIAL,
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteTipAction,
    TIP_ACTION_INITIAL,
  );

  return (
    <div className={'flex shrink-0 items-center gap-2'}>
      <form action={toggleAction}>
        <input type={'hidden'} name={'id'} value={tip.id} />
        {tip.is_published ? null : (
          <input type={'hidden'} name={'is_published'} value={'on'} />
        )}

        <Button
          type={'submit'}
          variant={'outline'}
          size={'sm'}
          disabled={togglePending}
        >
          {tip.is_published ? 'Gỡ xuống' : 'Xuất bản'}
        </Button>
      </form>

      <form action={deleteAction}>
        <input type={'hidden'} name={'id'} value={tip.id} />
        <Button
          type={'submit'}
          variant={'destructive'}
          size={'sm'}
          disabled={deletePending}
        >
          Xóa
        </Button>
      </form>

      <FormError message={toggleState.ok ? undefined : toggleState.message} />
      <FormError message={deleteState.ok ? undefined : deleteState.message} />
    </div>
  );
}
