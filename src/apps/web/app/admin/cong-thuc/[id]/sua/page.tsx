import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';

import type {
  RecipeDetail,
  RecipeSchema,
} from '~/lib/recipes/database';

import { RecipeForm } from '../../_components/recipe-form';

export const metadata: Metadata = {
  title: 'Sửa công thức',
};

type EditRecipePageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditRecipePage({ params }: EditRecipePageProps) {
  const { id: idParam } = await params;
  const id = Number(idParam);

  if (!Number.isInteger(id) || id <= 0) {
    notFound();
  }

  const admin = getSupabaseServerAdminClient<RecipeSchema>();

  const [{ data: categories }, { data: recipe }] = await Promise.all([
    admin
      .from('categories')
      .select('id,name,slug,description')
      .order('id', { ascending: true }),
    admin
      .from('recipes')
      .select(
        'id,category_id,title,slug,description,image_url,status,source_name,source_url,servings,cook_time,difficulty,created_by,categories(name,slug),recipe_ingredients(name,position),recipe_steps(step,position)',
      )
      .eq('id', id)
      .maybeSingle(),
  ]);

  if (!recipe) {
    notFound();
  }

  const ingredients = (
    (recipe.recipe_ingredients as unknown as
      | { name: string; position: number }[]
      | null) ?? []
  )
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((item) => item.name);

  const steps = (
    (recipe.recipe_steps as unknown as
      | { step: string; position: number }[]
      | null) ?? []
  )
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((item) => item.step);

  const initial: RecipeDetail = {
    id: recipe.id,
    category_id: recipe.category_id,
    title: recipe.title,
    slug: recipe.slug,
    description: recipe.description,
    image_url: recipe.image_url,
    status: recipe.status,
    source_name: recipe.source_name,
    source_url: recipe.source_url,
    servings: recipe.servings,
    cook_time: recipe.cook_time,
    difficulty: recipe.difficulty,
    created_by: recipe.created_by,
    category_name:
      (recipe.categories as { name?: string } | null)?.name ?? '',
    category_slug:
      (recipe.categories as { slug?: string } | null)?.slug ?? '',
    ingredients,
    steps,
  };

  return (
    <div className={'mx-auto flex w-full max-w-3xl flex-col gap-6'}>
      <div>
        <h1 className={'text-2xl font-bold tracking-tight'}>Sửa công thức</h1>

        <p className={'text-muted-foreground mt-1 text-sm'}>
          Cập nhật thông tin món “{recipe.title}”.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className={'text-base'}>Thông tin công thức</CardTitle>
        </CardHeader>

        <CardContent>
          <RecipeForm categories={categories ?? []} initial={initial} />
        </CardContent>
      </Card>
    </div>
  );
}
