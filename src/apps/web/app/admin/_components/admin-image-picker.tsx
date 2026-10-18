'use client';

import { useRef, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@kit/ui/button';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';

import { MediaUploadDialog } from '../media/_components/media-upload-dialog';
import { sanitizePreviewUrl } from '../_lib/sanitize-preview-url';

export { sanitizePreviewUrl };

type AdminImagePickerProps = {
  /** Tên field cho ô dán URL ảnh trực tiếp. */
  urlName: string;
  /** Tên field cho input tải file ảnh lên. */
  fileName: string;
  /** Tên field hidden chứa URL ảnh đang lưu (form sửa). */
  existingName: string;
  /** URL ảnh hiện có (khi sửa). */
  defaultUrl?: string | null;
  /** Nhãn hiển thị phía trên. */
  label?: string;
  /** Gợi ý hiển thị dưới các ô nhập. */
  hint?: string;
  /** id duy nhất để phân biệt các picker trên cùng trang (modal sửa). */
  idPrefix?: string;
  /** Thư mục kho media để hiện nút "Tải ảnh vào kho". */
  mediaFolder?: 'recipes' | 'categories' | 'tips' | 'banners' | 'uploads';
};

export function AdminImagePicker({
  urlName,
  fileName,
  existingName,
  defaultUrl,
  label = 'Ảnh đại diện',
  hint = 'Dán link ảnh trực tiếp, hoặc tải file lên (JPG/PNG/WEBP/GIF, tối đa 5MB).',
  idPrefix,
  mediaFolder,
}: AdminImagePickerProps) {
  const [urlText, setUrlText] = useState(defaultUrl ?? '');
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [existingCleared, setExistingCleared] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // File upload ưu tiên hơn URL dán tay; xem trước file nếu có.
  const rawPreview =
    objectUrl ?? (urlText.trim().length > 0 ? urlText.trim() : null);
  const preview = sanitizePreviewUrl(rawPreview);

  const handleFileChange = (file: File | undefined) => {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }

    if (!file) {
      setObjectUrl(null);
      return;
    }

    setObjectUrl(URL.createObjectURL(file));
  };

  const clearAll = () => {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }

    setObjectUrl(null);
    setUrlText('');
    setExistingCleared(true);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const urlId = idPrefix ? `${idPrefix}-url` : 'image-url';
  const fileId = idPrefix ? `${idPrefix}-file` : 'image-file';

  return (
    <div className={'grid gap-1.5'}>
      <div className={'flex items-center justify-between'}>
        <Label htmlFor={urlId}>{label}</Label>

        {mediaFolder && (
          <MediaUploadDialog
            defaultFolder={mediaFolder}
            buttonLabel={'Tải ảnh vào kho'}
            buttonVariant={'outline'}
            size={'sm'}
            className={'h-6 text-xs px-2 text-primary hover:text-primary'}
            onUploaded={(items) => {
              if (items && items.length > 0) {
                const first = items[0]!;
                if (objectUrl) {
                  URL.revokeObjectURL(objectUrl);
                  setObjectUrl(null);
                }
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
                setUrlText(first.proxyUrl);
                setExistingCleared(false);
                toast.success(`Đã tự động chọn ảnh "${first.name}"!`);
              }
            }}
          />
        )}
      </div>

      <input
        type={'hidden'}
        name={existingName}
        value={existingCleared ? '' : (defaultUrl ?? '')}
      />

      <Input
        id={urlId}
        name={urlName}
        type={'url'}
        maxLength={500}
        value={urlText}
        onChange={(event) => setUrlText(event.target.value)}
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
        id={fileId}
        name={fileName}
        ref={fileInputRef}
        type={'file'}
        accept={'image/jpeg,image/png,image/webp,image/gif'}
        onChange={(event) => handleFileChange(event.target.files?.[0])}
      />

      <p className={'text-muted-foreground text-xs'}>{hint}</p>

      {preview && (
        <div className={'mt-2 flex flex-col items-start gap-2'}>
          <div
            className={
              'relative overflow-hidden rounded-lg border bg-muted shadow-sm'
            }
          >
            {/* lgtm[js/dom-text-reinterpreted-as-html] */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt={''}
              aria-hidden={'true'}
              className={'h-44 w-auto max-w-full rounded-md object-cover'}
            />
          </div>

          <Button
            type={'button'}
            variant={'outline'}
            size={'sm'}
            onClick={clearAll}
            className={'text-xs text-destructive hover:text-destructive'}
          >
            Xóa ảnh đại diện
          </Button>
        </div>
      )}
    </div>
  );
}
