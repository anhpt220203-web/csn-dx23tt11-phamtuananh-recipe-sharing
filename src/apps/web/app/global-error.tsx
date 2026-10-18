'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, UtensilsCrossed } from 'lucide-react';

import { Button } from '@kit/ui/button';

const GlobalErrorPage = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  useEffect(() => {
    console.error('Lỗi toàn cục ứng dụng:', error);

    // Nếu là lỗi ChunkLoadError (do asset bị đổi hash sau khi rebuild),
    // tự động reload trang sau 1.5 giây để nạp lại bundle mới nhất.
    if (
      error?.name === 'ChunkLoadError' ||
      error?.message?.includes('Loading chunk') ||
      error?.message?.includes('ChunkLoadError')
    ) {
      const timer = setTimeout(() => {
        window.location.reload();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const isChunkError =
    error?.name === 'ChunkLoadError' ||
    error?.message?.includes('Loading chunk') ||
    error?.message?.includes('ChunkLoadError');

  return (
    <html lang="vi">
      <body className="min-h-screen bg-background font-sans antialiased text-foreground">
        <div className="flex min-h-screen flex-col">
          {/* Header tối giản độc lập không phụ thuộc vào Auth hay QueryClient context */}
          <header className="border-b border-border/40 bg-background/95 px-6 py-4">
            <div className="mx-auto flex max-w-7xl items-center justify-between">
              <Link
                href="/"
                className="flex items-center gap-2 font-bold text-lg text-primary"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <UtensilsCrossed className="h-5 w-5" />
                </div>
                <span>Công Thức Việt</span>
              </Link>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
                className="gap-1.5 text-xs"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Tải lại trang</span>
              </Button>
            </div>
          </header>

          <main className="container mx-auto flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
            <div className="flex max-w-md flex-col items-center space-y-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <UtensilsCrossed className="h-8 w-8" />
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  {isChunkError
                    ? 'Đang cập nhật phiên bản mới...'
                    : 'Đã xảy ra lỗi không mong muốn'}
                </h1>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  {isChunkError
                    ? 'Một số tài nguyên vừa được làm mới trên máy chủ. Trang sẽ tự động tải lại trong giây lát, hoặc bạn có thể bấm nút bên dưới.'
                    : 'Hệ thống đã ghi nhận sự cố. Vui lòng thử tải lại trang hoặc quay về trang chủ.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 w-full pt-2">
                <Button
                  type="button"
                  variant="default"
                  onClick={() => window.location.reload()}
                  className="gap-1.5 min-w-32"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Tải lại trang</span>
                </Button>

                <Button
                  nativeButton={false}
                  type="button"
                  variant="outline"
                  render={
                    <Link href="/">
                      <ArrowLeft className="mr-1.5 h-4 w-4" />
                      <span>Về trang chủ</span>
                    </Link>
                  }
                />
              </div>

              {process.env.NODE_ENV !== 'production' && error?.message && (
                <div className="w-full text-left rounded-lg border bg-muted/50 p-3 text-xs font-mono text-muted-foreground overflow-x-auto">
                  <p className="font-semibold text-foreground mb-1">Chi tiết lỗi (Dev mode):</p>
                  <p className="break-all">{error.message}</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
};

export default GlobalErrorPage;
