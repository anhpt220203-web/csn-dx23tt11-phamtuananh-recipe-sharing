import { AppLogo } from '~/components/app-logo';
import { HeaderSearchForm } from '~/components/recipes/header-search-form';

import { SiteHeaderAccountSection } from './site-header-account-section';
import { MobileNavigation, SiteNavigation } from './site-navigation';

export function SiteHeader() {
  return (
    <div className={'sticky top-0 z-40 w-full'}>
      <header
        className={
          'site-header w-full border-b border-border/50 bg-background/85 shadow-xs backdrop-blur-md transition-all supports-[backdrop-filter]:bg-background/70'
        }
      >
        <div
          className={
            'container mx-auto flex h-16 items-center justify-between gap-4 px-4 sm:px-6'
          }
        >
          {/* Trái: Menu hamburger cho mobile + App Logo */}
          <div className={'flex items-center gap-2.5 sm:gap-4'}>
            <div className={'md:hidden'}>
              <MobileNavigation />
            </div>
            <AppLogo />
          </div>

          {/* Giữa: Menu điều hướng desktop */}
          <div className={'hidden items-center justify-center md:flex'}>
            <SiteNavigation />
          </div>

          {/* Phải: Tìm kiếm + Yêu thích + Đăng nhập / Tài khoản */}
          <div className={'flex items-center justify-end gap-2 sm:gap-3'}>
            <HeaderSearchForm
              className={'hidden w-40 md:flex lg:w-56 xl:w-64'}
            />
            <SiteHeaderAccountSection />
          </div>
        </div>
      </header>

      {/* Ô tìm kiếm full-width cho mobile để không vỡ layout header */}
      <div
        className={
          'border-b border-border/40 bg-background/95 px-4 py-2 backdrop-blur-md md:hidden'
        }
      >
        <div className={'container mx-auto'}>
          <HeaderSearchForm />
        </div>
      </div>
    </div>
  );
}
