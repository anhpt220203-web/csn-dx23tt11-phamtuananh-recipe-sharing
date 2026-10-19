/**
 * Làm sạch và chuẩn hóa URL ảnh trước khi gán vào thẻ <img src="...">.
 * Chặn các scheme độc hại như javascript:, vbscript:, data:...
 * Chỉ cho phép http:, https:, blob:, hoặc đường dẫn tương đối bắt đầu bằng '/'.
 */
export function sanitizePreviewUrl(
  url: string | null | undefined,
): string | null {
  if (!url) {
    return null;
  }

  const trimmed = url.trim();

  if (trimmed.length === 0 || trimmed.length > 2048) {
    return null;
  }

  // Chặn ký tự điều khiển và các meta-char nguy hiểm trong ngữ cảnh thuộc tính URL.
  if (/[\u0000-\u001F\u007F<>"'`]/.test(trimmed)) {
    return null;
  }

  if (trimmed.startsWith('blob:')) {
    try {
      const parsedBlob = new URL(trimmed);
      return parsedBlob.protocol === 'blob:' ? parsedBlob.href : null;
    } catch {
      return null;
    }
  }

  try {
    const parsed = new URL(trimmed);

    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return encodeURI(parsed.href);
    }

    return null;
  } catch {
    if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
      return encodeURI(trimmed);
    }

    return null;
  }
}
