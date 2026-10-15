import type { Metadata } from 'next';
import Link from 'next/link';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';

import type { RecipeSchema } from '~/lib/recipes/database';

import { DeleteRecipeButton } from './_components/delete-recipe-button';

export const metadata: Metadata = {
  title: 'Quản lý công thức',
};

const STATUS_FILTERS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'published', label: 'Đã xuất bản' },
  { value: 'draft', label: 'Nháp' },
] as const;

type StatusFilter = (typeof STATUS_FILTERS)[number]['value'];

export default async function RecipesAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: statusParam } = await searchParams;

  const statusFilter: StatusFilter =
    statusParam === 'published' || statusParam === 'draft'
      ? statusParam
      : 'all';

  const admin = getSupabaseServerAdminClient<RecipeSchema>();

  const query = admin
    .from('recipes')
    .select(
      'id,title,slug,image_url,difficulty,cook_time,status,categories(name)',
    )
    .order('id', { ascending: false })
    .limit(200);

  const { data, error } = await (
    statusFilter === 'all' ? query : query.eq('status', statusFilter)
  );

  if (error) {
    throw new Error(`Không tải được công thức: ${error.message}`);
  }

  const recipes = data ?? [];

  return (
    <div className={'flex flex-col gap-6'}>
      <div className={'flex flex-wrap items-start justify-between gap-3'}>
        <div>
          <h1 className={'text-2xl font-bold tracking-tight'}>
            Quản lý công thức
          </h1>

          <p className={'text-muted-foreground mt-1 text-sm'}>
            {recipes.length} công thức (hiển thị tối đa 200).
          </p>
        </div>

        <Button nativeButton={false} render={<Link href={'/admin/cong-thuc/moi'}>Thêm công thức</Link>} />
      </div>

      <div className={'flex flex-wrap gap-2'}>
        {STATUS_FILTERS.map((filter) => {
          const active = statusFilter === filter.value;

          return (
            <Link
              key={filter.value}
              href={
                filter.value === 'all'
                  ? '/admin/cong-thuc'
                  : `/admin/cong-thuc?status=${filter.value}`
              }
              aria-current={active ? 'page' : undefined}
              className={
                active
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-3 py-1.5 text-sm font-medium'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md px-3 py-1.5 text-sm font-medium'
              }
            >
              {filter.label}
            </Link>
          );
        })}
      </div>

      {recipes.length === 0 ? (
        <Card>
          <CardContent className={'py-10 text-center'}>
            <p className={'text-muted-foreground text-sm'}>
              Chưa có công thức nào. Hãy thêm công thức đầu tiên.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className={'grid grid-cols-1 gap-3 lg:grid-cols-2'}>
          {recipes.map((recipe) => {
            const categoryName =
              (recipe.categories as { name?: string } | null)?.name ?? '—';

            return (
              <Card key={recipe.id}>
                <CardHeader className={'pb-3'}>
                  <div className={'flex gap-3'}>
                    {recipe.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={recipe.image_url}
                        alt={recipe.title}
                        className={'h-16 w-16 shrink-0 rounded-md object-cover'}
                        loading={'lazy'}
                      />
                    ) : (
                      <div
                        className={
                          'bg-muted flex h-16 w-16 shrink-0 items-center justify-center rounded-md text-xs text-muted-foreground'
                        }
                      >
                        Không ảnh
                      </div>
                    )}

                    <div className={'min-w-0 flex-1'}>
                      <CardTitle className={'truncate text-base'}>
                        {recipe.title}
                      </CardTitle>

                      <CardDescription className={'truncate font-mono text-xs'}>
                        {recipe.slug}
                      </CardDescription>

                      <div className={'mt-1.5 flex flex-wrap gap-1'}>
                        <Badge
                          variant={
                            recipe.status === 'draft'
                              ? 'secondary'
                              : 'default'
                          }
                        >
                          {recipe.status === 'draft' ? 'Nháp' : 'Đã xuất bản'}
                        </Badge>

                        <Badge variant={'secondary'}>{categoryName}</Badge>

                        {recipe.difficulty && (
                          <Badge variant={'outline'}>{recipe.difficulty}</Badge>
                        )}

                        {recipe.cook_time !== null && (
                          <Badge variant={'outline'}>
                            {recipe.cook_time} phút
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className={'flex gap-2 pt-0'}>
                  <Button
                    nativeButton={false}
                    size={'sm'}
                    variant={'outline'}
                    render={
                      <Link href={`/admin/cong-thuc/${recipe.id}/sua`}>
                        Sửa
                      </Link>
                    }
                  />

                  <DeleteRecipeButton id={recipe.id} title={recipe.title} />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
