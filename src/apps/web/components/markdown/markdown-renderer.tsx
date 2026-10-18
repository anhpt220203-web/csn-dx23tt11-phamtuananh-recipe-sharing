import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { cn } from '@kit/ui/utils';

/**
 * Render markdown do admin/người dùng soạn (react-markdown + GFM: bảng,
 * gạch ngang, checklist...). KHÔNG render HTML thô (mặc định react-markdown
 * escape toàn bộ) → an toàn XSS và không bao giờ lỗi ký tự khi dán nội dung
 * từ Word/web (mọi ký tự Unicode được giữ nguyên dạng text).
 */
export function MarkdownRenderer({
  content,
  className,
}: {
  content: string | null | undefined;
  className?: string;
}) {
  if (!content?.trim()) {
    return null;
  }

  return (
    <div
      className={cn(
        'text-foreground/90 space-y-2.5 text-sm leading-relaxed',
        '[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2',
        '[&_blockquote]:border-primary/40 [&_blockquote]:border-l-4 [&_blockquote]:bg-muted/40 [&_blockquote]:py-1 [&_blockquote]:pl-4 [&_blockquote]:italic',
        '[&_code]:bg-muted [&_code]:rounded [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[0.85em]',
        '[&_h1]:mt-4 [&_h1]:mb-2 [&_h1]:text-xl [&_h1]:font-bold',
        '[&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-bold',
        '[&_h3]:mt-3 [&_h3]:mb-1.5 [&_h3]:text-base [&_h3]:font-semibold',
        '[&_h4]:mt-3 [&_h4]:mb-1 [&_h4]:font-semibold',
        '[&_hr]:border-border my-4',
        '[&_img]:rounded-lg [&_img]:max-w-full',
        '[&_li]:my-0.5',
        '[&_ol]:list-decimal [&_ol]:pl-6',
        '[&_pre]:bg-muted [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:p-3 [&_pre]:text-xs',
        '[&_strong]:font-semibold [&_strong]:text-foreground',
        '[&_table]:border-border [&_table]:w-full [&_table]:border-collapse [&_table]:text-xs',
        '[&_table_td]:border-border [&_table_td]:border [&_table_td]:px-2 [&_table_td]:py-1.5 [&_table_td]:align-top',
        '[&_table_th]:border-border [&_table_th]:bg-muted/60 [&_table_th]:border [&_table_th]:px-2 [&_table_th]:py-1.5 [&_table_th]:text-left [&_table_th]:font-semibold',
        '[&_ul]:list-disc [&_ul]:pl-6',
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: (props) => (
            <a {...props} target={'_blank'} rel={'noopener noreferrer'} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
