'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Clock, Loader2, Search, Utensils, X } from 'lucide-react';

import { Input } from '@kit/ui/input';
import { cn } from '@kit/ui/utils';
import { resolveRecipeImageSrc } from '~/lib/recipes/images';

import {
  getLiveSearchSuggestionsAction,
  type LiveSearchItem,
} from './actions';

type HeaderSearchFormProps = {
  className?: string;
};

/**
 * Ô tìm kiếm trên Header:
 * - Không có nút kính lúp thừa bên phải (chỉ icon kính lúp bên trong input).
 * - Tự động gợi ý món ăn dạng menu xổ xuống khi nhập từ khóa.
 * - Chọn trực tiếp món ăn để chuyển đến công thức.
 * - Nút "Xem thêm" ở cuối menu xổ xuống nhảy sang trang /tim-kiem.
 */
export function HeaderSearchForm({ className }: HeaderSearchFormProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<LiveSearchItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce tìm kiếm gợi ý món ăn khi người dùng gõ
  useEffect(() => {
    const trimmed = query.trim();

    if (!trimmed) {
      setSuggestions([]);
      setIsOpen(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timeoutId = setTimeout(async () => {
      try {
        const items = await getLiveSearchSuggestionsAction(trimmed);
        setSuggestions(items);
        setIsOpen(true);
      } catch {
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Đóng dropdown khi click ra bên ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function navigateToSearchPage() {
    setIsOpen(false);
    const trimmed = query.trim();
    const params = new URLSearchParams();

    if (trimmed) {
      params.set('q', trimmed);
    }

    router.push(`/tim-kiem?${params.toString()}`);
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    navigateToSearchPage();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      setIsOpen(false);
    }
  }

  return (
    <div
      ref={containerRef}
      className={cn('relative w-full', className)}
    >
      <form
        onSubmit={onSubmit}
        role={'search'}
        className={'relative flex w-full items-center'}
      >
        <Search
          className={
            'text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2'
          }
          aria-hidden={true}
        />

        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => {
            if (query.trim().length > 0) {
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={'Tìm món ăn, nguyên liệu…'}
          aria-label={'Tìm kiếm công thức'}
          data-test={'header-search-input'}
          className={
            'h-9.5 w-full rounded-full border-border/70 bg-muted/40 pl-9 pr-8 text-sm transition-all focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20'
          }
        />

        {/* Nút xóa từ khóa hoặc icon spinner khi đang tải */}
        {isLoading ? (
          <Loader2
            className={
              'text-primary pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin'
            }
          />
        ) : query ? (
          <button
            type={'button'}
            onClick={() => {
              setQuery('');
              setSuggestions([]);
              setIsOpen(false);
            }}
            className={
              'text-muted-foreground hover:text-foreground absolute top-1/2 right-2.5 -translate-y-1/2 rounded-full p-1 transition-colors'
            }
            aria-label={'Xóa từ khóa'}
          >
            <X className={'h-3.5 w-3.5'} />
          </button>
        ) : null}
      </form>

      {/* Menu xổ xuống hiển thị danh sách gợi ý món ăn */}
      {isOpen && query.trim().length > 0 && (
        <div
          className={
            'absolute top-full left-0 right-0 z-50 mt-1.5 min-w-[280px] sm:min-w-[320px] overflow-hidden rounded-2xl border border-border/80 bg-popover/95 p-1.5 text-popover-foreground shadow-xl backdrop-blur-md animate-in fade-in-50 zoom-in-95'
          }
        >
          {suggestions.length > 0 ? (
            <div className={'flex flex-col'}>
              <div className={'flex items-center justify-between px-2.5 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider'}>
                <span>Gợi ý món ăn ({suggestions.length})</span>
                <span className={'text-[10px] lowercase text-muted-foreground/80'}>bấm để xem công thức</span>
              </div>

              <ul className={'flex flex-col gap-1'}>
                {suggestions.map((item) => {
                  const imageSrc = resolveRecipeImageSrc(item.imageUrl);

                  return (
                    <li key={item.id}>
                      <Link
                        href={`/cong-thuc/${item.slug}`}
                        onClick={() => setIsOpen(false)}
                        className={
                          'group flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-primary/10'
                        }
                      >
                        <div
                          className={
                            'relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-border/50 bg-muted'
                          }
                        >
                          {imageSrc ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={imageSrc}
                              alt={item.title}
                              className={'h-full w-full object-cover transition-transform group-hover:scale-105'}
                            />
                          ) : (
                            <div className={'flex h-full w-full items-center justify-center text-muted-foreground'}>
                              <Utensils className={'h-4 w-4'} />
                            </div>
                          )}
                        </div>

                        <div className={'flex min-w-0 flex-1 flex-col'}>
                          <span className={'truncate text-xs font-semibold text-foreground group-hover:text-primary transition-colors'}>
                            {item.title}
                          </span>

                          <div className={'mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground'}>
                            {item.categoryName && (
                              <span className={'font-medium text-foreground/75'}>
                                {item.categoryName}
                              </span>
                            )}
                            {item.cookTime && (
                              <span className={'inline-flex items-center gap-1'}>
                                <Clock className={'h-3 w-3'} />
                                {item.cookTime} phút
                              </span>
                            )}
                          </div>
                        </div>

                        <ArrowRight className={'h-3.5 w-3.5 text-muted-foreground opacity-50 transition-transform group-hover:translate-x-0.5 group-hover:opacity-100 group-hover:text-primary'} />
                      </Link>
                    </li>
                  );
                })}
              </ul>

              {/* Nút Xem thêm dưới cùng menu */}
              <div className={'mt-1 border-t border-border/60 pt-1'}>
                <button
                  type={'button'}
                  onClick={navigateToSearchPage}
                  className={
                    'flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/15 cursor-pointer'
                  }
                >
                  <span>Xem thêm kết quả cho &ldquo;{query.trim()}&rdquo;</span>
                  <ArrowRight className={'h-3.5 w-3.5'} />
                </button>
              </div>
            </div>
          ) : !isLoading ? (
            <div className={'p-3 text-center'}>
              <p className={'text-xs text-muted-foreground'}>
                Không tìm thấy món ăn phù hợp với &ldquo;{query.trim()}&rdquo;.
              </p>
              <button
                type={'button'}
                onClick={navigateToSearchPage}
                className={
                  'mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline cursor-pointer'
                }
              >
                <span>Xem thêm tại trang Tìm kiếm</span>
                <ArrowRight className={'h-3 w-3'} />
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
