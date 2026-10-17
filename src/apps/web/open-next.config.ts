import { defineCloudflareConfig } from '@opennextjs/cloudflare';

/**
 * Cấu hình OpenNext cho Cloudflare Workers.
 *
 * Mặc định dùng cache trong bộ nhớ của Worker cho ISR / `use cache`.
 * Nếu cần cache bền vững giữa các lần restart isolate (ví dụ trang ISR
 * revalidate thường xuyên), tạo một R2 bucket rồi bật incremental cache:
 *
 *   import { r2IncrementalCache } from '@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache';
 *   import { withRegionalCache } from '@opennextjs/cloudflare/overrides/incremental-cache/regional-cache';
 *
 *   export default defineCloudflareConfig({
 *     incrementalCache: withRegionalCache(r2IncrementalCache, { mode: 'long-lived' }),
 *     // + thêm binding R2 trong wrangler.jsonc, ví dụ:
 *     // "r2_buckets": [{ "binding": "NEXT_INC_CACHE_R2_BUCKET", "bucket_name": "cong-thuc-viet-cache" }]
 *   });
 *
 * Tối ưu ảnh (next/image): adapter hỗ trợ qua Cloudflare Images (dịch vụ
 * trả phí của Cloudflare). Không cấu hình gì thêm thì ảnh được phục vụ
 * nguyên bản (không resize/format tự động như trên Vercel).
 */
export default defineCloudflareConfig();
