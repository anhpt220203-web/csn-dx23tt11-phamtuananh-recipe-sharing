import type { NextRequest } from 'next/server';

/**
 * Proxy phục vụ ảnh từ Supabase Storage qua cùng origin:
 *
 *   GET /api/image/<bucket>/<duong-dan-object>
 *
 * Trình duyệt chỉ thấy URL `/api/image/...` — không lộ host gốc của Storage
 * (server mới fetch thật bằng SUPABASE_URL phía server). Chỉ cho phép bucket
 * trong danh sách dưới để tránh bị dùng làm open proxy.
 */
const ALLOWED_BUCKETS = new Set(['recipe-images']);

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;

  const [bucket, ...objectSegments] = path ?? [];

  if (
    !bucket ||
    !ALLOWED_BUCKETS.has(bucket) ||
    objectSegments.length === 0 ||
    objectSegments.some((segment) => segment === '.' || segment === '..')
  ) {
    return new Response('Không tìm thấy ảnh', { status: 404 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    return new Response('Server chưa cấu hình Supabase', { status: 500 });
  }

  const storageUrl = `${supabaseUrl.replace(/\/+$/, '')}/storage/v1/object/public/${bucket}/${objectSegments.join('/')}`;

  let upstream: Response;

  try {
    upstream = await fetch(storageUrl, { cache: 'no-store' });
  } catch {
    return new Response('Không tải được ảnh từ storage', { status: 502 });
  }

  if (!upstream.ok || !upstream.body) {
    // Storage trả 400 ("InvalidKey") cho object không tồn tại — chuẩn hoá thành 404.
    return new Response('Không tìm thấy ảnh', {
      status: upstream.status === 400 ? 404 : upstream.status,
    });
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      'Content-Type':
        upstream.headers.get('content-type') ?? 'application/octet-stream',
      'Content-Length': upstream.headers.get('content-length') ?? '',
      // Ảnh seed tĩnh — cache mạnh phía trình duyệt/CDN.
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
    },
  });
}
