import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@kit/ui/breadcrumb';

import { getTipBySlug } from '~/lib/content/queries';

type TipPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: TipPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tip = await getTipBySlug(slug);

  if (!tip) {
    return { title: 'Không tìm thấy bài viết' };
  }

  return {
    title: tip.title,
    description: tip.excerpt || tip.title,
  };
}

export default async function TipDetailPage({ params }: TipPageProps) {
  const { slug } = await params;
  const tip = await getTipBySlug(slug);

  if (!tip) {
    notFound();
  }

  return (
    <div className={'container mx-auto max-w-3xl py-6 md:py-10'}>
      <Breadcrumb aria-label={'Điều hướng'}>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href={'/'} />}>
              Trang chủ
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href={'/meo-vat'} />}>
              Mẹo vặt
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <BreadcrumbPage>{tip.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <article className={'mt-6'}>
        <h1
          className={
            'text-3xl font-bold tracking-tight md:text-4xl'
          }
        >
          {tip.title}
        </h1>

        {tip.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={tip.image_url}
            alt={tip.title}
            className={'mt-6 aspect-[16/9] w-full rounded-xl object-cover'}
          />
        ) : null}

        {tip.excerpt ? (
          <p
            className={
              'text-muted-foreground mt-6 text-lg leading-relaxed font-medium'
            }
          >
            {tip.excerpt}
          </p>
        ) : null}

        <div
          className={
            'prose dark:prose-invert mt-6 max-w-none leading-relaxed whitespace-pre-wrap'
          }
        >
          {tip.content}
        </div>
      </article>
    </div>
  );
}
