import type { Metadata } from 'next';
import Link from 'next/link';
import { connection } from 'next/server';
import { ExternalLink, MessageSquare, Search, Sparkles } from 'lucide-react';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@kit/ui/card';
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
      <div>
        <h1 className={'text-2xl font-bold tracking-tight'}>Quản lý hỏi đáp</h1>

        <p className={'text-muted-foreground mt-1 text-sm'}>
          Giải đáp thắc mắc và hỗ trợ người dùng về các công thức nấu ăn.
          {(unansweredTotal ?? 0) > 0 ? (
            <span className={'ml-1 text-amber-600 font-medium'}>
              (Hiện có {unansweredTotal} câu hỏi cần giải đáp)
            </span>
          ) : (
            <span className={'ml-1 text-emerald-600'}>
              (Tất cả câu hỏi đã được giải đáp)
            </span>
          )}
        </p>
      </div>

      {/* Cụm thống nhất: Gộp bộ lọc, tìm kiếm và danh sách câu hỏi dạng lưới trong 1 Card */}
      <Card className={'shadow-xs'}>
        <CardHeader className={'space-y-4 border-b border-border/50 pb-5'}>
          <div className={'flex flex-wrap items-center justify-between gap-2'}>
            <CardTitle className={'text-base font-semibold flex items-center gap-2'}>
              <MessageSquare className={'h-4 w-4 text-primary'} />
              <span>Danh sách câu hỏi ({total})</span>
            </CardTitle>

            {total > 0 && (
              <span className={'text-xs text-muted-foreground'}>
                Trang {page} / {Math.max(1, totalPages)}
              </span>
            )}
          </div>

          {/* Thanh công cụ: Tabs lọc trạng thái + Form tìm kiếm */}
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
                    className={'h-8 text-xs'}
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
                <Search className={'text-muted-foreground pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2'} />
                <Input
                  name={'q'}
                  defaultValue={q}
                  placeholder={'Tìm câu hỏi, câu trả lời...'}
                  className={'h-8 pl-8 text-xs'}
                />
              </div>

              <Button type={'submit'} variant={'secondary'} size={'sm'} className={'h-8 text-xs'}>
                Tìm
              </Button>

              {q && (
                <Button
                  nativeButton={false}
                  variant={'ghost'}
                  size={'sm'}
                  className={'h-8 text-xs text-muted-foreground'}
                  render={
                    <Link
                      href={buildQuestionsHref({
                        status,
                        q: '',
                        page: 1,
                      })}
                    >
                      Xóa
                    </Link>
                  }
                />
              )}
            </form>
          </div>
        </CardHeader>

        <CardContent className={'pt-5'}>
          {questions.length === 0 ? (
            <div className={'py-12 text-center'}>
              <MessageSquare className={'mx-auto h-10 w-10 text-muted-foreground/30 mb-2'} />
              <p className={'text-muted-foreground text-sm font-medium'}>
                {q || status !== 'all'
                  ? 'Không tìm thấy câu hỏi nào phù hợp với bộ lọc.'
                  : 'Chưa có câu hỏi nào từ người dùng.'}
              </p>
            </div>
          ) : (
            /* Danh sách câu hỏi dạng lưới (Grid 2 cột trên desktop) */
            <div className={'grid grid-cols-1 md:grid-cols-2 gap-4'}>
              {questions.map((item) => (
                <div
                  key={item.id}
                  className={
                    'flex flex-col justify-between rounded-xl border border-border/70 bg-card p-4 transition-shadow hover:shadow-sm'
                  }
                >
                  <div className={'space-y-3'}>
                    {/* Header item: Badge trạng thái + Món ăn liên quan + Nút thao tác */}
                    <div className={'flex items-start justify-between gap-2'}>
                      <div className={'flex flex-wrap items-center gap-2 min-w-0'}>
                        {item.answer ? (
                          <Badge variant={'default'} className={'bg-emerald-600 text-[11px] h-5 px-2'}>
                            Đã trả lời
                          </Badge>
                        ) : (
                          <Badge variant={'destructive'} className={'text-[11px] h-5 px-2'}>
                            Chưa trả lời
                          </Badge>
                        )}

                        <span className={'truncate text-xs font-medium text-foreground'}>
                          {item.recipes?.title ? (
                            <Link
                              href={`/cong-thuc/${item.recipes.slug}`}
                              target={'_blank'}
                              rel={'noreferrer'}
                              className={'hover:underline text-primary inline-flex items-center gap-1'}
                              title={`Xem món: ${item.recipes.title}`}
                            >
                              <span>{item.recipes.title}</span>
                              <ExternalLink className={'h-3 w-3 shrink-0'} />
                            </Link>
                          ) : (
                            'Công thức'
                          )}
                        </span>
                      </div>

                      <QuestionRowActions
                        id={item.id}
                        question={item.question}
                        recipeTitle={item.recipes?.title}
                        currentAnswer={item.answer}
                      />
                    </div>

                    {/* Nội dung câu hỏi */}
                    <div>
                      <p className={'font-medium text-sm leading-snug text-foreground'}>
                        {item.question}
                      </p>
                      <p className={'text-[11px] text-muted-foreground mt-1'}>
                        Hỏi lúc{' '}
                        {new Date(item.created_at).toLocaleString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>

                    {/* Khung câu trả lời */}
                    {item.answer ? (
                      <div className={'rounded-lg bg-muted/50 p-3 text-xs border border-border/50 space-y-1'}>
                        <div className={'flex items-center gap-1 font-semibold text-primary text-[11px]'}>
                          <Sparkles className={'h-3 w-3'} />
                          <span>Câu trả lời của bạn:</span>
                        </div>
                        <p className={'leading-relaxed text-muted-foreground whitespace-pre-line'}>
                          {item.answer}
                        </p>
                      </div>
                    ) : (
                      <div className={'rounded-lg border border-dashed border-border/60 bg-muted/20 p-2.5 text-center text-xs text-muted-foreground'}>
                        Chưa có câu trả lời. Bấm &quot;Trả lời&quot; ở trên để giải đáp.
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>

        {totalPages > 1 && (
          <CardFooter className={'border-t border-border/40 pt-4 flex justify-center'}>
            <PaginationNav
              currentPage={page}
              totalPages={totalPages}
              buildHref={(p: number) =>
                buildQuestionsHref({
                  status,
                  q,
                  page: p,
                })
              }
            />
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
