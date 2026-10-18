'use client';

import { useActionState, useState } from 'react';

import { Button } from '@kit/ui/button';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';
import { Textarea } from '@kit/ui/textarea';

import type { CategoryRow } from '~/lib/recipes/database';

import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from '../actions';
import { CATEGORY_ACTION_INITIAL } from '../category-constants';

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

export function CreateCategoryForm() {
  const [state, formAction, pending] = useActionState(
    createCategoryAction,
    CATEGORY_ACTION_INITIAL,
  );

  return (
    <form
      action={formAction}
      className={'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4'}
    >
      <div className={'grid gap-1.5'}>
        <Label htmlFor={'new-name'}>Tên danh mục *</Label>

        <Input
          id={'new-name'}
          name={'name'}
          required
          maxLength={80}
          placeholder={'VD: Món chay'}
        />
      </div>

      <div className={'grid gap-1.5'}>
        <Label htmlFor={'new-slug'}>Slug (tự tạo nếu bỏ trống)</Label>

        <Input
          id={'new-slug'}
          name={'slug'}
          maxLength={80}
          placeholder={'VD: mon-chay'}
        />
      </div>

      <div className={'grid gap-1.5 sm:col-span-2 lg:col-span-1'}>
        <Label htmlFor={'new-description'}>Mô tả</Label>

        <Input
          id={'new-description'}
          name={'description'}
          maxLength={200}
          placeholder={'Mô tả ngắn'}
        />
      </div>

      <div className={'grid gap-1.5'}>
        <Label htmlFor={'new-dimension'}>Chiều phân loại</Label>

        <select
          id={'new-dimension'}
          name={'dimension'}
          defaultValue={'nhom-mon'}
          className={'border-input bg-background rounded-md border px-3 py-2 text-sm'}
        >
          <option value={'nhom-mon'}>Nhóm món</option>
          <option value={'nguyen-lieu-chinh'}>Nguyên liệu chính</option>
          <option value={'phuong-phap-che-bien'}>Phương pháp chế biến</option>
          <option value={'bua-an'}>Bữa ăn</option>
          <option value={'phong-cach-am-thuc'}>Phong cách ẩm thực</option>
        </select>
      </div>

      <div className={'flex items-end'}>
        <Button type={'submit'} disabled={pending} className={'w-full'}>
          {pending ? 'Đang thêm...' : 'Thêm danh mục'}
        </Button>
      </div>

      <FormError message={!state.ok ? state.message : undefined} />
    </form>
  );
}

export function CategoryRowActions({ category }: { category: CategoryRow }) {
  const [editing, setEditing] = useState(false);
  const [updateState, updateAction, updatePending] = useActionState(
    updateCategoryAction,
    CATEGORY_ACTION_INITIAL,
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteCategoryAction,
    CATEGORY_ACTION_INITIAL,
  );

  return (
    <div className={'flex flex-col gap-2'}>
      <div className={'flex gap-2'}>
        <Button
          type={'button'}
          size={'sm'}
          variant={'outline'}
          onClick={() => setEditing((v) => !v)}
        >
          {editing ? 'Đóng' : 'Sửa'}
        </Button>

        <form action={deleteAction}>
          <input type={'hidden'} name={'id'} value={category.id} />

          <Button
            type={'submit'}
            size={'sm'}
            variant={'ghost'}
            className={'text-destructive hover:text-destructive'}
            disabled={deletePending}
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
              if (
                !window.confirm(
                  `Xóa danh mục “${category.name}”? Chỉ xóa được khi không còn công thức nào thuộc danh mục này.`,
                )
              ) {
                event.preventDefault();
              }
            }}
          >
            {deletePending ? 'Đang xóa...' : 'Xóa'}
          </Button>
        </form>
      </div>

      <FormError message={!deleteState.ok ? deleteState.message : undefined} />

      {editing && (
        <form
          action={updateAction}
          className={'grid grid-cols-1 gap-3 rounded-md border p-3 sm:grid-cols-3'}
        >
          <input type={'hidden'} name={'id'} value={category.id} />

          <div className={'grid gap-1.5'}>
            <Label htmlFor={`name-${category.id}`}>Tên *</Label>

            <Input
              id={`name-${category.id}`}
              name={'name'}
              required
              maxLength={80}
              defaultValue={category.name}
            />
          </div>

          <div className={'grid gap-1.5'}>
            <Label htmlFor={`slug-${category.id}`}>Slug *</Label>

            <Input
              id={`slug-${category.id}`}
              name={'slug'}
              required
              maxLength={80}
              defaultValue={category.slug}
            />
          </div>

          <div className={'grid gap-1.5'}>
            <Label htmlFor={`desc-${category.id}`}>Mô tả</Label>

            <Textarea
              id={`desc-${category.id}`}
              name={'description'}
              rows={1}
              maxLength={200}
              defaultValue={category.description ?? ''}
            />
          </div>

          <div className={'grid gap-1.5'}>
            <Label htmlFor={`dim-${category.id}`}>Chiều phân loại</Label>

            <select
              id={`dim-${category.id}`}
              name={'dimension'}
              defaultValue={category.dimension ?? 'nhom-mon'}
              className={'border-input bg-background rounded-md border px-3 py-2 text-sm'}
            >
              <option value={'nhom-mon'}>Nhóm món</option>
              <option value={'nguyen-lieu-chinh'}>Nguyên liệu chính</option>
              <option value={'phuong-phap-che-bien'}>Phương pháp chế biến</option>
              <option value={'bua-an'}>Bữa ăn</option>
              <option value={'phong-cach-am-thuc'}>Phong cách ẩm thực</option>
            </select>
          </div>

          <div className={'sm:col-span-3'}>
            <Button type={'submit'} size={'sm'} disabled={updatePending}>
              {updatePending ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>

            <FormError
              message={!updateState.ok ? updateState.message : undefined}
            />
          </div>
        </form>
      )}
    </div>
  );
}
