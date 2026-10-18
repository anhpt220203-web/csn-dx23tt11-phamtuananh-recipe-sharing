'use client';

import { useActionState, useEffect, useState } from 'react';
import { ExternalLink, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@kit/ui/alert-dialog';
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Card, CardContent } from '@kit/ui/card';
import { NativeSelect, NativeSelectOption } from '@kit/ui/native-select';

import { deleteMediaFileAction } from '../actions';
import { MEDIA_ACTION_INITIAL } from '../media-constants';

export type MediaItem = {
  /** Object path trong bucket, vd "tips/abc123.jpg". */
  path: string;
  name: string;
  /** Nguồn ảnh: recipes | tips | categories | banners | uploads | khac. */
  source: string;
  createdAt: string | null;
  size: number | null;
  /** Tên thực thể đang sử dụng ảnh này (nếu tìm thấy). */
  usedIn?: string | null;
};

const SOURCE_OPTIONS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'recipes', label: 'Công thức' },
  { value: 'tips', label: 'Mẹo vặt' },
  { value: 'categories', label: 'Danh mục' },
  { value: 'banners', label: 'Banner' },
  { value: 'uploads', label: 'Người dùng tải lên' },
  { value: 'khac', label: 'Khác / Chưa dùng' },
] as const;

const SOURCE_LABELS: Record<string, string> = {
  recipes: 'Công thức',
  tips: 'Mẹo vặt',
  categories: 'Danh mục',
  banners: 'Banner',
  uploads: 'Người dùng tải lên',
  khac: 'Khác',
};

function formatBytes(bytes: number | null): string {
  if (bytes === null || bytes === undefined) {
    return '—';
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function thumbnailSrc(path: string): string {
  const encoded = path.split('/').map(encodeURIComponent).join('/');

  return `/api/image/recipe-images/${encoded}`;
}

/**
 * Trình duyệt ảnh trong bucket `recipe-images`: lọc theo nguồn,
 * xem ảnh gốc, xóa ảnh (dialog xác nhận).
 */
export function MediaBrowser({ items }: { items: MediaItem[] }) {
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [confirmPath, setConfirmPath] = useState<string | null>(null);

  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteMediaFileAction,
    MEDIA_ACTION_INITIAL,
  );

  useEffect(() => {
    // Chỉ toast khi action vừa chạy xong (không còn pending) và thành công.
    if (!deletePending && deleteState.ok && !deleteState.initial && confirmPath) {
      toast.success('Đã xóa ảnh khỏi kho lưu trữ.');
      setConfirmPath(null);
    }
  }, [deleteState, deletePending, confirmPath]);

  const filtered =
    sourceFilter === 'all'
      ? items
      : items.filter((item) => item.source === sourceFilter);

  return (
    <div className={'flex flex-col gap-4'}>
      <div className={'flex flex-wrap items-center gap-3'}>
        <NativeSelect
          value={sourceFilter}
          onChange={(event) => setSourceFilter(event.target.value)}
          className={'w-56'}
          aria-label={'Lọc theo nguồn ảnh'}
        >
          {SOURCE_OPTIONS.map((option) => (
            <NativeSelectOption key={option.value} value={option.value}>
              {option.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>

        <span className={'text-muted-foreground text-sm'}>
          {filtered.length} ảnh
        </span>
      </div>

      {!deleteState.ok && (
        <p role={'alert'} className={'text-destructive text-sm'}>
          {deleteState.message}
        </p>
      )}

      {filtered.length === 0 ? (
        <Card>
          <CardContent className={'py-10 text-center'}>
            <p className={'text-muted-foreground text-sm'}>
              Chưa có ảnh nào trong mục này.
            </p>
          </CardContent>
        </Card>
      ) : (
        <ul className={'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'}>
          {filtered.map((item) => (
            <li key={item.path}>
              <Card className={'overflow-hidden'}>
                <div className={'relative aspect-video w-full bg-muted'}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={thumbnailSrc(item.path)}
                    alt={item.name}
                    loading={'lazy'}
                    className={'h-full w-full object-cover'}
                  />
                </div>

                <CardContent className={'flex flex-col gap-2 p-3'}>
                  <p
                    className={'truncate font-mono text-xs'}
                    title={item.name}
                  >
                    {item.name}
                  </p>

                  {item.usedIn && (
                    <p
                      className={'truncate text-xs font-medium text-primary'}
                      title={`Đang dùng trong: ${item.usedIn}`}
                    >
                      {item.usedIn}
                    </p>
                  )}

                  <div className={'flex items-center gap-2'}>
                    <Badge variant={'secondary'} className={'text-xs'}>
                      {SOURCE_LABELS[item.source] ?? item.source}
                    </Badge>

                    <span className={'text-muted-foreground text-xs'}>
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString('vi-VN')
                        : '—'}
                    </span>

                    <span className={'text-muted-foreground ml-auto text-xs'}>
                      {formatBytes(item.size)}
                    </span>
                  </div>

                  <div className={'flex items-center gap-2 pt-1'}>
                    <Button
                      nativeButton={false}
                      variant={'outline'}
                      size={'sm'}
                      className={'gap-1'}
                      render={
                        <a
                          href={thumbnailSrc(item.path)}
                          target={'_blank'}
                          rel={'noreferrer'}
                        />
                      }
                    >
                      <ExternalLink className={'h-3.5 w-3.5'} />
                      <span>Xem</span>
                    </Button>

                    <AlertDialog
                      open={confirmPath === item.path}
                      onOpenChange={(open) =>
                        setConfirmPath(open ? item.path : null)
                      }
                    >
                      <AlertDialogTrigger
                        render={
                          <Button
                            type={'button'}
                            variant={'destructive'}
                            size={'sm'}
                            className={'gap-1'}
                          />
                        }
                      >
                        <Trash2 className={'h-3.5 w-3.5'} />
                        <span>Xóa</span>
                      </AlertDialogTrigger>

                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Xóa ảnh khỏi kho lưu trữ?
                          </AlertDialogTitle>

                          <AlertDialogDescription>
                            Ảnh “{item.name}” sẽ bị xóa vĩnh viễn khỏi
                            Storage. Các bài viết đang dùng ảnh này sẽ bị
                            hỏng ảnh. Thao tác không thể hoàn tác.
                          </AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter>
                          <AlertDialogCancel disabled={deletePending}>
                            Hủy
                          </AlertDialogCancel>

                          <form action={deleteAction}>
                            <input
                              type={'hidden'}
                              name={'path'}
                              value={item.path}
                            />

                            <AlertDialogAction
                              type={'submit'}
                              disabled={deletePending}
                              className={
                                'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                              }
                            >
                              {deletePending ? 'Đang xóa...' : 'Xóa ảnh'}
                            </AlertDialogAction>
                          </form>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
