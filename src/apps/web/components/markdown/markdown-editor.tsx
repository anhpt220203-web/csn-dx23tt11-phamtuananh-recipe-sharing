'use client';

import { useRef, useState } from 'react';

import {
  Bold,
  Code,
  Eye,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  ListTodo,
  Minus,
  PencilLine,
  Quote,
  Strikethrough,
  Table as TableIcon,
} from 'lucide-react';

import { Label } from '@kit/ui/label';
import { Textarea } from '@kit/ui/textarea';
import { cn } from '@kit/ui/utils';

import { MarkdownRenderer } from '~/components/markdown/markdown-renderer';

/**
 * Trình soạn thảo Markdown với thanh công cụ kiểu Word (đậm/nghiêng/heading/
 * danh sách/bảng/link/ảnh...) + tab xem trước render trực tiếp.
 *
 * Dùng trong form admin (useActionState): giữ `name` trên textarea để giá trị
 * markdown thô luôn được gửi cùng form, kể cả khi đang ở tab xem trước.
 * Nội dung là markdown thuần — HTML thô sẽ được escape ở bước render nên
 * không bao giờ lỗi ký tự hay dính XSS.
 */

type EditorAction = {
  icon: React.ReactNode;
  title: string;
  /** Bọc vùng chọn bằng cặp ký tự (đậm, nghiêng...). */
  wrap?: [string, string];
  /** Chèn văn bản tại vị trí con trỏ (khối bảng, kẻ ngang...). */
  insert?: string;
  /** Thêm prefix vào đầu dòng hiện tại (heading, danh sách...). */
  linePrefix?: string;
};

const ACTIONS: EditorAction[] = [
  { icon: <Bold className={'h-4 w-4'} />, title: 'Đậm (Ctrl+B)', wrap: ['**', '**'] },
  { icon: <Italic className={'h-4 w-4'} />, title: 'Nghiêng (Ctrl+I)', wrap: ['*', '*'] },
  { icon: <Strikethrough className={'h-4 w-4'} />, title: 'Gạch ngang', wrap: ['~~', '~~'] },
  { icon: <Heading2 className={'h-4 w-4'} />, title: 'Tiêu đề lớn (H2)', linePrefix: '## ' },
  { icon: <Heading3 className={'h-4 w-4'} />, title: 'Tiêu đề nhỏ (H3)', linePrefix: '### ' },
  { icon: <List className={'h-4 w-4'} />, title: 'Danh sách chấm', linePrefix: '- ' },
  { icon: <ListOrdered className={'h-4 w-4'} />, title: 'Danh sách số', linePrefix: '1. ' },
  { icon: <ListTodo className={'h-4 w-4'} />, title: 'Checklist', linePrefix: '- [ ] ' },
  { icon: <Quote className={'h-4 w-4'} />, title: 'Trích dẫn', linePrefix: '> ' },
  { icon: <Code className={'h-4 w-4'} />, title: 'Code', wrap: ['`', '`'] },
  {
    icon: <TableIcon className={'h-4 w-4'} />,
    title: 'Chèn bảng',
    insert:
      '\n| Cột 1 | Cột 2 | Cột 3 |\n| --- | --- | --- |\n| Ô 1 | Ô 2 | Ô 3 |\n| Ô 4 | Ô 5 | Ô 6 |\n',
  },
  { icon: <Link2 className={'h-4 w-4'} />, title: 'Chèn liên kết', wrap: ['[', '](https://...)'] },
  { icon: <ImageIcon className={'h-4 w-4'} />, title: 'Chèn ảnh (URL)', insert: '\n![mô tả ảnh](https://...)\n' },
  { icon: <Minus className={'h-4 w-4'} />, title: 'Kẻ ngang', insert: '\n---\n' },
];

export function MarkdownEditor({
  name,
  label,
  defaultValue = '',
  rows = 8,
  required,
  placeholder,
  helpText,
  maxLength,
}: {
  /** name trên textarea — giá trị markdown gửi cùng form. */
  name: string;
  label?: string;
  defaultValue?: string;
  rows?: number;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  maxLength?: number;
}) {
  const [value, setValue] = useState(defaultValue);
  const [showPreview, setShowPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function applyAction(action: EditorAction) {
    const el = textareaRef.current;

    if (!el) {
      return;
    }

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end);
    let next = value;
    let cursorStart = start;
    let cursorEnd = end;

    if (action.wrap) {
      const [before, after] = action.wrap;
      next = value.slice(0, start) + before + (selected || 'văn bản') + after + value.slice(end);
      cursorStart = start + before.length;
      cursorEnd = cursorStart + (selected || 'văn bản').length;
    } else if (action.linePrefix) {
      // thêm prefix vào từng dòng của vùng chọn (hoặc dòng hiện tại)
      const lineStart = value.lastIndexOf('\n', start - 1) + 1;
      const lineEnd = value.indexOf('\n', end) === -1 ? value.length : value.indexOf('\n', end);
      const block = value.slice(lineStart, lineEnd);
      const prefixed = block
        .split('\n')
        .map((line) => (line.trim() ? action.linePrefix + line : line))
        .join('\n');
      next = value.slice(0, lineStart) + prefixed + value.slice(lineEnd);
      cursorStart = lineStart + prefixed.length;
      cursorEnd = cursorStart;
    } else if (action.insert) {
      next = value.slice(0, end) + action.insert + value.slice(end);
      cursorStart = end + action.insert.length;
      cursorEnd = cursorStart;
    }

    setValue(next);

    // khôi phục vùng chọn sau khi React render lại textarea
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(cursorStart, cursorEnd);
    });
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    // phím tắt kiểu Word: Ctrl+B / Ctrl+I
    if (!(event.ctrlKey || event.metaKey)) {
      return;
    }

    const action =
      event.key.toLowerCase() === 'b'
        ? ACTIONS[0]
        : event.key.toLowerCase() === 'i'
          ? ACTIONS[1]
          : undefined;

    if (action) {
      event.preventDefault();
      applyAction(action);
    }
  }

  return (
    <div className={'grid gap-1.5'}>
      {label ? (
        <Label>
          {label}
          {required ? <span className={'text-destructive'}> *</span> : null}
        </Label>
      ) : null}

      <div
        className={cn(
          'border-input rounded-lg border',
          'focus-within:ring-ring/50 focus-within:border-ring focus-within:ring-3',
        )}
      >
        {/* ── Thanh công cụ ─────────────────────────────── */}
        <div
          className={
            'bg-muted/50 flex flex-wrap items-center gap-0.5 border-b p-1.5'
          }
        >
          {ACTIONS.map((action) => (
            <button
              key={action.title}
              type={'button'}
              title={action.title}
              aria-label={action.title}
              disabled={showPreview}
              onClick={() => applyAction(action)}
              className={cn(
                'hover:bg-accent hover:text-accent-foreground inline-flex h-7 w-7 items-center justify-center rounded-md',
                'text-muted-foreground disabled:pointer-events-none disabled:opacity-40',
              )}
            >
              {action.icon}
            </button>
          ))}

          <span className={'flex-1'} />

          <button
            type={'button'}
            onClick={() => setShowPreview((prev) => !prev)}
            className={cn(
              'inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors',
              showPreview
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-accent hover:text-accent-foreground text-muted-foreground',
            )}
          >
            {showPreview ? (
              <>
                <PencilLine className={'h-3.5 w-3.5'} aria-hidden={true} />
                Soạn thảo
              </>
            ) : (
              <>
                <Eye className={'h-3.5 w-3.5'} aria-hidden={true} />
                Xem trước
              </>
            )}
          </button>
        </div>

        {/* ── Soạn thảo / Xem trước ─────────────────────── */}
        {showPreview ? (
          <div className={'min-h-32 p-3'}>
            {value.trim() ? (
              <MarkdownPreview value={value} />
            ) : (
              <p className={'text-muted-foreground text-sm italic'}>
                Chưa có nội dung để xem trước.
              </p>
            )}
          </div>
        ) : (
          <Textarea
            ref={textareaRef}
            name={name}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={onKeyDown}
            rows={rows}
            required={required}
            maxLength={maxLength}
            placeholder={placeholder}
            className={'rounded-t-none border-0 font-mono text-[13px] shadow-none focus-visible:ring-0'}
          />
        )}
      </div>

      {helpText ? (
        <p className={'text-muted-foreground text-xs'}>{helpText}</p>
      ) : null}
    </div>
  );
}


