'use client';

import { useActionState, useRef, useState } from 'react';

import { Button } from '@kit/ui/button';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';
import { NativeSelect, NativeSelectOption } from '@kit/ui/native-select';
import { Textarea } from '@kit/ui/textarea';

import { MarkdownEditor } from '~/components/markdown/markdown-editor';

import type {
  CategoryRow,
  RecipeDetail,
} from '~/lib/recipes/database';
import { resolveRecipeImageSrc } from '~/lib/recipes/images';
import { slugify } from '~/lib/recipes/slugify';

import { saveRecipeAction } from '../actions';
import { RECIPE_ACTION_INITIAL } from '../cong-thuc-constants';

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
  const [existingImageUrl, setExistingImageUrl] = useState(
    initial?.image_url ?? '',
  );
  const [imageUrlText, setImageUrlText] = useState(
    initial?.image_url?.startsWith('http') ? initial.image_url : '',
  );
  const [preview, setPreview] = useState<string | null>(
    resolveRecipeImageSrc(initial?.image_url) ?? null,
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);

  const handleTitleChange = (value: string) => {
    setTitle(value);

    if (!slugTouched) {
      setSlug(slugify(value));
    }
  };

  const handleFileChange = (file: File | undefined) => {
    if (!file) {
      const fallback =
        imageUrlText.trim() ||
        resolveRecipeImageSrc(existingImageUrl) ||
        null;

      setPreview(fallback);
      return;
    }

    setPreview(URL.createObjectURL(file));
  };

  const handleUrlChange = (value: string) => {
    setImageUrlText(value);

    const trimmed = value.trim();

    if (trimmed.length > 0) {
      setPreview(trimmed);
    } else if (!fileInputRef.current?.files?.length) {
      setPreview(resolveRecipeImageSrc(existingImageUrl) ?? null);
    }
  };

  const handleClearImage = () => {
    setPreview(null);
    setExistingImageUrl('');
    setImageUrlText('');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    if (urlInputRef.current) {
      urlInputRef.current.value = '';
    }
  };

  return (
    <form action={formAction} className={'flex flex-col gap-5'}>
      {initial && <input type={'hidden'} name={'id'} value={initial.id} />}

      <input
        type={'hidden'}
        name={'existing_image_url'}
        value={existingImageUrl}
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

          <div className={'grid gap-1.5'}>
            <Label htmlFor={'prep_time'}>Thời gian chuẩn bị (phút)</Label>

            <Input
              id={'prep_time'}
              name={'prep_time'}
              type={'number'}
              min={0}
              inputMode={'numeric'}
              defaultValue={initial?.prep_time ?? ''}
              placeholder={'VD: 10'}
            />
          </div>
        </div>

        <div className={'grid gap-1.5 sm:col-span-2'}>
          <Label>Giá trị dinh dưỡng (để trống nếu chưa có)</Label>

          <div className={'grid grid-cols-2 gap-4 sm:grid-cols-3'}>
            {[
              { id: 'calories', label: 'Năng lượng (kcal)' },
              { id: 'protein_g', label: 'Chất đạm (g)' },
              { id: 'carbs_g', label: 'Tinh bột (g)' },
              { id: 'sugar_g', label: 'Đường (g)' },
              { id: 'fat_g', label: 'Chất béo (g)' },
              { id: 'fiber_g', label: 'Chất xơ (g)' },
            ].map((field) => (
              <div key={field.id} className={'grid gap-1.5'}>
                <Label htmlFor={field.id}>{field.label}</Label>

                <Input
                  id={field.id}
                  name={field.id}
                  type={'number'}
                  min={0}
                  step={'0.01'}
                  inputMode={'decimal'}
                  defaultValue={
                    initial?.[field.id as keyof typeof initial] ?? ''
                  }
                  placeholder={'0'}
                />
              </div>
            ))}
          </div>
        </div>

        <div className={'sm:col-span-2'}>
          <MarkdownEditor
            name={'description'}
            label={'Mô tả món ăn (hỗ trợ Markdown — in đậm, danh sách, bảng...)'}
            defaultValue={initial?.description ?? ''}
            rows={6}
            maxLength={2000}
            placeholder={'Mô tả hấp dẫn về món ăn...'}
            helpText={'Dùng thanh công cụ để in đậm, tạo danh sách, bảng... Nội dung hiển thị đúng định dạng ở trang chi tiết.'}
          />
        </div>

        <div className={'grid gap-1.5 sm:col-span-2'}>
          <Label htmlFor={'image'}>Ảnh đại diện</Label>

          <Input
            id={'image_url'}
            name={'image_url'}
            ref={urlInputRef}
            type={'url'}
            maxLength={500}
            value={imageUrlText}
            onChange={(event) => handleUrlChange(event.target.value)}
            placeholder={'https://... — dán link ảnh trực tiếp'}
          />

          <div className={'flex items-center gap-2'}>
            <span className={'flex-1 border-t'} />

            <span className={'text-muted-foreground text-xs'}>
              hoặc tải file lên
            </span>

            <span className={'flex-1 border-t'} />
          </div>

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
            không trùng. File tải lên sẽ ưu tiên hơn link đã dán.
          </p>

          {preview && (
            <div className={'mt-2 flex flex-col items-start gap-2'}>
              <div className={'relative overflow-hidden rounded-lg border bg-muted shadow-sm'}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt={'Xem trước ảnh đại diện'}
                  className={'h-44 w-auto max-w-full rounded-md object-cover'}
                />
              </div>

              <Button
                type={'button'}
                variant={'outline'}
                size={'sm'}
                onClick={handleClearImage}
                className={'text-xs text-destructive hover:text-destructive'}
              >
                Xóa ảnh đại diện
              </Button>
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
