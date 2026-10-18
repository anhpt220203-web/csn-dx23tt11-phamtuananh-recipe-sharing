import type { Metadata } from 'next';
import Link from 'next/link';
import { connection } from 'next/server';
import { MessageSquare, Search } from 'lucide-react';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import { Input } from '@kit/ui/input';

import { PaginationNav } from '~/(marketing)/_components/pagination-nav';
import type { RecipeSchema } from '~/lib/recipes/database';

import { QuestionRowActions } from './_components/question-forms';

export const metadata: Metadata = {
  title: 'Quản lý hỏi đáp',
};

export const instant = false;

const PER_PAGE = 8;

const STATUS_FILTERS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'unanswered', label: 'Chưa trả lời' },
  { value: 'answered', label: 'Đã trả lời' },
] as const;

type StatusFilter = (typeof STATUS_FILTERS)[number]['value'];

function parsePage(value: string | undefined): number {
  const page = Number.parseInt(value ?? '1', 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

function buildQuestionsHref({
  status = 'all',
  q = '',
  page = 1,
}: {
  status?: StatusFilter;
  q?: string;
  page?: number;
}): string {
  const params = new URLSearchParams();

  if (status !== 'all') {
    params.set('status', status);
  }

  const trimmed = q.trim();
  if (trimmed) {
    params.set('q', trimmed);
  }

  if (page > 1) {
    params.set('page', String(page));
  }

  const queryString = params.toString();
  return queryString ? `/admin/hoi-dap?${queryString}` : '/admin/hoi-dap';
}

function escapeLike(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_');
}

type QuestionWithRecipe = {
  id: number;
  question: string;
  answer: string | null;
  created_at: string;
  recipes: { title: string; slug: string } | null;
};

export default async function QuestionsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    q?: string;
    page?: string;
  }>;
}) {
  // Trang admin đọc DB mỗi request, không prerender lúc build.
  await connection();

  const params = await searchParams;
  const page = parsePage(params.page);
  const q = (params.q ?? '').trim();
  const status: StatusFilter =
    params.status === 'answered' || params.status === 'unanswered'
      ? params.status
      : 'all';

  const from = (page - 1) * PER_PAGE;
  const to = from + PER_PAGE - 1;

  const admin = getSupabaseServerAdminClient<RecipeSchema>();

  let query = admin
    .from('recipe_questions')
    .select('id,question,answer,created_at,recipes(title,slug)', {
      count: 'exact',
    });

  if (status === 'unanswered') {
    query = query.is('answer', null);
  } else if (status === 'answered') {
    query = query.not('answer', 'is', null);
  }

  if (q) {
    const escaped = escapeLike(q);
    query = query.or(`question.ilike.%${escaped}%,answer.ilike.%${escaped}%`);
  }

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(`Không tải được câu hỏi: ${error.message}`);
  }

  const questions = (data ?? []) as unknown as QuestionWithRecipe[];
  const total = count ?? 0;
  const totalPages = Math.ceil(total / PER_PAGE);

  // Đếm riêng số câu hỏi chưa trả lời để hiển thị badge cảnh báo
  const { count: unansweredTotal } = await admin
    .from('recipe_questions')
    .select('id', { count: 'exact', head: true })
    .is('answer', null);

  return (
    <div className={'flex flex-col gap-6'}>
      <div className={'flex flex-wrap items-center justify-between gap-4'}>
        <div>
          <h1 className={'text-2xl font-bold tracking-tight'}>Quản lý hỏi đáp</h1>

          <p className={'text-muted-foreground mt-1 text-sm'}>
            Hỏi đáp và giải đáp thắc mắc của người dùng về các món ăn.
            {(unansweredTotal ?? 0) > 0 ? (
              <span className={'ml-1 text-amber-600 font-medium'}>
                (Có {unansweredTotal} câu hỏi chưa trả lời)
              </span>
            ) : (
              <span className={'ml-1 text-emerald-600'}>
                (Tất cả câu hỏi đã được giải đáp)
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Tabs lọc trạng thái + ô tìm kiếm */}
      <Card>
        <CardContent className={'p-4'}>
          <div className={'flex flex-col gap-3 md:flex-row md:items-center md:justify-between'}>
            <div className={'flex flex-wrap items-center gap-1.5'}>
              {STATUS_FILTERS.map((f) => {
                const active = f.value === status;
                return (
                  <Button
                    key={f.value}
                    nativeButton={false}
                    variant={active ? 'default' : 'outline'}
                    size={'sm'}
                    render={
                      <Link
                        href={buildQuestionsHref({
                          status: f.value,
                          q,
                          page: 1,
                        })}
                      >
                        {f.label}
                      </Link>
                    }
                  />
                );
              })}
            </div>

            <form
              method={'GET'}
              action={'/admin/hoi-dap'}
              className={'flex items-center gap-2'}
            >
              {status !== 'all' && (
                <input type={'hidden'} name={'status'} value={status} />
              )}

              <div className={'relative min-w-56'}>
                <Search className={'text-muted-foreground pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2'} />
                <Input
                  name={'q'}
                  defaultValue={q}
                  placeholder={'Tìm trong câu hỏi hoặc trả lời...'}
                  className={'pl-9 text-sm'}
                />
              </div>

              <Button type={'submit'} variant={'secondary'} size={'sm'}>
                Tìm
              </Button>

              {q && (
                <Button
                  nativeButton={false}
                  variant={'ghost'}
                  size={'sm'}
                  className={'text-xs text-muted-foreground'}
                  render={
                    <Link
                      href={buildQuestionsHref({
                        status,
                        q: '',
                        page: 1,
                      })}
                    >
                      Xóa tìm
                    </Link>
                  }
                />
              )}
            </form>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className={'pb-3'}>
          <CardTitle className={'text-base flex items-center justify-between'}>
            <span>Danh sách câu hỏi ({total})</span>
            {total > 0 && (
              <span className={'text-xs font-normal text-muted-foreground'}>
                Trang {page} / {Math.max(1, totalPages)}
              </span>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent>
          {questions.length === 0 ? (
            <div className={'py-10 text-center'}>
              <MessageSquare className={'mx-auto h-8 w-8 text-muted-foreground/40 mb-2'} />
              <p className={'text-muted-foreground text-sm'}>
                {q || status !== 'all'
                  ? 'Không tìm thấy câu hỏi nào phù hợp với bộ lọc.'
                  : 'Chưa có câu hỏi nào từ người dùng.'}
              </p>
            </div>
          ) : (
            <ul className={'flex flex-col gap-3'}>
              {questions.map((item) => (
                <li
                  key={item.id}
                  className={'rounded-lg border p-4 transition-colors hover:bg-muted/30'}
                >
                  <div className={'flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'}>
                    <div className={'min-w-0 flex-1 space-y-2'}>
                      <div className={'flex flex-wrap items-center gap-2'}>
                        {item.answer ? (
                          <Badge variant={'default'} className={'bg-emerald-600'}>
                            Đã trả lời
                          </Badge>
                        ) : (
                          <Badge variant={'destructive'}>Chưa trả lời</Badge>
                        )}

                        <span className={'text-muted-foreground text-xs'}>
                          Món: <strong>{item.recipes?.title ?? 'Công thức'}</strong> ·{' '}
                          {new Date(item.created_at).toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <p className={'font-medium text-base text-foreground leading-snug'}>
                        {item.question}
                      </p>

                      {item.answer ? (
                        <div className={'rounded-lg bg-muted/60 p-3 text-sm border'}>
                          <p className={'font-medium text-xs text-muted-foreground mb-1'}>
                            Câu trả lời của ban quản trị:
                          </p>
                          <p className={'leading-relaxed whitespace-pre-line'}>{item.answer}</p>
                        </div>
                      ) : null}
                    </div>

                    <div className={'shrink-0'}>
                      <QuestionRowActions
                        id={item.id}
                        question={item.question}
                        recipeTitle={item.recipes?.title}
                        currentAnswer={item.answer}
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className={'flex justify-center pt-2'}>
          <PaginationNav
            currentPage={page}
            totalPages={totalPages}
            getPageHref={(p) =>
              buildQuestionsHref({
                status,
                q,
                page: p,
              })
            }
          />
        </div>
      )}
    </div>
  );
}
