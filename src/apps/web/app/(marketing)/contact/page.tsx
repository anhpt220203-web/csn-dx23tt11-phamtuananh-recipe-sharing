import { Mail, MapPin, Clock } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';

import { SitePageHeader } from '~/(marketing)/_components/site-page-header';

export const generateMetadata = async () => {
  const t = await getTranslations();

  return {
    title: t('marketing.contact'),
  };
};

const CONTACT_ITEMS = [
  {
    icon: Mail,
    title: 'Email',
    description: 'Gửi góp ý, báo lỗi hoặc đề xuất công thức mới cho chúng tôi.',
    value: 'lienhe@congthucmonngon.vn',
  },
  {
    icon: MapPin,
    title: 'Địa chỉ',
    description: 'Trường Đại học Trà Vinh — Đồ án học phần của sinh viên.',
    value: 'Trà Vinh, Việt Nam',
  },
  {
    icon: Clock,
    title: 'Thời gian phản hồi',
    description: 'Chúng tôi cố gắng trả lời mọi liên hệ trong thời gian sớm nhất.',
    value: 'Trong vòng 48 giờ',
  },
] as const;

async function ContactPage() {
  const t = await getTranslations();

  return (
    <div className={'flex flex-col'}>
      <SitePageHeader
        title={t('marketing.contact')}
        subtitle={t('marketing.contactDescription')}
      />

      <div className={'container mx-auto px-4 py-10 sm:py-14'}>
        <div className={'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'}>
          {CONTACT_ITEMS.map((item) => (
            <Card key={item.title} className={'h-full'}>
              <CardHeader>
                <span
                  className={
                    'bg-primary/10 text-primary inline-flex h-10 w-10 items-center justify-center rounded-lg'
                  }
                >
                  <item.icon className={'h-5 w-5'} aria-hidden={true} />
                </span>

                <CardTitle className={'mt-3 text-lg'}>{item.title}</CardTitle>
              </CardHeader>

              <CardContent className={'space-y-2'}>
                <p className={'text-muted-foreground text-sm'}>
                  {item.description}
                </p>

                <p className={'font-medium'}>{item.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ContactPage;
