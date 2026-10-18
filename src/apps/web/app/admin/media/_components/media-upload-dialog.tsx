'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import {
  Copy,
  FileCode,
  Image as ImageIcon,
  Loader2,
  Plus,
  RotateCcw,
  UploadCloud,
  X,
} from 'lucide-react';
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
import { NativeSelect, NativeSelectOption } from '@kit/ui/native-select';

import { uploadMediaFileAction } from '../actions';
import {
  MEDIA_ACTION_INITIAL,
  type UploadedMediaItem,
} from '../media-constants';

const FOLDER_OPTIONS = [
  { value: 'uploads', label: 'Người dùng / Tải lên chung (uploads/)' },
  { value: 'tips', label: 'Mẹo vặt bếp núc (tips/)' },
  { value: 'recipes', label: 'Công thức món ăn (recipes/)' },
  { value: 'categories', label: 'Danh mục món ăn (categories/)' },
  { value: 'banners', label: 'Banner quảng bá (banners/)' },
] as const;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function MediaUploadDialog({
  defaultFolder = 'uploads',
  buttonLabel = 'Tải ảnh lên',
  buttonVariant = 'default',
  size = 'default',
  className,
  onUploaded,
}: {
  defaultFolder?: 'uploads' | 'recipes' | 'tips' | 'categories' | 'banners';
  buttonLabel?: string;
  buttonVariant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  onUploaded?: (items: UploadedMediaItem[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [folder, setFolder] = useState<string>(defaultFolder);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploadedList, setUploadedList] = useState<UploadedMediaItem[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [state, formAction, isPending] = useActionState(
    uploadMediaFileAction,
    MEDIA_ACTION_INITIAL,
  );

  // Dọn dẹp object preview URL khi unmount hoặc khi files thay đổi
  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  // Xử lý khi upload thành công
  useEffect(() => {
    if (!isPending && state.ok && !state.initial) {
      toast.success(state.message ?? 'Đã tải ảnh lên kho lưu trữ thành công!');
      if (state.uploadedItems && state.uploadedItems.length > 0) {
        setUploadedList(state.uploadedItems);
        if (onUploaded) {
          onUploaded(state.uploadedItems);
        }
      } else {
        setOpen(false);
      }
      setFiles([]);
      previews.forEach((url) => URL.revokeObjectURL(url));
      setPreviews([]);
    }
  }, [state, isPending, previews, onUploaded]);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setUploadedList([]);
      setFiles([]);
      previews.forEach((url) => URL.revokeObjectURL(url));
      setPreviews([]);
    }
  };

  const handleFilesAdded = (addedFiles: FileList | File[] | null) => {
    if (!addedFiles || addedFiles.length === 0) return;

    const newFiles: File[] = [];
    const newPreviews: string[] = [];

    Array.from(addedFiles).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        toast.error(`"${file.name}" không phải là file ảnh hợp lệ.`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`"${file.name}" vượt quá dung lượng 5MB.`);
        return;
      }
      newFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    });

    setFiles((prev) => [...prev, ...newFiles]);
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleRemoveFile = (index: number) => {
    URL.revokeObjectURL(previews[index] ?? '');
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer?.files) {
      handleFilesAdded(e.dataTransfer.files);
    }
  };

  const handleCopyLink = (url: string, name: string) => {
    const fullUrl =
      typeof window !== 'undefined' && url.startsWith('/')
        ? `${window.location.origin}${url}`
        : url;
    navigator.clipboard
      .writeText(fullUrl)
      .then(() => toast.success(`Đã sao chép link ảnh "${name}"!`))
      .catch(() => toast.error('Không thể sao chép vào bộ nhớ tạm.'));
  };

  const handleCopyMarkdown = (url: string, name: string) => {
    const fullUrl =
      typeof window !== 'undefined' && url.startsWith('/')
        ? `${window.location.origin}${url}`
        : url;
    const cleanName = name.replace(/\.[^/.]+$/, '');
    const md = `![${cleanName}](${fullUrl})`;
    navigator.clipboard
      .writeText(md)
      .then(() => toast.success(`Đã sao chép mã Markdown ảnh "${name}"!`))
      .catch(() => toast.error('Không thể sao chép vào bộ nhớ tạm.'));
  };

  return (
    <>
      <Button
        type={'button'}
        variant={buttonVariant}
        size={size}
        onClick={() => {
          setUploadedList([]);
          setOpen(true);
        }}
        className={`gap-1.5 shadow-xs ${className ?? ''}`}
      >
        <UploadCloud className={'h-4 w-4'} />
        <span>{buttonLabel}</span>
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className={'max-w-md sm:max-w-lg'}>
          <DialogHeader>
            <DialogTitle className={'flex items-center gap-2 text-lg font-semibold'}>
              <UploadCloud className={'h-5 w-5 text-primary'} />
              <span>Tải ảnh lên kho lưu trữ</span>
            </DialogTitle>

            <DialogDescription>
              Tải ảnh vào bucket Storage của hệ thống. Hỗ trợ JPG, PNG, WEBP, GIF, tối đa 5MB mỗi ảnh.
            </DialogDescription>
          </DialogHeader>

          {/* Màn hình kết quả sau khi upload xong: cho phép copy link & copy markdown ngay */}
          {uploadedList.length > 0 ? (
            <div className={'flex flex-col gap-4 py-2'}>
              <div className={'rounded-lg bg-primary/10 p-3 text-xs text-foreground'}>
                <p className={'font-semibold text-primary'}>
                  Tải lên {uploadedList.length} ảnh thành công!
                </p>
                <p className={'mt-1 text-muted-foreground'}>
                  Bạn có thể sao chép nhanh link ảnh hoặc mã Markdown dưới đây để dán vào bài viết:
                </p>
              </div>

              <ul className={'max-h-60 overflow-y-auto space-y-2 pr-1'}>
                {uploadedList.map((item, idx) => (
                  <li
                    key={`${item.proxyUrl}-${idx}`}
                    className={'flex flex-col gap-2 rounded-lg border border-border/70 bg-card p-2.5 text-xs'}
                  >
                    <div className={'flex items-center gap-2.5'}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.proxyUrl}
                        alt={item.name}
                        className={'h-12 w-12 shrink-0 rounded object-cover border border-border/50'}
                      />

                      <div className={'flex min-w-0 flex-1 flex-col'}>
                        <p className={'truncate font-medium text-foreground'} title={item.name}>
                          {item.name}
                        </p>
                        <p className={'truncate font-mono text-[11px] text-muted-foreground'} title={item.proxyUrl}>
                          {item.proxyUrl}
                        </p>
                      </div>
                    </div>

                    <div className={'flex items-center gap-2 pt-1 border-t border-border/40'}>
                      <Button
                        type={'button'}
                        variant={'outline'}
                        size={'sm'}
                        className={'h-7 gap-1 px-2 text-xs flex-1'}
                        onClick={() => handleCopyLink(item.proxyUrl, item.name)}
                      >
                        <Copy className={'h-3 w-3 text-muted-foreground'} />
                        <span>Copy link</span>
                      </Button>

                      <Button
                        type={'button'}
                        variant={'outline'}
                        size={'sm'}
                        className={'h-7 gap-1 px-2 text-xs flex-1'}
                        onClick={() => handleCopyMarkdown(item.proxyUrl, item.name)}
                      >
                        <FileCode className={'h-3 w-3 text-muted-foreground'} />
                        <span>Copy Markdown</span>
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>

              <DialogFooter className={'gap-2 pt-2'}>
                <Button
                  type={'button'}
                  variant={'outline'}
                  className={'gap-1.5'}
                  onClick={() => setUploadedList([])}
                >
                  <RotateCcw className={'h-3.5 w-3.5'} />
                  <span>Tải thêm ảnh khác</span>
                </Button>

                <Button
                  type={'button'}
                  onClick={() => handleOpenChange(false)}
                >
                  Hoàn tất
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <form action={formAction} className={'flex flex-col gap-4 py-2'}>
              {/* Chọn thư mục lưu trữ */}
              <div className={'flex flex-col gap-1.5'}>
                <label
                  htmlFor={'upload-folder-select'}
                  className={'text-xs font-semibold text-foreground'}
                >
                  Thư mục đích trong kho media:
                </label>

                <NativeSelect
                  id={'upload-folder-select'}
                  name={'folder'}
                  value={folder}
                  onChange={(e) => setFolder(e.target.value)}
                  disabled={isPending}
                >
                  {FOLDER_OPTIONS.map((opt) => (
                    <NativeSelectOption key={opt.value} value={opt.value}>
                      {opt.label}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </div>

              {/* Vùng kéo thả file */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition-colors cursor-pointer ${
                  isDragOver
                    ? 'border-primary bg-primary/10'
                    : 'border-muted-foreground/30 hover:border-primary/60 hover:bg-muted/40'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type={'file'}
                  name={'files'}
                  multiple
                  accept={'image/jpeg,image/png,image/webp,image/gif,image/avif'}
                  className={'hidden'}
                  disabled={isPending}
                  onChange={(e) => {
                    handleFilesAdded(e.target.files);
                    e.target.value = '';
                  }}
                />

                <div className={'rounded-full bg-primary/10 p-3 text-primary'}>
                  <ImageIcon className={'h-6 w-6'} />
                </div>

                <div className={'flex flex-col gap-1 text-xs'}>
                  <p className={'font-medium text-foreground'}>
                    <span className={'text-primary underline underline-offset-2'}>
                      Bấm để chọn file
                    </span>{' '}
                    hoặc kéo thả ảnh vào đây
                  </p>
                  <p className={'text-muted-foreground'}>
                    Có thể chọn nhiều ảnh cùng lúc (tối đa 5MB / file)
                  </p>
                </div>
              </div>

              {/* Danh sách ảnh đã chọn chuẩn bị tải lên */}
              {files.length > 0 && (
                <div className={'flex flex-col gap-2'}>
                  <div className={'flex items-center justify-between text-xs font-medium text-muted-foreground'}>
                    <span>Ảnh đã chọn ({files.length}):</span>
                    <button
                      type={'button'}
                      onClick={() => {
                        previews.forEach((u) => URL.revokeObjectURL(u));
                        setFiles([]);
                        setPreviews([]);
                      }}
                      className={'text-destructive hover:underline'}
                      disabled={isPending}
                    >
                      Xóa tất cả
                    </button>
                  </div>

                  <ul className={'max-h-48 overflow-y-auto space-y-2 pr-1'}>
                    {files.map((file, idx) => (
                      <li
                        key={`${file.name}-${idx}`}
                        className={'flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 p-2 text-xs'}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={previews[idx]}
                          alt={file.name}
                          className={'h-11 w-11 shrink-0 rounded object-cover border border-border/40'}
                        />

                        <div className={'flex min-w-0 flex-1 flex-col'}>
                          <p className={'truncate font-medium text-foreground'} title={file.name}>
                            {file.name}
                          </p>
                          <span className={'text-muted-foreground'}>
                            {formatBytes(file.size)}
                          </span>
                        </div>

                        <Button
                          type={'button'}
                          variant={'ghost'}
                          size={'icon'}
                          className={'h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive'}
                          disabled={isPending}
                          onClick={(e: { stopPropagation: () => void; }) => {
                            e.stopPropagation();
                            handleRemoveFile(idx);
                          }}
                          aria-label={`Xóa ảnh ${file.name}`}
                        >
                          <X className={'h-4 w-4'} />
                        </Button>
                      </li>
                    ))}
                  </ul>
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
                  disabled={isPending || files.length === 0}
                  className={'gap-1.5'}
                >
                  {isPending ? (
                    <>
                      <Loader2 className={'h-4 w-4 animate-spin'} />
                      <span>Đang tải lên...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className={'h-4 w-4'} />
                      <span>
                        {files.length > 1
                          ? `Tải lên ${files.length} ảnh`
                          : 'Tải ảnh lên'}
                      </span>
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
