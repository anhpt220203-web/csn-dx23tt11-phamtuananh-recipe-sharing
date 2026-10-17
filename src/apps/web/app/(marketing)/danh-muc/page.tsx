import type { Metadata } from 'next';
import Link from 'next/link';
import { connection } from 'next/server';

import { Badge } from '@kit/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';

import { getCategoriesByDimension, getTags } from '~/lib/recipes/queries';

import { SitePageHeader } from '../_components/site-page-header';

export const metadata: Metadata = {
  title: 'Danh mục món ăn',
  description:
    'Khám phá món ăn theo nhiều chiều: nhóm món, nguyên liệu chính, phương pháp chế biến, bữa ăn, phong cách ẩm thực.',
};

/** Nhãn hiển thị cho từng chiều danh mục. */
const DIMENSION_LABELS: Record<string, string> = {
  'nhom-mon': 'Nhóm món',
  'nguyen-lieu-chinh': 'Nguyên liệu chính',
  'phuong-phap-che-bien': 'Phương pháp chế biến',
  'bua-an': 'Bữa ăn',
  'phong-cach-am-thuc': 'Phong cách ẩm thực',
};

const DIMENSION_ORDER = [
  'nhom-mon',
  'nguyen-lieu-chinh',
  'phuong-phap-che-bien',
  'bua-an',
  'phong-cach-am-thuc',
];

export default async function CategoriesPage() {
  // Trang đọc dữ liệu mới mỗi request (DB Supabase), không prerender lúc build.
  await connection();

  const [grouped, tags] = await Promise.all([
    getCategoriesByDimension(),
    getTags(),
  ]);

  const dimensions = DIMENSION_ORDER.filter(
    (dim) => (grouped[dim]?.length ?? 0) > 0,
  );

  // 4 thẻ điều hướng chiều (trừ nhóm món mặc định), kiểu Knorr.
  const navDimensions = dimensions.filter((dim) => dim !== 'nhom-mon');

  return (
    <div>
      <SitePageHeader
        title={'Danh mục món ăn'}
        subtitle={
          'Khám phá công thức theo nhiều chiều: nhóm món, nguyên liệu, cách nấu, bữa ăn, phong cách ẩm thực.'
        }
      />

      <div className={'container mx-auto py-8'}>
        {/* ── Card điều hướng theo chiều ─────────────────── */}
        {navDimensions.length > 0 ? (
          <section aria-label={'Khám phá theo chiều'} className={'mb-10'}>
            <h2 className={'mb-4 text-xl font-bold tracking-tight'}>
              Khám phá theo chủ đề
            </h2>

            <div className={'grid grid-cols-2 gap-4 lg:grid-cols-4'}>
              {navDimensions.map((dim) => (
                <Link
                  key={dim}
                  href={`#chieu-${dim}`}
                  className={'block h-full'}
                >
                  <Card
                    className={
                      'h-full bg-primary/5 transition-shadow hover:shadow-md'
                    }
                  >
                    <CardHeader>
                      <CardTitle className={'text-lg'}>
                        {DIMENSION_LABELS[dim] ?? dim}
                      </CardTitle>
                    </CardHeader>

                    <CardContent>
                      <CardDescription>
                        {grouped[dim]?.length ?? 0} nhóm · Xem ngay
                      </CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {/* ── Tag chủ đề "Tìm món" ───────────────────────── */}
        {tags.length > 0 ? (
          <section aria-label={'Tìm món theo chủ đề'} className={'mb-10'}>
            <h2 className={'mb-4 text-xl font-bold tracking-tight'}>Tìm món</h2>

            <div className={'flex flex-wrap gap-2'}>
              {tags.map((tag) => (
                <Link key={tag.slug} href={`/tag/${tag.slug}`}>
                  <Badge
                    variant={'outline'}
                    className={'cursor-pointer px-4 py-2 text-sm hover:bg-primary hover:text-primary-foreground'}
                  >
                    {tag.name}
                  </Badge>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {/* ── Danh mục theo từng chiều ───────────────────── */}
        {dimensions.length === 0 ? (
          <p className={'text-muted-foreground'}>
            Chưa có danh mục nào. Vui lòng quay lại sau.
          </p>
        ) : (
          <div className={'flex flex-col gap-10'}>
            {dimensions.map((dim) => (
              <section key={dim} id={`chieu-${dim}`} aria-label={DIMENSION_LABELS[dim]}>
                <h2 className={'mb-4 text-xl font-bold tracking-tight'}>
                  {DIMENSION_LABELS[dim] ?? dim}
                </h2>

                <div
                  className={'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'}
                >
                  {(grouped[dim] ?? []).map((category) => (
                    <Link
                      key={category.slug}
                      href={`/danh-muc/${category.slug}`}
                      className={'block h-full'}
                    >
                      <Card className={'h-full transition-shadow hover:shadow-md'}>
                        <CardHeader>
                          <CardTitle>{category.name}</CardTitle>
                        </CardHeader>

                        <CardContent>
                          <CardDescription>
                            {category.description ||
                              'Xem các công thức trong nhóm này.'}
                          </CardDescription>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
