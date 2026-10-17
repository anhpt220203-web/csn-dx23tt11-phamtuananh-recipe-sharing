import { Header } from '@kit/ui/marketing';

import { AppLogo } from '~/components/app-logo';
import { HeaderSearchForm } from '~/components/recipes/header-search-form';

import { SiteHeaderAccountSection } from './site-header-account-section';
import { SiteNavigation } from './site-navigation';

export function SiteHeader() {
  return (
    <div className={'sticky top-0 z-10'}>
      <Header
        logo={<AppLogo />}
        navigation={<SiteNavigation />}
        actions={
          <>
            {/* Ô tìm kiếm gọn trên desktop; mobile dùng hàng riêng phía dưới. */}
            <HeaderSearchForm
              className={'hidden w-40 md:flex lg:w-56 xl:w-64'}
            />
            <SiteHeaderAccountSection />
          </>
        }
      />

      {/* Ô tìm kiếm full-width cho mobile để không vỡ layout header. */}
      <div
        className={'bg-background/95 border-b backdrop-blur-lg md:hidden'}
      >
        <div className={'container mx-auto px-4 py-2'}>
          <HeaderSearchForm />
        </div>
      </div>
    </div>
  );
}
