'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Eye } from 'lucide-react';

import { Badge } from '@kit/ui/badge';
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

import { resolveRecipeImageSrc } from '~/lib/recipes/images';

export type AdminRecipeItem = {
  id: number;
  title: string;
  slug: string;
  image_url: string | null;
  difficulty: string | null;
  cook_time: number | null;
  status: string;
  categoryName?: string;
};

export function PreviewRecipeButton({ recipe }: { recipe: AdminRecipeItem }) {
  const [open, setOpen] = useState(false);
  const categoryName = recipe.categoryName ?? '—';
  const imageSrc = recipe.image_url
    ? (resolveRecipeImageSrc(recipe.image_url) ?? recipe.image_url)
    : null;

  return (
    <>
      <Button
        type={'button'}
        variant={'outline'}
        size={'sm'}
        className={'gap-1'}
        onClick={() => setOpen(true)}
        title={`Xem trước công thức "${recipe.title}"`}
      >
        <Eye className={'h-3.5 w-3.5'} />
        <span>Xem trước</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className={'max-h-[90vh] overflow-y-auto sm:max-w-xl'}>
          <DialogHeader className={'space-y-2'}>
            <div className={'flex flex-wrap items-center gap-2'}>
              <Badge
                variant={recipe.status === 'draft' ? 'secondary' : 'default'}
              >
                {recipe.status === 'draft' ? 'Nháp' : 'Đã xuất bản'}
              </Badge>

              <Badge variant={'secondary'}>{categoryName}</Badge>

              {recipe.difficulty && (
                <Badge variant={'outline'}>{recipe.difficulty}</Badge>
              )}

              {recipe.cook_time !== null && (
                <Badge variant={'outline'}>{recipe.cook_time} phút nấu</Badge>
              )}
            </div>

            <DialogTitle className={'text-xl font-bold leading-tight'}>
              {recipe.title}
            </DialogTitle>

            <DialogDescription className={'font-mono text-xs text-muted-foreground'}>
              /cong-thuc/{recipe.slug}
            </DialogDescription>
          </DialogHeader>

          <div className={'space-y-4 py-2'}>
            {imageSrc ? (
              <div
                className={
                  'relative aspect-video w-full overflow-hidden rounded-lg border bg-muted'
                }
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageSrc}
                  alt={recipe.title}
                  className={'h-full w-full object-cover'}
                />
              </div>
            ) : (
              <div
                className={
                  'flex aspect-video w-full items-center justify-center rounded-lg border bg-muted text-sm text-muted-foreground'
                }
              >
                Chưa có ảnh đại diện
              </div>
            )}

            <div className={'rounded-lg bg-muted/40 p-3 text-xs flex flex-col gap-1.5 border'}>
              <div className={'flex justify-between'}>
                <span className={'text-muted-foreground'}>Danh mục:</span>
                <span className={'font-medium'}>{categoryName}</span>
              </div>
              <div className={'flex justify-between'}>
                <span className={'text-muted-foreground'}>Thời gian nấu:</span>
                <span className={'font-medium'}>
                  {recipe.cook_time !== null ? `${recipe.cook_time} phút` : 'Chưa thiết lập'}
                </span>
              </div>
              <div className={'flex justify-between'}>
                <span className={'text-muted-foreground'}>Độ khó:</span>
                <span className={'font-medium'}>{recipe.difficulty ?? 'Trung bình'}</span>
              </div>
            </div>
          </div>

          <DialogFooter className={'gap-2 pt-2 sm:justify-between'}>
            <Link
              href={`/cong-thuc/${recipe.slug}`}
              target={'_blank'}
              rel={'noopener noreferrer'}
              className={
                'inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium'
              }
            >
              <span>Mở trang chi tiết món ăn</span>
              <ExternalLink className={'h-3.5 w-3.5'} />
            </Link>

            <DialogClose render={<Button type={'button'} variant={'outline'} />}>
              Đóng
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
