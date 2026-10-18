'use client';

import { useActionState, useState } from 'react';

import { Button } from '@kit/ui/button';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';

import type { BannerRow } from '~/lib/content/database';

import {
  createBannerAction,
  deleteBannerAction,
  updateBannerAction,
} from '../actions';
import { BANNER_ACTION_INITIAL } from '../banner-constants';

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

export function CreateBannerForm() {
  const [state, formAction, pending] = useActionState(
    createBannerAction,
    BANNER_ACTION_INITIAL,
  );

  return (
    <form action={formAction} className={'grid grid-cols-1 gap-3 sm:grid-cols-2'}>
      <div className={'grid gap-1.5'}>
        <Label htmlFor={'new-title'}>Tiêu đề *</Label>
        <Input id={'new-title'} name={'title'} required maxLength={200} />
      </div>

      <div className={'grid gap-1.5'}>
        <Label htmlFor={'new-subtitle'}>Phụ đề</Label>
        <Input id={'new-subtitle'} name={'subtitle'} maxLength={300} />
      </div>

      <div className={'grid gap-1.5'}>
        <Label htmlFor={'new-image'}>URL ảnh</Label>
        <Input
          id={'new-image'}
          name={'image_url'}
          type={'url'}
          maxLength={500}
          placeholder={'https://...'}
        />
      </div>

      <div className={'grid gap-1.5'}>
        <Label htmlFor={'new-link'}>Liên kết (khi nhấn vào banner)</Label>
        <Input
          id={'new-link'}
          name={'link_url'}
          maxLength={500}
          placeholder={'/tim-kiem?q=phở'}
        />
      </div>

      <div className={'grid gap-1.5'}>
        <Label htmlFor={'new-order'}>Thứ tự hiển thị</Label>
        <Input
          id={'new-order'}
          name={'sort_order'}
          type={'number'}
          defaultValue={0}
        />
      </div>

      <div className={'flex items-end gap-2'}>
        <input
          id={'new-active'}
          name={'is_active'}
          type={'checkbox'}
          defaultChecked
          className={'h-4 w-4'}
        />
        <Label htmlFor={'new-active'}>Đang hoạt động</Label>
      </div>

      <div className={'sm:col-span-2'}>
        <FormError message={state.ok ? undefined : state.message} />
      </div>

      <div className={'sm:col-span-2'}>
        <Button type={'submit'} disabled={pending}>
          {pending ? 'Đang thêm...' : 'Thêm banner'}
        </Button>
      </div>
    </form>
  );
}

export function BannerRowActions({ banner }: { banner: BannerRow }) {
  const [editing, setEditing] = useState(false);
  const [updateState, updateAction, updatePending] = useActionState(
    updateBannerAction,
    BANNER_ACTION_INITIAL,
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteBannerAction,
    BANNER_ACTION_INITIAL,
  );

  return (
    <div className={'flex shrink-0 items-center gap-2'}>
      <Button
        type={'button'}
        variant={'outline'}
        size={'sm'}
        onClick={() => setEditing((v) => !v)}
      >
        Sửa
      </Button>

      <form action={deleteAction}>
        <input type={'hidden'} name={'id'} value={banner.id} />
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
          action={updateAction}
          className={
            'absolute z-10 mt-2 grid w-72 gap-3 rounded-lg border bg-background p-4 shadow-lg'
          }
        >
          <input type={'hidden'} name={'id'} value={banner.id} />

          <div className={'grid gap-1.5'}>
            <Label htmlFor={`title-${banner.id}`}>Tiêu đề *</Label>
            <Input
              id={`title-${banner.id}`}
              name={'title'}
              required
              defaultValue={banner.title}
            />
          </div>

          <div className={'grid gap-1.5'}>
            <Label htmlFor={`order-${banner.id}`}>Thứ tự</Label>
            <Input
              id={`order-${banner.id}`}
              name={'sort_order'}
              type={'number'}
              defaultValue={banner.sort_order}
            />
          </div>

          <div className={'flex items-center gap-2'}>
            <input
              id={`active-${banner.id}`}
              name={'is_active'}
              type={'checkbox'}
              defaultChecked={banner.is_active}
              className={'h-4 w-4'}
            />
            <Label htmlFor={`active-${banner.id}`}>Đang hoạt động</Label>
          </div>

          <FormError message={updateState.ok ? undefined : updateState.message} />
          <FormError message={deleteState.ok ? undefined : deleteState.message} />

          <div className={'flex gap-2'}>
            <Button type={'submit'} size={'sm'} disabled={updatePending}>
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
