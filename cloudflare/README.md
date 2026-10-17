# Deploy web app lên Cloudflare Workers

Tài liệu này hướng dẫn đưa app Next.js (`src/apps/web`) lên **Cloudflare Workers**
bằng adapter chính thức **`@opennextjs/cloudflare`** (đang được maintain, hỗ trợ
đầy đủ Next.js 16: App Router, Server Actions, Middleware, ISR, `use cache`).

> **Phạm vi:** chỉ thêm cấu hình + tài liệu. KHÔNG deploy thật trong repo này
> (cần tài khoản Cloudflare của bạn). Đường deploy **Vercel** và **Docker** hiện có
> không bị ảnh hưởng — mọi thay đổi đều cộng thêm, tách biệt.

## 1. File cấu hình đã thêm

| File | Vai trò |
|---|---|
| `src/apps/web/wrangler.jsonc` | Cấu hình Worker: entry `.open-next/worker.js`, `compatibility_flags: ["nodejs_compat"]`, static assets, biến môi trường không nhạy cảm |
| `src/apps/web/open-next.config.ts` | Cấu hình adapter OpenNext (mặc định; có ghi chú cách bật cache R2 bền vững cho ISR) |
| `src/apps/web/public/_headers` | Cache dài hạn cho `_next/static/*` |
| `src/apps/web/.dev.vars.example` | Mẫu biến môi trường khi chạy thử local bằng `wrangler dev` |
| `src/apps/web/package.json` | Thêm scripts `preview`, `deploy`, `upload`, `cf-typegen`; thêm deps `@opennextjs/cloudflare`, `wrangler` (qua catalog của `src/pnpm-workspace.yaml`) |

Các file build trung gian (`.open-next/`, `.dev.vars`, `.wrangler/`,
`cloudflare-env.d.ts`) đã được thêm vào `.gitignore` ở repo root.

## 2. Chuẩn bị một lần (máy của bạn)

```bash
cd src
pnpm install
```

Tạo tài khoản Cloudflare (miễn phí) và đăng nhập Wrangler:

```bash
cd src/apps/web
pnpm dlx wrangler login
```

## 3. Cấu hình biến môi trường / secrets

Nguyên tắc: **không hardcode, không commit secret vào repo.**

- `NEXT_PUBLIC_*` (ví dụ `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`): Next.js **nội tuyến giá trị vào JS lúc build**,
  nên phải có sẵn **khi chạy lệnh build**, đồng thời khai báo cho Worker lúc chạy.
- `SUPABASE_SERVICE_ROLE_KEY`: chỉ dùng phía server → **secret**, không bao giờ
  để lộ ra client hay commit.

```bash
cd src/apps/web

# Biến thường (runtime + build đọc được)
pnpm dlx wrangler secret list            # kiểm tra secret đã có
echo "https://xyzcompany.supabase.co" | pnpm dlx wrangler secret put NEXT_PUBLIC_SUPABASE_URL
# ... hoặc khai báo nhanh qua dashboard: Workers & Pages > worker > Settings > Variables

# Secret nhạy cảm (mã hoá, không hiện trong dashboard)
echo "<service_role_key>" | pnpm dlx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
```

Cách đơn giản nhất: vào **Cloudflare Dashboard → Workers & Pages → chọn worker
`cong-thuc-viet` → Settings → Variables**, thêm `NEXT_PUBLIC_*` ở mục
*Variables* và `SUPABASE_SERVICE_ROLE_KEY` ở mục *Secrets*. Khi deploy bằng
`wrangler deploy` từ máy, Wrangler cũng đọc các biến đã lưu trên dashboard.

Chạy thử local bằng Workers runtime:

```bash
cd src/apps/web
cp .dev.vars.example .dev.vars   # điền giá trị thật, file này đã gitignore
pnpm preview                      # build + chạy local bằng workerd
```

## 4. Lệnh build & deploy

```bash
cd src/apps/web

pnpm preview    # build bằng OpenNext + chạy thử local (workerd)
pnpm deploy     # build + deploy lên Cloudflare Workers (production)
pnpm upload     # build + upload phiên bản mới (không promote ngay)
pnpm cf-typegen # sinh types cho biến môi trường Cloudflare (cloudflare-env.d.ts)
```

`pnpm deploy` sẽ tự chạy `next build` (qua script `build` có sẵn), biến đổi
output bằng OpenNext rồi đẩy Worker + static assets lên Cloudflare.

## 5. Lưu ý khác biệt so với Vercel

| Chủ đề | Vercel | Cloudflare Workers (OpenNext) |
|---|---|---|
| Runtime | Node.js đầy đủ | Workers runtime + `nodejs_compat` (đã bật trong `wrangler.jsonc`) |
| `next/image` tối ưu ảnh | Tự động (mặc định) | Chỉ qua **Cloudflare Images** (dịch vụ trả phí). Không cấu hình thì ảnh được phục vụ nguyên bản — `next/image` vẫn hoạt động (lazy-load, chống CLS) nhưng không resize/đổi format tự động |
| ISR / `use cache` | Hỗ trợ đầy đủ | Hỗ trợ; cache mặc định nằm trong bộ nhớ Worker. Muốn cache bền vững qua restart thì gắn R2 bucket (xem ghi chú trong `open-next.config.ts`) |
| `revalidateTag` / `revalidatePath` | Hoạt động | Hoạt động trong giới hạn cache của adapter; nội dung đổi ở deploy mới luôn an toàn |
| Middleware (`proxy.ts`) | Hỗ trợ | Hỗ trợ (chạy trên Node.js runtime của adapter). **Node.js middleware** (Next 15.2+) chưa hỗ trợ — app này không dùng |
| `export const runtime = 'edge'` | Hỗ trợ | **Không hỗ trợ** — app này không dùng edge runtime nên không cần sửa gì |
| Giới hạn kích thước Worker | Không giới hạn tương tự | Gói Free: **3 MiB** (nén), gói Paid: 10 MiB. Sau build, `wrangler` in ra dung lượng — nếu vượt, cần giảm bundle hoặc nâng gói |
| Env `NEXT_PUBLIC_*` | Set trên dashboard là đủ | Phải có **cả lúc build** (nội tuyến) **và** lúc runtime (vars/secrets) |
| Build | `next build` (Turbopack) | `opennextjs-cloudflare build` → chạy `next build` rồi biến đổi output |

## 6. Supabase trên Workers

- `@supabase/supabase-js` chạy được trên Workers runtime nhờ `nodejs_compat`
  (dùng `fetch`/Web Crypto có sẵn, không cần polyfill thêm).
- Kết nối tới Supabase cloud qua HTTPS/PostgREST như bình thường — không cần đổi
  code, chỉ cần cấu hình đúng env/secrets như mục 3.
- Auth (cookie/session) hoạt động bình thường vì chạy trên Node.js runtime của
  adapter, không bị giới hạn của Edge runtime.

## 7. Không ảnh hưởng Vercel / Docker

- `next.config.mjs` chỉ thêm `initOpenNextCloudflareForDev()` — hàm này **chỉ tác
  dụng khi chạy `next dev`** (nạp Cloudflare runtime context cho dev local),
  `next build` trên Vercel/Docker không bị ảnh hưởng.
- Script `build` gốc giữ nguyên; các script Cloudflare (`preview`/`deploy`/
  `upload`/`cf-typegen`) là script mới, không ghi đè.
- `vercel.json` và `docker/` không bị đụng tới.

## 8. Xử lý sự cố

| Lỗi | Cách xử lý |
|---|---|
| `Script size exceeds limit` | Nâng lên Workers Paid plan, hoặc giảm bundle |
| `Cannot find module 'fs'` (lúc build) | Thư viện dùng API chỉ có trên Node — tìm alternative dùng Fetch, hoặc dynamic import có fallback |
| Env thiếu lúc runtime | Kiểm tra `wrangler secret list`; nhớ `NEXT_PUBLIC_*` phải có **cả lúc build** |
| Build OpenNext lỗi | `rm -rf .next .open-next` rồi build lại; kiểm tra code không dùng API Node |
