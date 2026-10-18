'use client';

import { useRef, useState, useTransition } from 'react';
import { Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@kit/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@kit/ui/dialog';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';
import { NativeSelect, NativeSelectOption } from '@kit/ui/native-select';
import { Textarea } from '@kit/ui/textarea';

import type { CategoryRow } from '~/lib/recipes/database';
import { slugify } from '~/lib/recipes/slugify';

import { createCategoryAction } from '../../danh-muc/actions';
import { CATEGORY_ACTION_INITIAL } from '../../danh-muc/category-constants';

const DIMENSION_OPTIONS = [
  { value: 'nhom-mon', label: 'Nhóm món (Khai vị, Món chính, Canh, Món xào...)' },
  { value: 'nguyen-lieu-chinh', label: 'Nguyên liệu chính (Thịt bò, Gà, Hải sản, Rau...)' },
  { value: 'phuong-phap-che-bien', label: 'Phương pháp chế biến (Kho, Nướng, Chiên, Hấp...)' },
  { value: 'bua-an', label: 'Bữa ăn (Bữa sáng, Bữa trưa, Bữa tối, Ăn vặt...)' },
  { value: 'phong-cach-am-thuc', label: 'Phong cách ẩm thực (3 miền, Á, Âu...)' },
] as const;

export function QuickCreateCategoryModal({
  onCategoryCreated,
}: {
  onCategoryCreated: (category: CategoryRow) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [dimension, setDimension] = useState<string>('nhom-mon');
  const [description, setDescription] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!slugTouched) {
      setSlug(slugify(val));
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setName('');
      setSlug('');
      setSlugTouched(false);
      setDimension('nhom-mon');
      setDescription('');
      setErrorMsg(null);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim() || isPending) return;

    setErrorMsg(null);
    const formData = new FormData();
    formData.append('name', name.trim());
    formData.append('slug', (slug.trim() || slugify(name)).trim());
    formData.append('dimension', dimension);
    if (description.trim()) {
      formData.append('description', description.trim());
    }

    startTransition(async () => {
      try {
        const res = await createCategoryAction(CATEGORY_ACTION_INITIAL, formData);
        if (res.ok && res.category) {
          toast.success(`Đã tạo danh mục "${res.category.name}" và tự động chọn!`);
          onCategoryCreated(res.category);
          handleOpenChange(false);
        } else {
          const msg = !res.ok && res.message ? res.message : 'Có lỗi xảy ra khi tạo danh mục.';
          setErrorMsg(msg);
          toast.error(msg);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Có lỗi xảy ra.';
        setErrorMsg(msg);
        toast.error(msg);
      }
    });
  };

  return (
    <>
      <Button
        type={'button'}
        variant={'ghost'}
        size={'sm'}
        onClick={() => handleOpenChange(true)}
        className={'h-6 gap-1 px-2 text-xs text-primary hover:text-primary'}
      >
        <Plus className={'h-3.5 w-3.5'} />
        <span>Tạo danh mục mới</span>
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className={'max-w-md sm:max-w-lg'}>
          <DialogHeader>
            <DialogTitle className={'text-base font-semibold'}>
              Tạo danh mục món ăn mới
            </DialogTitle>
            <DialogDescription>
              Tạo nhanh danh mục để gán vào công thức này ngay lập tức.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className={'flex flex-col gap-3 py-1'}>
            <div className={'grid gap-1.5'}>
              <Label htmlFor={'quick-cat-name'}>Tên danh mục *</Label>
              <Input
                id={'quick-cat-name'}
                name={'name'}
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
                maxLength={100}
                placeholder={'VD: Món Cuốn, Canh Chua, Bò Né...'}
                disabled={isPending}
              />
            </div>

            <div className={'grid gap-1.5'}>
              <Label htmlFor={'quick-cat-slug'}>Slug *</Label>
              <Input
                id={'quick-cat-slug'}
                name={'slug'}
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(slugify(e.target.value));
                }}
                required
                maxLength={120}
                placeholder={'vd: mon-cuon, canh-chua...'}
                disabled={isPending}
              />
            </div>

            <div className={'grid gap-1.5'}>
              <Label htmlFor={'quick-cat-dimension'}>Nhóm phân loại</Label>
              <NativeSelect
                id={'quick-cat-dimension'}
                name={'dimension'}
                value={dimension}
                onChange={(e) => setDimension(e.target.value)}
                disabled={isPending}
              >
                {DIMENSION_OPTIONS.map((opt) => (
                  <NativeSelectOption key={opt.value} value={opt.value}>
                    {opt.label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>

            <div className={'grid gap-1.5'}>
              <Label htmlFor={'quick-cat-desc'}>Mô tả ngắn</Label>
              <Textarea
                id={'quick-cat-desc'}
                name={'description'}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                maxLength={300}
                placeholder={'Mô tả ngắn về danh mục này...'}
                disabled={isPending}
              />
            </div>

            {errorMsg && (
              <p role={'alert'} className={'text-xs font-medium text-destructive'}>
                {errorMsg}
              </p>
            )}

            <DialogFooter className={'gap-2 pt-2'}>
              <DialogClose
                disabled={isPending}
                render={<Button type={'button'} variant={'outline'} disabled={isPending} />}
              >
                Hủy
              </DialogClose>

              <Button type={'submit'} disabled={isPending || !name.trim()} className={'gap-1.5'}>
                {isPending ? (
                  <>
                    <Loader2 className={'h-4 w-4 animate-spin'} />
                    <span>Đang tạo...</span>
                  </>
                ) : (
                  <>
                    <Plus className={'h-4 w-4'} />
                    <span>Tạo & Chọn ngay</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
