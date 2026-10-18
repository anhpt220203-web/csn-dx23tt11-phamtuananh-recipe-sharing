'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { Eye, Pencil } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@kit/ui/dialog';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';
import { MediaUploadDialog } from '../../media/_components/media-upload-dialog';

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
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    createBannerAction,
    BANNER_ACTION_INITIAL,
  );

  useEffect(() => {
    if (state.ok && !state.initial) {
      toast.success('Đã thêm banner mới thành công!');
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className={'grid grid-cols-1 gap-3 sm:grid-cols-2'}>
      <div className={'grid gap-1.5'}>
        <Label htmlFor={'new-title'}>Tiêu đề *</Label>
        <Input id={'new-title'} name={'title'} required maxLength={200} placeholder={'Hương vị ẩm thực Việt Nam'} />
      </div>

      <div className={'grid gap-1.5'}>
        <Label htmlFor={'new-subtitle'}>Phụ đề</Label>
        <Input id={'new-subtitle'} name={'subtitle'} maxLength={300} placeholder={'Khám phá hàng ngàn công thức nấu ăn ngon...'} />
      </div>

      <div className={'grid gap-1.5'}>
        <div className={'flex items-center justify-between'}>
          <Label htmlFor={'new-image'}>URL ảnh</Label>
          <MediaUploadDialog
            defaultFolder={'banners'}
            buttonLabel={'Tải ảnh & Điền link'}
            buttonVariant={'ghost'}
            size={'sm'}
            className={'h-6 text-xs px-2 text-primary hover:text-primary'}
            onUploaded={(items) => {
              if (items[0]) {
                const input = document.getElementById('new-image') as HTMLInputElement | null;
                if (input) {
                  input.value = items[0].proxyUrl;
                  input.dispatchEvent(new Event('input', { bubbles: true }));
                }
              }
            }}
          />
        </div>
        <Input
          id={'new-image'}
          name={'image_url'}
          maxLength={500}
          placeholder={'/api/image/recipe-images/banners/... hoặc https://...'}
        />
      </div>

      <div className={'grid gap-1.5'}>
        <Label htmlFor={'new-link'}>Liên kết (khi nhấn vào banner)</Label>
        <Input
          id={'new-link'}
          name={'link_url'}
          maxLength={500}
          placeholder={'/tim-kiem?category=mon-canh'}
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

export function EditBannerModal({
  banner,
  open,
  onOpenChange,
}: {
  banner: BannerRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [updateState, updateAction, updatePending] = useActionState(
    updateBannerAction,
    BANNER_ACTION_INITIAL,
  );

  useEffect(() => {
    if (updateState.ok && !updateState.initial) {
      toast.success('Đã cập nhật banner thành công!');
      onOpenChange(false);
    }
  }, [updateState, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={'max-h-[90vh] overflow-y-auto sm:max-w-xl'}>
        <DialogHeader>
          <DialogTitle>Sửa banner</DialogTitle>
          <DialogDescription>
            Chỉnh sửa thông tin banner carousel hiển thị trên trang chủ.
          </DialogDescription>
        </DialogHeader>

        <form action={updateAction} className={'grid grid-cols-1 gap-3 sm:grid-cols-2 pt-2'}>
          <input type={'hidden'} name={'id'} value={banner.id} />

          <div className={'grid gap-1.5 sm:col-span-2'}>
            <Label htmlFor={`edit-title-${banner.id}`}>Tiêu đề *</Label>
            <Input
              id={`edit-title-${banner.id}`}
              name={'title'}
              required
              defaultValue={banner.title}
              maxLength={200}
            />
          </div>

          <div className={'grid gap-1.5 sm:col-span-2'}>
            <Label htmlFor={`edit-subtitle-${banner.id}`}>Phụ đề</Label>
            <Input
              id={`edit-subtitle-${banner.id}`}
              name={'subtitle'}
              defaultValue={banner.subtitle ?? ''}
              maxLength={300}
            />
          </div>

          <div className={'grid gap-1.5 sm:col-span-2'}>
            <div className={'flex items-center justify-between'}>
              <Label htmlFor={`edit-image-${banner.id}`}>URL ảnh</Label>
              <MediaUploadDialog
                defaultFolder={'banners'}
                buttonLabel={'Tải ảnh mới & Điền link'}
                buttonVariant={'ghost'}
                size={'sm'}
                className={'h-6 text-xs px-2 text-primary hover:text-primary'}
                onUploaded={(items) => {
                  if (items[0]) {
                    const input = document.getElementById(`edit-image-${banner.id}`) as HTMLInputElement | null;
                    if (input) {
                      input.value = items[0].proxyUrl;
                      input.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                  }
                }}
              />
            </div>
            <Input
              id={`edit-image-${banner.id}`}
              name={'image_url'}
              defaultValue={banner.image_url ?? ''}
              maxLength={500}
              placeholder={'/api/image/recipe-images/banners/... hoặc https://...'}
            />
          </div>

          <div className={'grid gap-1.5'}>
            <Label htmlFor={`edit-link-${banner.id}`}>Liên kết</Label>
            <Input
              id={`edit-link-${banner.id}`}
              name={'link_url'}
              defaultValue={banner.link_url ?? ''}
              maxLength={500}
              placeholder={'/tim-kiem'}
            />
          </div>

          <div className={'grid gap-1.5'}>
            <Label htmlFor={`edit-order-${banner.id}`}>Thứ tự hiển thị</Label>
            <Input
              id={`edit-order-${banner.id}`}
              name={'sort_order'}
              type={'number'}
              defaultValue={banner.sort_order}
            />
          </div>

          <div className={'flex items-center gap-2 sm:col-span-2'}>
            <input
              id={`edit-active-${banner.id}`}
              name={'is_active'}
              type={'checkbox'}
              defaultChecked={banner.is_active}
              className={'h-4 w-4'}
            />
            <Label htmlFor={`edit-active-${banner.id}`}>Đang hoạt động</Label>
          </div>

          <div className={'sm:col-span-2'}>
            <FormError message={updateState.ok ? undefined : updateState.message} />
          </div>

          <div className={'flex justify-end gap-2 sm:col-span-2'}>
            <Button
              type={'button'}
              variant={'outline'}
              onClick={() => onOpenChange(false)}
              disabled={updatePending}
            >
              Hủy
            </Button>
            <Button type={'submit'} disabled={updatePending}>
              {updatePending ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function PreviewBannerModal({
  banner,
  open,
  onOpenChange,
}: {
  banner: BannerRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={'max-h-[90vh] overflow-y-auto sm:max-w-2xl'}>
        <DialogHeader className={'space-y-2'}>
          <div className={'flex items-center gap-2'}>
            <Badge variant={banner.is_active ? 'default' : 'secondary'}>
              {banner.is_active ? 'Đang hoạt động' : 'Đang ẩn'}
            </Badge>
            <span className={'text-xs text-muted-foreground'}>
              Thứ tự: {banner.sort_order}
            </span>
          </div>

          <DialogTitle className={'text-xl font-bold leading-tight'}>
            {banner.title}
          </DialogTitle>

          {banner.subtitle && (
            <DialogDescription className={'text-sm text-muted-foreground'}>
              {banner.subtitle}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className={'space-y-4 pt-2'}>
          {banner.image_url ? (
            <div className={'relative aspect-video w-full overflow-hidden rounded-lg bg-muted border'}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={banner.image_url}
                alt={banner.title}
                className={'h-full w-full object-cover'}
              />
            </div>
          ) : (
            <div className={'flex h-36 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground'}>
              Không có ảnh banner
            </div>
          )}

          {banner.link_url && (
            <div className={'rounded-md bg-muted/50 p-2.5 text-xs'}>
              <span className={'font-semibold'}>Đường dẫn liên kết: </span>
              <span className={'font-mono text-primary'}>{banner.link_url}</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function BannerRowActions({ banner }: { banner: BannerRow }) {
  const [editOpen, setEditOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteBannerAction,
    BANNER_ACTION_INITIAL,
  );

  useEffect(() => {
    if (deleteState.ok && !deleteState.initial) {
      toast.success('Đã xóa banner thành công!');
    }
  }, [deleteState]);

  return (
    <>
      <div className={'flex shrink-0 items-center gap-2'}>
        <Button
          type={'button'}
          variant={'outline'}
          size={'sm'}
          onClick={() => setPreviewOpen(true)}
          className={'gap-1'}
          title={'Xem trước banner'}
        >
          <Eye className={'h-3.5 w-3.5'} />
          <span>Xem</span>
        </Button>

        <Button
          type={'button'}
          variant={'outline'}
          size={'sm'}
          onClick={() => setEditOpen(true)}
          className={'gap-1'}
          title={'Sửa banner'}
        >
          <Pencil className={'h-3.5 w-3.5'} />
          <span>Sửa</span>
        </Button>

        <form
          action={deleteAction}
          onSubmit={(e) => {
            if (!window.confirm(`Xóa banner "${banner.title}"? Thao tác không thể hoàn tác.`)) {
              e.preventDefault();
            }
          }}
        >
          <input type={'hidden'} name={'id'} value={banner.id} />
          <Button
            type={'submit'}
            variant={'destructive'}
            size={'sm'}
            disabled={deletePending}
          >
            {deletePending ? 'Đang xóa...' : 'Xóa'}
          </Button>
        </form>

        <FormError message={deleteState.ok ? undefined : deleteState.message} />
      </div>

      <EditBannerModal
        banner={banner}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <PreviewBannerModal
        banner={banner}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />
    </>
  );
}
