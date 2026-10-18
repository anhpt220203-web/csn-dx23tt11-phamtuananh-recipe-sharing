import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import { ExternalLink, Sparkles } from 'lucide-react';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
} from '@kit/ui/card';
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

type QuestionWithRecipe = {
  id: number;
  recipe_id: number;
  user_id: string;
  question: string;
  answer: string | null;
  created_at: string;
  updated_at: string;
  recipes: {
    id: number;
    title: string;
    slug: string;
  } | null;
};

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

export default async function RecipeQuestionsAdminPage({
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
    .select(
      'id,recipe_id,user_id,question,answer,created_at,updated_at,recipes(id,title,slug)',
      { count: 'exact' },
    );

  if (status === 'answered') {
    query = query.not('answer', 'is', null);
  } else if (status === 'unanswered') {
    query = query.is('answer', null);
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
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const safePage = Math.min(page, totalPages);

  if (page > totalPages && total > 0) {
    redirect(
      buildQuestionsHref({
        status,
        q,
        page: totalPages,
      }),
    );
  }

  // Đếm riêng số câu hỏi chưa trả lời để hiển thị badge cảnh báo
  const { count: unansweredTotal } = await admin
    .from('recipe_questions')
    .select('id', { count: 'exact', head: true })
    .is('answer', null);

  const hasActiveFilter = q !== '' || status !== 'all';

  return (
    <div className={'flex flex-col gap-6'}>
      {/* Header trang */}
      <div className={'flex flex-wrap items-start justify-between gap-3'}>
        <div>
          <h1 className={'text-2xl font-bold tracking-tight'}>Quản lý hỏi đáp</h1>

          <p className={'text-muted-foreground mt-1 text-sm'}>
            Tổng cộng {total} câu hỏi trong hệ thống. Giải đáp thắc mắc và hỗ trợ người dùng về các công thức nấu ăn.
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
      </div>

      {/* Tabs lọc theo trạng thái */}
      <div className={'flex flex-wrap gap-2'}>
        {STATUS_FILTERS.map((f) => {
          const active = f.value === status;

          return (
            <Link
              key={f.value}
              href={buildQuestionsHref({
                status: f.value,
                q,
                page: 1,
              })}
              aria-current={active ? 'page' : undefined}
              className={
                active
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-3 py-1.5 text-sm font-medium'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md px-3 py-1.5 text-sm font-medium'
              }
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {/* Bộ lọc theo từ khóa */}
      <form
        action={'/admin/hoi-dap'}
        method={'GET'}
        role={'search'}
        className={'flex flex-col gap-2 sm:flex-row sm:items-end'}
      >
        {status !== 'all' && (
          <input type={'hidden'} name={'status'} value={status} />
        )}

        <div className={'flex-1'}>
          <label
            htmlFor={'admin-question-search'}
            className={'mb-1 block text-xs font-medium'}
          >
            Tìm kiếm theo câu hỏi hoặc câu trả lời
          </label>

          <Input
            id={'admin-question-search'}
            name={'q'}
            type={'search'}
            defaultValue={q}
            placeholder={'Nhập nội dung câu hỏi hoặc câu trả lời…'}
            className={'max-w-md'}
          />
        </div>

        <div className={'flex gap-2'}>
          <Button type={'submit'} size={'sm'}>
            Lọc
          </Button>

          {hasActiveFilter && (
            <Button
              nativeButton={false}
              size={'sm'}
              variant={'outline'}
              render={
                <Link
                  href={buildQuestionsHref({
                    status: 'all',
                    q: '',
                    page: 1,
                  })}
                >
                  Xoá lọc
                </Link>
              }
            />
          )}
        </div>
      </form>

      {/* Danh sách câu hỏi */}
      {questions.length === 0 ? (
        <Card>
          <CardContent className={'py-10 text-center'}>
            <p className={'text-muted-foreground text-sm'}>
              {hasActiveFilter
                ? 'Không tìm thấy câu hỏi nào với bộ lọc hiện tại.'
                : 'Chưa có câu hỏi nào từ người dùng.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className={'flex flex-col gap-4'}>
          {total > 0 && (
            <div className={'flex items-center justify-between text-xs text-muted-foreground'}>
              <span>
                Hiển thị {from + 1}–{Math.min(to + 1, total)} trên tổng số {total} câu hỏi
              </span>
            </div>
          )}

          <div className={'grid grid-cols-1 gap-3 lg:grid-cols-2'}>
            {questions.map((item) => (
              <Card key={item.id} className={'hover:shadow-xs transition-shadow'}>
                <CardHeader className={'pb-3 space-y-2.5'}>
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
                            <span className={'truncate'}>{item.recipes.title}</span>
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
                </CardHeader>

                <CardContent className={'pt-0'}>
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
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Phân trang */}
          <div className={'pt-2'}>
            <PaginationNav
              currentPage={safePage}
              totalPages={totalPages}
              buildHref={(p: number) =>
                buildQuestionsHref({
                  status,
                  q,
                  page: p,
                })
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}
