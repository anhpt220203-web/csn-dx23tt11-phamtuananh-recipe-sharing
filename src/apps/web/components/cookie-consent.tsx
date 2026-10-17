'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';

import { Cookie } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { cn } from '@kit/ui/utils';

const STORAGE_KEY = 'cookie-consent';

/**
 * Banner xin phép dùng cookie, hiện ở cuối trang khi user chưa lựa chọn.
 * Lựa chọn được lưu vào localStorage nên không hiện lại sau khi đã chọn.
 */
export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);

      if (!saved) {
        setVisible(true);
      }
    } catch {
      // localStorage không khả dụng (chế độ ẩn danh chặn) thì vẫn hiện banner
      setVisible(true);
    }
  }, []);

  const choose = (value: 'accepted' | 'declined') => {
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // bỏ qua lỗi ghi localStorage
    }

    setVisible(false);
  };

  if (!visible) {
    return null;
  }

  return (
    <div
      role={'dialog'}
      aria-live={'polite'}
      aria-label={'Thông báo về cookie'}
      className={cn(
        'fixed inset-x-0 bottom-0 z-50',
        'border-t bg-background/95 shadow-lg backdrop-blur',
        'animate-in slide-in-from-bottom duration-300',
      )}
    >
      <div
        className={
          'container mx-auto flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between'
        }
      >
        <div className={'flex items-start gap-3'}>
          <Cookie
            className={'text-muted-foreground mt-0.5 h-5 w-5 shrink-0'}
            aria-hidden={true}
          />

          <p className={'text-sm leading-relaxed'}>
            Chúng tôi sử dụng cookie để duy trì đăng nhập, ghi nhớ giao diện
            và cải thiện trải nghiệm của bạn. Xem thêm tại{' '}
            <Link
              href={'/cookie-policy'}
              className={'font-medium underline underline-offset-4'}
            >
              Chính sách cookie
            </Link>
            .
          </p>
        </div>

        <div className={'flex shrink-0 gap-2'}>
          <Button
            variant={'outline'}
            size={'sm'}
            onClick={() => choose('declined')}
          >
            Từ chối
          </Button>

          <Button size={'sm'} onClick={() => choose('accepted')}>
            Đồng ý
          </Button>
        </div>
      </div>
    </div>
  );
}
