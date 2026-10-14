import Link from 'next/link';

import { ArrowRight, ChevronDown } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';

import { SitePageHeader } from '~/(marketing)/_components/site-page-header';

export const generateMetadata = async () => {
  const t = await getTranslations();

  return {
    title: t('marketing.faq'),
  };
};

async function FAQPage() {
  const t = await getTranslations();

  // Hỏi đáp về website chia sẻ công thức nấu ăn
  const faqItems = [
    {
      question: `Công Thức Việt là gì?`,
      answer: `Công Thức Việt là website chia sẻ công thức nấu ăn Việt Nam: bạn có thể tìm kiếm, xem chi tiết nguyên liệu và các bước thực hiện, lưu món yêu thích và đánh giá các món đã thử.`,
    },
    {
      question: `Tôi có cần tài khoản để xem công thức không?`,
      answer: `Không. Mọi công thức, danh mục và chức năng tìm kiếm đều xem được mà không cần đăng nhập. Bạn chỉ cần tài khoản khi muốn lưu món yêu thích hoặc đánh giá món ăn.`,
    },
    {
      question: `Làm sao để lưu một món vào danh sách yêu thích?`,
      answer: `Đăng nhập, mở trang chi tiết của món ăn và nhấn nút hình trái tim "Yêu thích". Danh sách các món đã lưu nằm ở trang "Món yêu thích của tôi".`,
    },
    {
      question: `Tôi có thể đánh giá một công thức không?`,
      answer: `Có. Sau khi đăng nhập, bạn có thể chấm từ 1 đến 5 sao ngay trên trang chi tiết công thức. Điểm trung bình và số lượt đánh giá được hiển thị cho mọi người cùng tham khảo.`,
    },
    {
      question: `Thông tin nguyên liệu và các bước có chính xác không?`,
      answer: `Các công thức được biên soạn kèm định lượng nguyên liệu, thời gian nấu và độ khó. Nếu phát hiện sai sót, bạn có thể góp ý để đội ngũ kiểm tra và cập nhật.`,
    },
    {
      question: `Ảnh món ăn trên website lấy từ đâu?`,
      answer: `Ảnh minh họa được sử dụng theo giấy phép mở (Creative Commons); nguồn và tác giả của từng ảnh được ghi rõ ở cuối mỗi trang công thức.`,
    },
  ];

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => {
      return {
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      };
    }),
  };

  return (
    <>
      <script
        key={'ld:json'}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className={'flex flex-col space-y-4 xl:space-y-8'}>
        <SitePageHeader
          title={t('marketing.faq')}
          subtitle={t('marketing.faqSubtitle')}
        />

        <div className={'container flex flex-col space-y-8 pb-16'}>
          <div className="flex w-full max-w-xl flex-col">
            {faqItems.map((item, index) => {
              return <FaqItem key={index} item={item} />;
            })}
          </div>

          <div>
            <Button
              nativeButton={false}
              render={<Link href={'/contact'} />}
              variant={'outline'}
            >
              <span>
                <Trans i18nKey={'marketing.contactFaq'} />
              </span>

              <ArrowRight className={'ml-2 w-4'} />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default FAQPage;

function FaqItem({
  item,
}: React.PropsWithChildren<{
  item: {
    question: string;
    answer: string;
  };
}>) {
  return (
    <details className={'group border-b px-2 py-4 last:border-b-transparent'}>
      <summary
        className={
          'flex items-center justify-between hover:cursor-pointer hover:underline'
        }
      >
        <h2
          className={
            'hover:underline-none cursor-pointer font-sans font-medium'
          }
        >
          <Trans i18nKey={item.question} defaults={item.question} />
        </h2>

        <div>
          <ChevronDown
            className={'h-5 transition duration-300 group-open:-rotate-180'}
          />
        </div>
      </summary>

      <div className={'text-muted-foreground flex flex-col space-y-2 py-1'}>
        <Trans i18nKey={item.answer} defaults={item.answer} />
      </div>
    </details>
  );
}
