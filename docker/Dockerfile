# syntax=docker/dockerfile:1
#
# Docker image cho đồ án "Công Thức Việt" (Next.js 16, standalone output).
#
# Build từ repo root (build context là repo root):
#   docker build -f docker/Dockerfile -t cong-thuc-viet:demo . \
#     --build-arg NEXT_PUBLIC_SUPABASE_URL=https://xyzcompany.supabase.co \
#     --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi... \
#     --build-arg NEXT_PUBLIC_SITE_URL=http://localhost:3000
#
# Chạy demo:
#   docker run --rm -p 3000:3000 \
#     -e SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi... \
#     cong-thuc-viet:demo
# Mở http://localhost:3000 để xem.
#
# Hoặc dùng docker compose (đọc docker/README.md).

ARG NODE_VERSION=24

# ---------- base ----------
FROM node:${NODE_VERSION}-alpine AS base
RUN apk add --no-cache libc6-compat
ENV PNPM_HOME=/pnpm
ENV PATH="${PNPM_HOME}:${PATH}"
RUN corepack enable && corepack prepare pnpm@11.18.0 --activate
WORKDIR /app

# ---------- install + build ----------
FROM base AS builder
WORKDIR /app

# Copy mã nguồn monorepo (đã loại trừ node_modules/.next qua .dockerignore)
COPY src ./src
WORKDIR /app/src

RUN pnpm install --frozen-lockfile

# Biến build-time: các biến NEXT_PUBLIC_* được nhúng vào bundle lúc build.
# BẮT BUỘC truyền khi build: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY.
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
# NEXT_PUBLIC_CI=true để bỏ qua kiểm tra "production phải dùng https" khi demo local.
ARG NEXT_PUBLIC_CI=true
# OUTPUT_STANDALONE=true để next.config.mjs bật output:'standalone' khi build Docker.
ARG OUTPUT_STANDALONE=true
ARG NEXT_PUBLIC_PRODUCT_NAME=Công Thức Việt
ARG NEXT_PUBLIC_SITE_TITLE=Công Thức Việt - Chia sẻ công thức nấu ăn
ARG NEXT_PUBLIC_SITE_DESCRIPTION=Website quản lý và chia sẻ công thức nấu ăn Việt Nam
ARG NEXT_PUBLIC_DEFAULT_LOCALE=vi
ARG NEXT_PUBLIC_DEFAULT_THEME_MODE=system
ARG NEXT_PUBLIC_THEME_COLOR=#ffffff
ARG NEXT_PUBLIC_THEME_COLOR_DARK=#0a0a0a

ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL} \
  NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY} \
  NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL} \
  NEXT_PUBLIC_CI=${NEXT_PUBLIC_CI} \
  OUTPUT_STANDALONE=${OUTPUT_STANDALONE} \
  NEXT_PUBLIC_PRODUCT_NAME=${NEXT_PUBLIC_PRODUCT_NAME} \
  NEXT_PUBLIC_SITE_TITLE=${NEXT_PUBLIC_SITE_TITLE} \
  NEXT_PUBLIC_SITE_DESCRIPTION=${NEXT_PUBLIC_SITE_DESCRIPTION} \
  NEXT_PUBLIC_DEFAULT_LOCALE=${NEXT_PUBLIC_DEFAULT_LOCALE} \
  NEXT_PUBLIC_DEFAULT_THEME_MODE=${NEXT_PUBLIC_DEFAULT_THEME_MODE} \
  NEXT_PUBLIC_THEME_COLOR=${NEXT_PUBLIC_THEME_COLOR} \
  NEXT_PUBLIC_THEME_COLOR_DARK=${NEXT_PUBLIC_THEME_COLOR_DARK}

RUN pnpm --filter web build

# ---------- runner ----------
FROM node:${NODE_VERSION}-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
  adduser --system --uid 1001 nextjs

# Standalone output của Next.js (giữ cấu trúc apps/web/ của monorepo).
COPY --from=builder --chown=nextjs:nodejs /app/src/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/src/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/src/apps/web/public ./apps/web/public

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Secret lúc chạy container (KHÔNG bake vào image):
#   -e SUPABASE_SERVICE_ROLE_KEY=... (dùng cho Supabase Admin API phía server)
CMD ["node", "apps/web/server.js"]
