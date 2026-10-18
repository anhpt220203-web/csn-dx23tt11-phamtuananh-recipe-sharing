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

import { MarkdownEditor } from '~/components/markdown/markdown-editor';
import { AdminImagePicker } from '../../_components/admin-image-picker';
import { MediaUploadDialog } from '../../media/_components/media-upload-dialog';

import type { TipRow } from '~/lib/content/database';

import {
  createTipAction,
  deleteTipAction,
  toggleTipPublishAction,
  updateTipAction,
} from '../actions';
import { TIP_ACTION_INITIAL } from '../meo-vat-constants';

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

export function CreateTipForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    createTipAction,
    TIP_ACTION_INITIAL,
  );

  useEffect(() => {
    if (state.ok && !state.initial) {
      toast.success('Đã thêm bài viết mới thành công!');
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className={'grid grid-cols-1 gap-3 sm:grid-cols-2'}>
      <div className={'grid gap-1.5'}>
        <Label htmlFor={'tip-title'}>Tiêu đề *</Label>
        <Input id={'tip-title'} name={'title'} required maxLength={200} placeholder={'Ví dụ: Bí quyết luộc gà da giòn vàng ươm'} />
      </div>

      <div className={'grid gap-1.5'}>
        <Label htmlFor={'tip-slug'}>Slug (tự tạo nếu bỏ trống)</Label>
        <Input id={'tip-slug'} name={'slug'} maxLength={200} placeholder={'bi-quyet-luoc-ga'} />
      </div>

      <div className={'grid gap-1.5 sm:col-span-2'}>
        <Label htmlFor={'tip-excerpt'}>Tóm tắt</Label>
        <Input id={'tip-excerpt'} name={'excerpt'} maxLength={300} placeholder={'Đoạn mô tả ngắn hiển thị dưới tiêu đề...'} />
      </div>

      <div className={'grid gap-1.5 sm:col-span-2'}>
        <AdminImagePicker
          urlName={'image_url'}
          fileName={'image_file'}
          existingName={'existing_image_url'}
        />
      </div>

      <div className={'grid gap-1.5 sm:col-span-2'}>
        <div className={'flex items-center justify-between'}>
          <Label htmlFor={'tip-content'}>Nội dung *</Label>
          <MediaUploadDialog
            defaultFolder={'tips'}
            buttonLabel={'Tải ảnh & Lấy mã Markdown'}
            buttonVariant={'ghost'}
            size={'sm'}
            className={'h-6 text-xs px-2 text-primary hover:text-primary'}
          />
        </div>
        <MarkdownEditor
          name={'content'}
          label={'Nội dung (hỗ trợ Markdown đầy đủ: tiêu đề, bảng, danh sách, ảnh...)'}
          rows={10}
          required
          placeholder={'Nhập chi tiết nội dung mẹo vặt... (Hỗ trợ định dạng Markdown: tiêu đề ##, bảng, danh sách, in đậm...)'}
          helpText={'Nội dung hiển thị dạng Markdown ở trang mẹo vặt: tiêu đề, bảng, danh sách, in đậm, liên kết, ảnh.'}
        />
      </div>

      <div className={'flex items-center gap-2'}>
        <input
          id={'tip-published'}
          name={'is_published'}
          type={'checkbox'}
          className={'h-4 w-4'}
        />
        <Label htmlFor={'tip-published'}>Xuất bản ngay</Label>
      </div>

      <div className={'sm:col-span-2'}>
        <FormError message={state.ok ? undefined : state.message} />
      </div>

      <div className={'sm:col-span-2'}>
        <Button type={'submit'} disabled={pending}>
          {pending ? 'Đang thêm...' : 'Thêm bài viết'}
        </Button>
      </div>
    </form>
  );
}

export function PreviewTipModal({
  tip,
  open,
  onOpenChange,
}: {
  tip: TipRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={'max-h-[90vh] overflow-y-auto sm:max-w-2xl'}>
        <DialogHeader className={'space-y-2'}>
          <div className={'flex flex-wrap items-center gap-2'}>
            <Badge variant={tip.is_published ? 'default' : 'secondary'}>
              {tip.is_published ? 'Đã xuất bản' : 'Bản nháp'}
            </Badge>
            <span className={'text-xs font-mono text-muted-foreground'}>
              /meo-vat/{tip.slug}
            </span>
          </div>

          <DialogTitle className={'text-xl font-bold leading-tight'}>
            {tip.title}
          </DialogTitle>

          {tip.excerpt && (
            <DialogDescription className={'text-sm italic text-muted-foreground'}>
              {tip.excerpt}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className={'space-y-4 pt-2'}>
          {tip.image_url && (
            <div className={'relative aspect-video w-full overflow-hidden rounded-lg bg-muted border'}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={tip.image_url}
                alt={tip.title}
                className={'h-full w-full object-cover'}
              />
            </div>
          )}

          <div className={'prose dark:prose-invert max-w-none whitespace-pre-line text-sm leading-relaxed text-foreground'}>
            {tip.content}
          </div>

          <div className={'border-t pt-3 text-xs text-muted-foreground flex justify-between'}>
            <span>Tạo ngày: {new Date(tip.created_at).toLocaleDateString('vi-VN')}</span>
            <span>Cập nhật: {new Date(tip.updated_at).toLocaleDateString('vi-VN')}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function EditTipModal({
  tip,
  open,
  onOpenChange,
}: {
  tip: TipRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [state, formAction, pending] = useActionState(
    updateTipAction,
    TIP_ACTION_INITIAL,
  );

  useEffect(() => {
    if (state.ok && !state.initial) {
      toast.success('Đã cập nhật bài viết thành công!');
      onOpenChange(false);
    }
  }, [state, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={'max-h-[90vh] overflow-y-auto sm:max-w-2xl'}>
        <DialogHeader>
          <DialogTitle>Sửa bài viết mẹo vặt</DialogTitle>
          <DialogDescription>
            Chỉnh sửa thông tin bài viết và lưu lại để cập nhật trên hệ thống.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className={'grid grid-cols-1 gap-3 sm:grid-cols-2 pt-2'}>
          <input type={'hidden'} name={'id'} value={tip.id} />

          <div className={'grid gap-1.5'}>
            <Label htmlFor={`edit-title-${tip.id}`}>Tiêu đề *</Label>
            <Input
              id={`edit-title-${tip.id}`}
              name={'title'}
              defaultValue={tip.title}
              required
              maxLength={200}
            />
          </div>

          <div className={'grid gap-1.5'}>
            <Label htmlFor={`edit-slug-${tip.id}`}>Slug</Label>
            <Input
              id={`edit-slug-${tip.id}`}
              name={'slug'}
              defaultValue={tip.slug}
              maxLength={200}
            />
          </div>

          <div className={'grid gap-1.5 sm:col-span-2'}>
            <Label htmlFor={`edit-excerpt-${tip.id}`}>Tóm tắt</Label>
            <Input
              id={`edit-excerpt-${tip.id}`}
              name={'excerpt'}
              defaultValue={tip.excerpt ?? ''}
              maxLength={300}
            />
          </div>

          <div className={'grid gap-1.5 sm:col-span-2'}>
            <AdminImagePicker
              urlName={'image_url'}
              fileName={'image_file'}
              existingName={'existing_image_url'}
              defaultUrl={tip.image_url}
              idPrefix={`tip-${tip.id}`}
            />
          </div>

          <div className={'grid gap-1.5 sm:col-span-2'}>
            <div className={'flex items-center justify-between'}>
              <Label htmlFor={`edit-content-${tip.id}`}>Nội dung *</Label>
              <MediaUploadDialog
                defaultFolder={'tips'}
                buttonLabel={'Tải ảnh & Lấy mã Markdown'}
                buttonVariant={'ghost'}
                size={'sm'}
                className={'h-6 text-xs px-2 text-primary hover:text-primary'}
              />
            </div>
            <MarkdownEditor
              name={'content'}
              label={'Nội dung (Markdown)'}
              defaultValue={tip.content}
              rows={10}
              required
            />
          </div>

          <div className={'flex items-center gap-2 sm:col-span-2'}>
            <input
              id={`edit-published-${tip.id}`}
              name={'is_published'}
              type={'checkbox'}
              defaultChecked={tip.is_published}
              className={'h-4 w-4'}
            />
            <Label htmlFor={`edit-published-${tip.id}`}>Xuất bản bài viết</Label>
          </div>

          <div className={'sm:col-span-2'}>
            <FormError message={state.ok ? undefined : state.message} />
          </div>

          <div className={'flex justify-end gap-2 sm:col-span-2'}>
            <Button
              type={'button'}
              variant={'outline'}
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              Hủy
            </Button>
            <Button type={'submit'} disabled={pending}>
              {pending ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function TipRowActions({ tip }: { tip: TipRow }) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const [toggleState, toggleAction, togglePending] = useActionState(
    toggleTipPublishAction,
    TIP_ACTION_INITIAL,
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteTipAction,
    TIP_ACTION_INITIAL,
  );

  useEffect(() => {
    if (toggleState.ok && !toggleState.initial) {
      toast.success(tip.is_published ? 'Đã gỡ bài viết xuống!' : 'Đã xuất bản bài viết thành công!');
    }
  }, [toggleState, tip.is_published]);

  useEffect(() => {
    if (deleteState.ok && !deleteState.initial) {
      toast.success('Đã xóa bài viết thành công!');
    }
  }, [deleteState]);

  return (
    <>
      <div className={'flex flex-wrap shrink-0 items-center gap-2'}>
        <Button
          type={'button'}
          variant={'outline'}
          size={'sm'}
          onClick={() => setPreviewOpen(true)}
          className={'gap-1'}
          title={'Xem trước bài viết'}
        >
          <Eye className={'h-3.5 w-3.5'} />
          <span>Xem trước</span>
        </Button>

        <Button
          type={'button'}
          variant={'outline'}
          size={'sm'}
          onClick={() => setEditOpen(true)}
          className={'gap-1'}
          title={'Chỉnh sửa bài viết'}
        >
          <Pencil className={'h-3.5 w-3.5'} />
          <span>Sửa</span>
        </Button>

        <form action={toggleAction}>
          <input type={'hidden'} name={'id'} value={tip.id} />
          {tip.is_published ? null : (
            <input type={'hidden'} name={'is_published'} value={'on'} />
          )}

          <Button
            type={'submit'}
            variant={'outline'}
            size={'sm'}
            disabled={togglePending}
          >
            {togglePending ? 'Đang xử lý...' : tip.is_published ? 'Gỡ xuống' : 'Xuất bản'}
          </Button>
        </form>

        <form
          action={deleteAction}
          onSubmit={(e) => {
            if (!window.confirm(`Xóa bài viết "${tip.title}"? Thao tác không thể hoàn tác.`)) {
              e.preventDefault();
            }
          }}
        >
          <input type={'hidden'} name={'id'} value={tip.id} />
          <Button
            type={'submit'}
            variant={'destructive'}
            size={'sm'}
            disabled={deletePending}
          >
            {deletePending ? 'Đang xóa...' : 'Xóa'}
          </Button>
        </form>

        <FormError message={toggleState.ok ? undefined : toggleState.message} />
        <FormError message={deleteState.ok ? undefined : deleteState.message} />
      </div>

      <PreviewTipModal
        tip={tip}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />

      <EditTipModal
        tip={tip}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </>
  );
}
