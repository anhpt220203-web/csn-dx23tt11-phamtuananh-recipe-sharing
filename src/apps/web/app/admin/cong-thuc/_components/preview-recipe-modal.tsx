'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Clock,
  ExternalLink,
  Eye,
  Flame,
  Layers,
  Pencil,
  Sparkles,
  Users,
  Utensils,
} from 'lucide-react';

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
import {
  getRecipePreviewDetailAction,
  type RecipePreviewDetail,
} from '../actions';

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
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<RecipePreviewDetail | null>(null);

  useEffect(() => {
    if (open) {
      setLoading(true);
      getRecipePreviewDetailAction(recipe.id)
        .then((res) => {
          if (res.ok && res.data) {
            setDetail(res.data);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [open, recipe.id]);

  const categoryName = detail?.category_name || recipe.categoryName || '—';
  const imageSrc = (detail?.image_url || recipe.image_url)
    ? (resolveRecipeImageSrc(detail?.image_url || recipe.image_url) ?? (detail?.image_url || recipe.image_url))
    : null;

  const totalTime =
    (detail?.prep_time ?? 0) + (detail?.cook_time ?? recipe.cook_time ?? 0);

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
        <DialogContent className={'max-h-[92vh] overflow-y-auto sm:max-w-2xl'}>
          <DialogHeader className={'space-y-2'}>
            <div className={'flex flex-wrap items-center gap-2'}>
              <Badge
                variant={recipe.status === 'draft' ? 'secondary' : 'default'}
              >
                {recipe.status === 'draft' ? 'Nháp' : 'Đã xuất bản'}
              </Badge>

              <Badge variant={'secondary'}>{categoryName}</Badge>

              {(detail?.difficulty || recipe.difficulty) && (
                <Badge variant={'outline'}>
                  {detail?.difficulty || recipe.difficulty}
                </Badge>
              )}
            </div>

            <DialogTitle className={'text-xl font-bold leading-snug'}>
              {recipe.title}
            </DialogTitle>

            <DialogDescription className={'font-mono text-xs text-muted-foreground'}>
              /cong-thuc/{recipe.slug}
            </DialogDescription>
          </DialogHeader>

          <div className={'space-y-5 py-2'}>
            {/* Ảnh đại diện */}
            {imageSrc ? (
              <div
                className={
                  'relative aspect-video w-full overflow-hidden rounded-lg border bg-muted shadow-sm'
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
                Chưa có ảnh đại diện món ăn
              </div>
            )}

            {/* Thông số nhanh: Khẩu phần, Chuẩn bị, Nấu, Độ khó */}
            <div className={'grid grid-cols-2 gap-2 sm:grid-cols-4'}>
              <div className={'flex flex-col rounded-lg border bg-muted/40 p-2.5 text-center'}>
                <span className={'inline-flex items-center justify-center gap-1 text-[11px] text-muted-foreground'}>
                  <Users className={'h-3 w-3'} /> Khẩu phần
                </span>
                <span className={'mt-0.5 font-semibold text-sm'}>
                  {detail?.servings ? `${detail.servings} người` : '—'}
                </span>
              </div>

              <div className={'flex flex-col rounded-lg border bg-muted/40 p-2.5 text-center'}>
                <span className={'inline-flex items-center justify-center gap-1 text-[11px] text-muted-foreground'}>
                  <Clock className={'h-3 w-3'} /> Chuẩn bị
                </span>
                <span className={'mt-0.5 font-semibold text-sm'}>
                  {detail?.prep_time ? `${detail.prep_time} phút` : '—'}
                </span>
              </div>

              <div className={'flex flex-col rounded-lg border bg-muted/40 p-2.5 text-center'}>
                <span className={'inline-flex items-center justify-center gap-1 text-[11px] text-muted-foreground'}>
                  <Utensils className={'h-3 w-3'} /> Nấu chín
                </span>
                <span className={'mt-0.5 font-semibold text-sm'}>
                  {detail?.cook_time !== null && detail?.cook_time !== undefined
                    ? `${detail.cook_time} phút`
                    : recipe.cook_time !== null
                      ? `${recipe.cook_time} phút`
                      : '—'}
                </span>
              </div>

              <div className={'flex flex-col rounded-lg border bg-muted/40 p-2.5 text-center'}>
                <span className={'inline-flex items-center justify-center gap-1 text-[11px] text-muted-foreground'}>
                  <Flame className={'h-3 w-3'} /> Độ khó
                </span>
                <span className={'mt-0.5 font-semibold text-sm'}>
                  {detail?.difficulty || recipe.difficulty || 'Trung bình'}
                </span>
              </div>
            </div>

            {/* Mô tả món ăn */}
            {detail?.description && (
              <div className={'space-y-1.5'}>
                <h4 className={'font-semibold text-sm text-foreground flex items-center gap-1.5'}>
                  <Sparkles className={'h-4 w-4 text-primary'} />
                  Mô tả món ăn
                </h4>
                <div className={'rounded-lg border bg-muted/20 p-3 text-sm leading-relaxed text-muted-foreground whitespace-pre-line'}>
                  {detail.description}
                </div>
              </div>
            )}

            {/* Dinh dưỡng nếu có */}
            {detail && (detail.calories || detail.protein_g || detail.carbs_g || detail.fat_g) && (
              <div className={'space-y-1.5'}>
                <h4 className={'font-semibold text-sm text-foreground'}>
                  Giá trị dinh dưỡng (ước tính mỗi phần)
                </h4>
                <div className={'flex flex-wrap gap-2 text-xs'}>
                  {detail.calories !== null && (
                    <Badge variant={'secondary'} className={'px-2.5 py-1'}>
                      Năng lượng: <strong className={'ml-1 text-foreground'}>{detail.calories} kcal</strong>
                    </Badge>
                  )}
                  {detail.protein_g !== null && (
                    <Badge variant={'secondary'} className={'px-2.5 py-1'}>
                      Chất đạm: <strong className={'ml-1 text-foreground'}>{detail.protein_g}g</strong>
                    </Badge>
                  )}
                  {detail.carbs_g !== null && (
                    <Badge variant={'secondary'} className={'px-2.5 py-1'}>
                      Tinh bột: <strong className={'ml-1 text-foreground'}>{detail.carbs_g}g</strong>
                    </Badge>
                  )}
                  {detail.fat_g !== null && (
                    <Badge variant={'secondary'} className={'px-2.5 py-1'}>
                      Chất béo: <strong className={'ml-1 text-foreground'}>{detail.fat_g}g</strong>
                    </Badge>
                  )}
                  {detail.sugar_g !== null && (
                    <Badge variant={'secondary'} className={'px-2.5 py-1'}>
                      Đường: <strong className={'ml-1 text-foreground'}>{detail.sugar_g}g</strong>
                    </Badge>
                  )}
                  {detail.fiber_g !== null && (
                    <Badge variant={'secondary'} className={'px-2.5 py-1'}>
                      Chất xơ: <strong className={'ml-1 text-foreground'}>{detail.fiber_g}g</strong>
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Danh sách nguyên liệu */}
            <div className={'space-y-2'}>
              <h4 className={'font-semibold text-sm text-foreground flex items-center justify-between'}>
                <span className={'flex items-center gap-1.5'}>
                  <Layers className={'h-4 w-4 text-primary'} />
                  Nguyên liệu cần chuẩn bị
                </span>
                <span className={'text-xs font-normal text-muted-foreground'}>
                  {detail?.ingredients?.length ? `${detail.ingredients.length} nguyên liệu` : ''}
                </span>
              </h4>

              {loading ? (
                <div className={'p-3 text-center text-xs text-muted-foreground'}>
                  Đang tải danh sách nguyên liệu...
                </div>
              ) : detail?.ingredients && detail.ingredients.length > 0 ? (
                <ul className={'divide-y rounded-lg border bg-muted/20 text-sm'}>
                  {detail.ingredients.map((item, idx) => (
                    <li key={item.id ?? idx} className={'flex items-center gap-2 px-3 py-2'}>
                      <span className={'h-1.5 w-1.5 rounded-full bg-primary shrink-0'} />
                      <span className={'font-medium'}>{item.name}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className={'rounded-lg border bg-muted/20 p-3 text-center text-xs text-muted-foreground'}>
                  Chưa có nguyên liệu nào được thêm vào.
                </div>
              )}
            </div>

            {/* Các bước thực hiện */}
            <div className={'space-y-2'}>
              <h4 className={'font-semibold text-sm text-foreground flex items-center justify-between'}>
                <span className={'flex items-center gap-1.5'}>
                  <Utensils className={'h-4 w-4 text-primary'} />
                  Các bước thực hiện
                </span>
                <span className={'text-xs font-normal text-muted-foreground'}>
                  {detail?.steps?.length ? `${detail.steps.length} bước` : ''}
                </span>
              </h4>

              {loading ? (
                <div className={'p-3 text-center text-xs text-muted-foreground'}>
                  Đang tải các bước nấu...
                </div>
              ) : detail?.steps && detail.steps.length > 0 ? (
                <ol className={'space-y-2.5'}>
                  {detail.steps.map((st, idx) => (
                    <li
                      key={st.id ?? idx}
                      className={'flex items-start gap-3 rounded-lg border bg-muted/20 p-3 text-sm'}
                    >
                      <span
                        className={
                          'flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-xs text-primary-foreground'
                        }
                      >
                        {idx + 1}
                      </span>
                      <p className={'mt-0.5 leading-relaxed text-foreground whitespace-pre-line'}>
                        {st.step}
                      </p>
                    </li>
                  ))}
                </ol>
              ) : (
                <div className={'rounded-lg border bg-muted/20 p-3 text-center text-xs text-muted-foreground'}>
                  Chưa có bước thực hiện nào được ghi nhận.
                </div>
              )}
            </div>

            {/* Nguồn bài viết nếu có */}
            {detail?.source_name && (
              <div className={'text-xs text-muted-foreground'}>
                Nguồn tham khảo: {detail.source_url ? (
                  <a
                    href={detail.source_url}
                    target={'_blank'}
                    rel={'noreferrer'}
                    className={'text-primary underline'}
                  >
                    {detail.source_name}
                  </a>
                ) : (
                  detail.source_name
                )}
              </div>
            )}
          </div>

          <DialogFooter className={'gap-2 pt-3 sm:justify-between border-t'}>
            <div className={'flex flex-wrap items-center gap-3'}>
              <Link
                href={`/cong-thuc/${recipe.slug}`}
                target={'_blank'}
                rel={'noopener noreferrer'}
                className={
                  'inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium'
                }
              >
                <span>Mở trang công khai</span>
                <ExternalLink className={'h-3.5 w-3.5'} />
              </Link>

              <Button
                nativeButton={false}
                variant={'outline'}
                size={'sm'}
                className={'h-8 gap-1.5 text-xs'}
                render={
                  <Link href={`/admin/cong-thuc/${recipe.id}/sua`}>
                    <Pencil className={'h-3.5 w-3.5'} />
                    <span>Sửa công thức</span>
                  </Link>
                }
              />
            </div>

            <DialogClose render={<Button type={'button'} variant={'outline'} size={'sm'} />}>
              Đóng
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
