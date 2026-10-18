import type { Metadata } from 'next';
import Link from 'next/link';
import { connection } from 'next/server';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';

import { getPublishedTips } from '~/lib/content/queries';
import { resolveRecipeImageSrc } from '~/lib/recipes/images';

import { SitePageHeader } from '../_components/site-page-header';

export const metadata: Metadata = {
  title: 'Mẹo vặt nấu ăn',
  description: 'Bí quyết, mẹo vặt nấu ăn ngon mỗi ngày.',
};

export const instant = false;

export default async function TipsPage() {
  await connection();
  const tips = await getPublishedTips(50);

  return (
    <div>
      <SitePageHeader
        title={'Mẹo vặt nấu ăn'}
        subtitle={'Bí quyết, mẹo vặt giúp bạn nấu ăn ngon mỗi ngày.'}
      />

      <div className={'container mx-auto py-8'}>
        {tips.length === 0 ? (
          <p className={'text-muted-foreground'}>
            Chưa có bài viết nào. Vui lòng quay lại sau.
          </p>
        ) : (
          <div className={'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'}>
            {tips.map((tip) => (
              <Link
                key={tip.slug}
                href={`/meo-vat/${tip.slug}`}
                className={'block h-full'}
              >
                <Card className={'h-full transition-shadow hover:shadow-md'}>
                  {tip.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={resolveRecipeImageSrc(tip.image_url) ?? tip.image_url}
                      alt={tip.title}
                      loading={'lazy'}
                      className={'aspect-[16/9] w-full rounded-t-xl object-cover'}
                    />
                  ) : null}

                  <CardHeader>
                    <CardTitle className={'text-lg leading-snug'}>
                      {tip.title}
                    </CardTitle>
                  </CardHeader>

                  {tip.excerpt ? (
                    <CardContent>
                      <CardDescription className={'line-clamp-3'}>
                        {tip.excerpt}
                      </CardDescription>
                    </CardContent>
                  ) : null}
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
