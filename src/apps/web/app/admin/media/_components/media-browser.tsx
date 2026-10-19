'use client';

import { useActionState, useEffect, useState } from 'react';
import { Copy, ExternalLink, FileCode, Pencil, Trash2 } from 'lucide-react';
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
import { MediaRenameDialog } from './media-rename-dialog';
import { MediaUploadDialog } from './media-upload-dialog';

export type MediaItem = {
  /** Object path trong bucket, vd "tips/abc123.jpg". */
  path: string;
  name: string;
  /** Tên bucket lưu trữ: recipe-images hoặc account_image. */
  bucket?: string;
  /** Nguồn ảnh: recipes | tips | categories | banners | avatars | uploads | khac. */
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
  { value: 'avatars', label: 'Ảnh đại diện (Avatar)' },
  { value: 'uploads', label: 'Người dùng tải lên' },
  { value: 'khac', label: 'Khác / Chưa dùng' },
] as const;

const SOURCE_LABELS: Record<string, string> = {
  recipes: 'Công thức',
  tips: 'Mẹo vặt',
  categories: 'Danh mục',
  banners: 'Banner',
  avatars: 'Ảnh đại diện',
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

function thumbnailSrc(item: MediaItem): string {
  const bucket = item.bucket ?? 'recipe-images';
  const encoded = item.path.split('/').map(encodeURIComponent).join('/');

  return `/api/image/${bucket}/${encoded}`;
}

/**
 * Trình duyệt ảnh trong bucket `recipe-images`: lọc theo nguồn,
 * xem ảnh gốc, xóa ảnh (dialog xác nhận).
 */
export function MediaBrowser({ items }: { items: MediaItem[] }) {
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [confirmPath, setConfirmPath] = useState<string | null>(null);
  const [itemToRename, setItemToRename] = useState<MediaItem | null>(null);

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

  const handleCopyLink = (item: MediaItem) => {
    const src = thumbnailSrc(item);
    const fullUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}${src}`
        : src;

    navigator.clipboard
      .writeText(fullUrl)
      .then(() => {
        toast.success(`Đã sao chép link ảnh "${item.name}"!`);
      })
      .catch(() => {
        toast.error('Không thể sao chép vào bộ nhớ tạm.');
      });
  };

  const handleCopyMarkdown = (item: MediaItem) => {
    const src = thumbnailSrc(item);
    const fullUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}${src}`
        : src;
    const cleanName = item.name.replace(/\.[^/.]+$/, '');
    const markdown = `![${cleanName}](${fullUrl})`;

    navigator.clipboard
      .writeText(markdown)
      .then(() => {
        toast.success(`Đã sao chép mã Markdown chèn ảnh "${item.name}"!`);
      })
      .catch(() => {
        toast.error('Không thể sao chép vào bộ nhớ tạm.');
      });
  };

  const [currentPage, setCurrentPage] = useState(1);
  const PER_PAGE = 12;

  const filtered =
    sourceFilter === 'all'
      ? items
      : items.filter((item) => item.source === sourceFilter);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedItems = filtered.slice(
    (safePage - 1) * PER_PAGE,
    safePage * PER_PAGE,
  );

  const handleSourceChange = (val: string) => {
    setSourceFilter(val);
    setCurrentPage(1);
  };

  return (
    <div className={'flex flex-col gap-4'}>
      <div className={'flex flex-wrap items-center justify-between gap-3'}>
        <div className={'flex flex-wrap items-center gap-3'}>
          <NativeSelect
            value={sourceFilter}
            onChange={(event) => handleSourceChange(event.target.value)}
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
            {totalPages > 1 && ` (Trang ${safePage}/${totalPages})`}
          </span>
        </div>

        <MediaUploadDialog />
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
          {paginatedItems.map((item) => (
            <li key={item.path}>
              <Card className={'overflow-hidden'}>
                <div className={'relative aspect-video w-full bg-muted'}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={thumbnailSrc(item)}
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

                  <div className={'flex flex-wrap items-center gap-1.5 pt-2 border-t border-border/50'}>
                    <Button
                      type={'button'}
                      variant={'outline'}
                      size={'sm'}
                      className={'h-8 gap-1 px-2.5 text-xs'}
                      onClick={() => handleCopyLink(item)}
                      title={'Sao chép đường dẫn ảnh trực tiếp'}
                    >
                      <Copy className={'h-3.5 w-3.5 text-muted-foreground'} />
                      <span>Copy link</span>
                    </Button>

                    <Button
                      type={'button'}
                      variant={'outline'}
                      size={'sm'}
                      className={'h-8 gap-1 px-2.5 text-xs'}
                      onClick={() => handleCopyMarkdown(item)}
                      title={'Sao chép mã chèn ảnh dạng Markdown: ![tên](url)'}
                    >
                      <FileCode className={'h-3.5 w-3.5 text-muted-foreground'} />
                      <span>Copy Markdown</span>
                    </Button>

                    <Button
                      type={'button'}
                      variant={'outline'}
                      size={'sm'}
                      className={'h-8 gap-1 px-2.5 text-xs'}
                      onClick={() => setItemToRename(item)}
                      title={'Đổi tên file ảnh'}
                    >
                      <Pencil className={'h-3.5 w-3.5 text-muted-foreground'} />
                      <span>Đổi tên</span>
                    </Button>

                    <div className={'ml-auto flex items-center gap-1.5'}>
                      <Button
                        nativeButton={false}
                        variant={'ghost'}
                        size={'sm'}
                        className={'h-8 gap-1 px-2 text-xs'}
                        render={
                          <a
                            href={thumbnailSrc(item)}
                            target={'_blank'}
                            rel={'noreferrer'}
                          />
                        }
                        title={'Xem ảnh gốc'}
                      >
                        <ExternalLink className={'h-3.5 w-3.5'} />
                        <span>Xem</span>
                      </Button>

                      <AlertDialog
                        open={confirmPath === item.path}
                        onOpenChange={(open: any) =>
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
                              <input
                                type={'hidden'}
                                name={'bucket'}
                                value={item.bucket ?? 'recipe-images'}
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
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <div className={'flex items-center justify-center gap-2 pt-2'}>
          <Button
            type={'button'}
            variant={'outline'}
            size={'sm'}
            disabled={safePage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            ← Trang trước
          </Button>

          <span className={'px-2 text-xs text-muted-foreground'}>
            Trang {safePage} / {totalPages}
          </span>

          <Button
            type={'button'}
            variant={'outline'}
            size={'sm'}
            disabled={safePage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            Trang sau →
          </Button>
        </div>
      )}

      <MediaRenameDialog
        item={itemToRename}
        open={Boolean(itemToRename)}
        onOpenChange={(open) => {
          if (!open) {
            setItemToRename(null);
          }
        }}
      />
    </div>
  );
}
