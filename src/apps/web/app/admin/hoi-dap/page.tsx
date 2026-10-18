import type { Metadata } from 'next';
import { connection } from 'next/server';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';
import { Badge } from '@kit/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';

import type { RecipeSchema } from '~/lib/recipes/database';

import { QuestionRowActions } from './_components/question-forms';

export const metadata: Metadata = {
  title: 'Quản lý hỏi đáp',
};

export const instant = false;

type QuestionWithRecipe = {
  id: number;
  question: string;
  answer: string | null;
  created_at: string;
  recipes: { title: string; slug: string } | null;
};

export default async function QuestionsAdminPage() {
  // Trang admin đọc DB mỗi request, không prerender lúc build.
  await connection();

  const admin = getSupabaseServerAdminClient<RecipeSchema>();

  const { data, error } = await admin
    .from('recipe_questions')
    .select('id,question,answer,created_at,recipes(title,slug)')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Không tải được câu hỏi: ${error.message}`);
  }

  const questions = (data ?? []) as unknown as QuestionWithRecipe[];
  const unanswered = questions.filter((q) => !q.answer);

  return (
    <div className={'flex flex-col gap-6'}>
      <div>
        <h1 className={'text-2xl font-bold tracking-tight'}>Quản lý hỏi đáp</h1>

        <p className={'text-muted-foreground mt-1 text-sm'}>
          Trả lời câu hỏi của người dùng về các công thức.
          {unanswered.length > 0
            ? ` Có ${unanswered.length} câu hỏi chưa trả lời.`
            : ' Tất cả câu hỏi đã được trả lời.'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className={'text-base'}>
            Danh sách câu hỏi ({questions.length})
          </CardTitle>
        </CardHeader>

        <CardContent>
          {questions.length === 0 ? (
            <p className={'text-muted-foreground text-sm'}>
              Chưa có câu hỏi nào.
            </p>
          ) : (
            <ul className={'flex flex-col gap-4'}>
              {questions.map((item) => (
                <li
                  key={item.id}
                  className={'rounded-lg border p-4'}
                >
                  <div className={'flex items-start justify-between gap-4'}>
                    <div className={'min-w-0 flex-1'}>
                      <p className={'font-medium'}>{item.question}</p>

                      <p className={'text-muted-foreground mt-1 text-xs'}>
                        {item.recipes?.title ?? 'Công thức'} ·{' '}
                        {new Date(item.created_at).toLocaleDateString('vi-VN')}
                      </p>

                      {item.answer ? (
                        <div className={'mt-2 rounded-lg bg-muted p-3 text-sm'}>
                          <p className={'font-medium'}>Đã trả lời:</p>
                          <p className={'mt-1'}>{item.answer}</p>
                        </div>
                      ) : (
                        <Badge variant={'secondary'} className={'mt-2'}>
                          Chưa trả lời
                        </Badge>
                      )}
                    </div>

                    <QuestionRowActions
                      id={item.id}
                      question={item.question}
                      recipeTitle={item.recipes?.title}
                      currentAnswer={item.answer}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
