'use client';

import { useActionState, useEffect, useState } from 'react';
import { Loader2, Pencil } from 'lucide-react';
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

import { renameMediaFileAction } from '../actions';
import { MEDIA_ACTION_INITIAL } from '../media-constants';
import type { MediaItem } from './media-browser';

function getThumbnailSrc(item: MediaItem): string {
  const bucket = item.bucket ?? 'recipe-images';
  const encoded = item.path.split('/').map(encodeURIComponent).join('/');

  return `/api/image/${bucket}/${encoded}`;
}

export function MediaRenameDialog({
  item,
  open,
  onOpenChange,
}: {
  item: MediaItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const dotIndex = item?.name.lastIndexOf('.') ?? -1;
  const initialBaseName =
    item && dotIndex !== -1 ? item.name.slice(0, dotIndex) : (item?.name ?? '');
  const fileExt =
    item && dotIndex !== -1 ? item.name.slice(dotIndex) : '';

  const [newName, setNewName] = useState(initialBaseName);

  // Cập nhật giá trị input khi đổi item
  useEffect(() => {
    if (item) {
      const idx = item.name.lastIndexOf('.');
      setNewName(idx !== -1 ? item.name.slice(0, idx) : item.name);
    }
  }, [item]);

  const [state, formAction, isPending] = useActionState(
    renameMediaFileAction,
    MEDIA_ACTION_INITIAL,
  );

  useEffect(() => {
    if (!isPending && state.ok && !state.initial) {
      toast.success(state.message ?? 'Đã đổi tên file thành công!');
      onOpenChange(false);
    }
  }, [state, isPending, onOpenChange]);

  if (!item) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={'max-w-md'}>
        <DialogHeader>
          <DialogTitle className={'flex items-center gap-2 text-lg font-semibold'}>
            <Pencil className={'h-5 w-5 text-primary'} />
            <span>Đổi tên file ảnh</span>
          </DialogTitle>

          <DialogDescription>
            Nhập tên mới cho file ảnh. Tên sẽ được chuẩn hoá tự động (bỏ dấu tiếng Việt, không chứa khoảng trắng).
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className={'flex flex-col gap-4 py-2'}>
          <input type={'hidden'} name={'path'} value={item.path} />
          <input
            type={'hidden'}
            name={'bucket'}
            value={item.bucket ?? 'recipe-images'}
          />

          {/* Xem trước ảnh và thông tin hiện tại */}
          <div className={'flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 p-2.5'}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getThumbnailSrc(item)}
              alt={item.name}
              className={'h-14 w-14 shrink-0 rounded-md object-cover border border-border/40'}
            />

            <div className={'flex min-w-0 flex-1 flex-col text-xs'}>
              <span className={'text-muted-foreground'}>Tên hiện tại:</span>
              <p className={'truncate font-mono font-medium text-foreground'} title={item.name}>
                {item.name}
              </p>
              {item.usedIn && (
                <p className={'truncate text-primary font-medium mt-0.5'} title={`Đang dùng trong: ${item.usedIn}`}>
                  Đang dùng: {item.usedIn}
                </p>
              )}
            </div>
          </div>

          {/* Ô nhập tên mới */}
          <div className={'flex flex-col gap-1.5'}>
            <label
              htmlFor={'new-filename-input'}
              className={'text-xs font-semibold text-foreground'}
            >
              Tên file mới:
            </label>

            <div className={'flex items-center gap-1.5'}>
              <Input
                id={'new-filename-input'}
                name={'newName'}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={'Nhập tên mới...'}
                disabled={isPending}
                required
                autoFocus
                className={'font-mono text-sm'}
              />
              {fileExt && (
                <span className={'rounded-md bg-muted px-2.5 py-2 font-mono text-xs text-muted-foreground'}>
                  {fileExt}
                </span>
              )}
            </div>

            <p className={'text-muted-foreground text-[11px]'}>
              Ví dụ: nhập <code className={'text-foreground font-semibold'}>pho-bo-ha-noi</code> hệ thống sẽ lưu thành <code className={'text-foreground font-semibold'}>pho-bo-ha-noi{fileExt}</code>
            </p>
          </div>

          {/* Thông báo nếu ảnh đang được dùng */}
          {item.usedIn && (
            <div className={'rounded-md bg-primary/10 p-2.5 text-xs text-foreground'}>
              <p>
                <strong>Lưu ý:</strong> Ảnh này đang được sử dụng. Hệ thống sẽ tự động cập nhật liên kết mới trong bài viết để không bị hỏng ảnh.
              </p>
            </div>
          )}

          {/* Lỗi nếu có */}
          {!state.ok && !state.initial && state.message && (
            <p role={'alert'} className={'text-xs font-medium text-destructive'}>
              {state.message}
            </p>
          )}

          <DialogFooter className={'gap-2 pt-2'}>
            <DialogClose
              disabled={isPending}
              render={
                <Button
                  type={'button'}
                  variant={'outline'}
                  disabled={isPending}
                />
              }
            >
              Hủy
            </DialogClose>

            <Button
              type={'submit'}
              disabled={isPending || !newName.trim()}
              className={'gap-1.5'}
            >
              {isPending ? (
                <>
                  <Loader2 className={'h-4 w-4 animate-spin'} />
                  <span>Đang đổi tên...</span>
                </>
              ) : (
                <>
                  <Pencil className={'h-4 w-4'} />
                  <span>Lưu tên mới</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
