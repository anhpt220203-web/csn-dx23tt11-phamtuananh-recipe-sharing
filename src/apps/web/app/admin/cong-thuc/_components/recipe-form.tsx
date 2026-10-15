'use client';

import { useActionState, useRef, useState } from 'react';

import { Button } from '@kit/ui/button';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';
import { NativeSelect, NativeSelectOption } from '@kit/ui/native-select';
import { Textarea } from '@kit/ui/textarea';

import type {
  CategoryRow,
  RecipeDetail,
} from '~/lib/recipes/database';
import { slugify } from '~/lib/recipes/slugify';

import { RECIPE_ACTION_INITIAL, saveRecipeAction } from '../actions';

const DIFFICULTIES = ['Dễ', 'Trung bình', 'Khó'];

const STATUSES = [
  { value: 'draft', label: 'Nháp' },
  { value: 'published', label: 'Xuất bản' },
];

type RecipeFormProps = {
  categories: CategoryRow[];
  initial?: RecipeDetail | null;
};

export function RecipeForm({ categories, initial }: RecipeFormProps) {
  const [state, formAction, pending] = useActionState(
    saveRecipeAction,
    RECIPE_ACTION_INITIAL,
  );

  const [title, setTitle] = useState(initial?.title ?? '');
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [preview, setPreview] = useState<string | null>(
    initial?.image_url ?? null,
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTitleChange = (value: string) => {
    setTitle(value);

    if (!slugTouched) {
      setSlug(slugify(value));
    }
  };

  const handleFileChange = (file: File | undefined) => {
    if (!file) {
      setPreview(initial?.image_url ?? null);
      return;
    }

    setPreview(URL.createObjectURL(file));
  };

  return (
    <form action={formAction} className={'flex flex-col gap-5'}>
      {initial && <input type={'hidden'} name={'id'} value={initial.id} />}

      <input
        type={'hidden'}
        name={'existing_image_url'}
        value={initial?.image_url ?? ''}
      />

      <div className={'grid grid-cols-1 gap-4 sm:grid-cols-2'}>
        <div className={'grid gap-1.5'}>
          <Label htmlFor={'title'}>Tên món ăn *</Label>

          <Input
            id={'title'}
            name={'title'}
            required
            maxLength={160}
            value={title}
            onChange={(event) => handleTitleChange(event.target.value)}
            placeholder={'VD: Cơm chiên dương châu'}
          />
        </div>

        <div className={'grid gap-1.5'}>
          <Label htmlFor={'slug'}>Slug *</Label>

          <Input
            id={'slug'}
            name={'slug'}
            required
            maxLength={160}
            value={slug}
            onChange={(event) => {
              setSlugTouched(true);
              setSlug(slugify(event.target.value));
            }}
            placeholder={'vd: com-chien-duong-chau'}
          />

          <p className={'text-muted-foreground text-xs'}>
            Tự tạo từ tên món, bạn có thể sửa lại.
          </p>
        </div>

        <div className={'grid gap-1.5'}>
          <Label htmlFor={'category_id'}>Danh mục *</Label>

          <NativeSelect
            id={'category_id'}
            name={'category_id'}
            required
            defaultValue={initial?.category_id ?? ''}
            className={'w-full'}
          >
            <NativeSelectOption value={''} disabled>
              — Chọn danh mục —
            </NativeSelectOption>

            {categories.map((category) => (
              <NativeSelectOption key={category.id} value={category.id}>
                {category.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>

        <div className={'grid gap-1.5'}>
          <Label htmlFor={'status'}>Trạng thái</Label>

          <NativeSelect
            id={'status'}
            name={'status'}
            defaultValue={initial?.status === 'published' ? 'published' : 'draft'}
            className={'w-full'}
          >
            {STATUSES.map((status) => (
              <NativeSelectOption key={status.value} value={status.value}>
                {status.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>

          <p className={'text-muted-foreground text-xs'}>
            Bài ở trạng thái Nháp sẽ không hiển thị trên trang công khai.
          </p>
        </div>

        <div className={'grid gap-1.5'}>
          <Label htmlFor={'difficulty'}>Độ khó</Label>

          <NativeSelect
            id={'difficulty'}
            name={'difficulty'}
            defaultValue={initial?.difficulty ?? 'Trung bình'}
            className={'w-full'}
          >
            {DIFFICULTIES.map((level) => (
              <NativeSelectOption key={level} value={level}>
                {level}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>

        <div className={'grid grid-cols-2 gap-4 sm:col-span-2'}>
          <div className={'grid gap-1.5'}>
            <Label htmlFor={'servings'}>Khẩu phần (người)</Label>

            <Input
              id={'servings'}
              name={'servings'}
              type={'number'}
              min={1}
              inputMode={'numeric'}
              defaultValue={initial?.servings ?? ''}
              placeholder={'VD: 3'}
            />
          </div>

          <div className={'grid gap-1.5'}>
            <Label htmlFor={'cook_time'}>Thời gian nấu (phút)</Label>

            <Input
              id={'cook_time'}
              name={'cook_time'}
              type={'number'}
              min={0}
              inputMode={'numeric'}
              defaultValue={initial?.cook_time ?? ''}
              placeholder={'VD: 20'}
            />
          </div>
        </div>

        <div className={'grid gap-1.5 sm:col-span-2'}>
          <Label htmlFor={'description'}>Mô tả ngắn</Label>

          <Textarea
            id={'description'}
            name={'description'}
            rows={3}
            maxLength={500}
            defaultValue={initial?.description ?? ''}
            placeholder={'Mô tả hấp dẫn về món ăn...'}
          />
        </div>

        <div className={'grid gap-1.5 sm:col-span-2'}>
          <Label htmlFor={'image'}>Ảnh đại diện</Label>

          <Input
            id={'image'}
            name={'image'}
            ref={fileInputRef}
            type={'file'}
            accept={'image/jpeg,image/png,image/webp,image/gif'}
            onChange={(event) =>
              handleFileChange(event.target.files?.[0])
            }
          />

          <p className={'text-muted-foreground text-xs'}>
            JPG/PNG/WEBP/GIF, tối đa 5MB. Tên file được sinh ngẫu nhiên để
            không trùng.
          </p>

          {preview && (
            <div className={'mt-1'}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt={'Xem trước ảnh đại diện'}
                className={'h-40 w-auto rounded-md border object-cover'}
              />
            </div>
          )}
        </div>

        <div className={'grid gap-1.5 sm:col-span-2'}>
          <Label htmlFor={'ingredients'}>Nguyên liệu</Label>

          <Textarea
            id={'ingredients'}
            name={'ingredients'}
            rows={5}
            defaultValue={(initial?.ingredients ?? []).join('\n')}
            placeholder={'Mỗi dòng một nguyên liệu, ví dụ:\n200g gạo\n2 quả trứng\n1 củ cà rốt'}
          />

          <p className={'text-muted-foreground text-xs'}>
            Mỗi dòng một nguyên liệu, theo đúng thứ tự hiển thị.
          </p>
        </div>

        <div className={'grid gap-1.5 sm:col-span-2'}>
          <Label htmlFor={'steps'}>Các bước thực hiện</Label>

          <Textarea
            id={'steps'}
            name={'steps'}
            rows={6}
            defaultValue={(initial?.steps ?? []).join('\n')}
            placeholder={'Mỗi dòng một bước, ví dụ:\nVo gạo, nấu cơm để nguội\nPhi thơm hành, cho cơm vào chiên'}
          />

          <p className={'text-muted-foreground text-xs'}>
            Mỗi dòng một bước, theo đúng thứ tự thực hiện.
          </p>
        </div>

        <div className={'grid grid-cols-1 gap-4 sm:col-span-2 sm:grid-cols-2'}>
          <div className={'grid gap-1.5'}>
            <Label htmlFor={'source_name'}>Nguồn ảnh (ghi công)</Label>

            <Input
              id={'source_name'}
              name={'source_name'}
              maxLength={200}
              defaultValue={initial?.source_name ?? ''}
              placeholder={'VD: Ảnh: Tác giả — CC BY 2.0'}
            />
          </div>

          <div className={'grid gap-1.5'}>
            <Label htmlFor={'source_url'}>Liên kết nguồn</Label>

            <Input
              id={'source_url'}
              name={'source_url'}
              type={'url'}
              maxLength={500}
              defaultValue={initial?.source_url ?? ''}
              placeholder={'https://...'}
            />
          </div>
        </div>
      </div>

      {!state.ok && (
        <p role={'alert'} className={'text-destructive text-sm'}>
          {state.message}
        </p>
      )}

      <div className={'flex flex-col gap-2 sm:flex-row'}>
        <Button type={'submit'} disabled={pending} className={'sm:min-w-40'}>
          {pending ? 'Đang lưu...' : initial ? 'Lưu thay đổi' : 'Thêm công thức'}
        </Button>
      </div>
    </form>
  );
}
