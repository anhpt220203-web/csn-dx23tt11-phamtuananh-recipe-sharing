'use client';

import { useActionState, useEffect, useState } from 'react';
import { MessageSquare, Pencil } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@kit/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@kit/ui/dialog';
import { Label } from '@kit/ui/label';

import { MarkdownEditor } from '~/components/markdown/markdown-editor';

import {
  answerQuestionAction,
  deleteQuestionAction,
} from '../actions';
import { ANSWER_ACTION_INITIAL } from '../hoi-dap-constants';

function FormError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p role={'alert'} className={'text-destructive text-xs'}>
      {message}
    </p>
  );
}

export function AnswerQuestionModal({
  id,
  question,
  recipeTitle,
  currentAnswer,
  open,
  onOpenChange,
}: {
  id: number;
  question: string;
  recipeTitle?: string;
  currentAnswer: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [answerState, answerAction, answerPending] = useActionState(
    answerQuestionAction,
    ANSWER_ACTION_INITIAL,
  );

  useEffect(() => {
    if (answerState.ok) {
      toast.success(currentAnswer ? 'Đã cập nhật câu trả lời!' : 'Đã gửi câu trả lời thành công!');
      onOpenChange(false);
    }
  }, [answerState, currentAnswer, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={'sm:max-w-lg max-h-[90vh] overflow-y-auto'}>
        <DialogHeader>
          <DialogTitle>
            {currentAnswer ? 'Sửa câu trả lời' : 'Trả lời câu hỏi'}
          </DialogTitle>
          <DialogDescription>
            {recipeTitle ? `Dành cho món: ${recipeTitle}` : 'Câu hỏi từ người dùng'}
          </DialogDescription>
        </DialogHeader>

        <div className={'space-y-4 pt-2'}>
          <div className={'rounded-lg border bg-muted/40 p-3 text-sm'}>
            <p className={'text-xs font-semibold uppercase tracking-wider text-muted-foreground'}>
              Câu hỏi:
            </p>
            <p className={'mt-1 font-medium text-foreground'}>{question}</p>
          </div>

          <form action={answerAction} className={'space-y-4'}>
            <input type={'hidden'} name={'id'} value={id} />

            <div className={'grid gap-1.5'}>
              <Label htmlFor={`answer-${id}`}>Nội dung câu trả lời *</Label>
              <MarkdownEditor
                name={'answer'}
                label={'Câu trả lời (hỗ trợ Markdown)'}
                rows={7}
                required
                defaultValue={currentAnswer ?? ''}
                placeholder={'Nhập câu trả lời chi tiết, hướng dẫn cho người dùng...'}
                helpText={'Có thể in đậm, tạo danh sách, bảng... câu trả lời hiển thị đúng định dạng.'}
              />
            </div>

            <FormError message={answerState.ok ? undefined : answerState.message} />

            <div className={'flex justify-end gap-2'}>
              <Button
                type={'button'}
                variant={'outline'}
                onClick={() => onOpenChange(false)}
                disabled={answerPending}
              >
                Hủy
              </Button>
              <Button type={'submit'} disabled={answerPending}>
                {answerPending ? 'Đang lưu...' : 'Lưu câu trả lời'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function QuestionRowActions({
  id,
  question,
  recipeTitle,
  currentAnswer,
}: {
  id: number;
  question: string;
  recipeTitle?: string;
  currentAnswer: string | null;
}) {
  const [modalOpen, setModalOpen] = useState(false);

  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteQuestionAction,
    ANSWER_ACTION_INITIAL,
  );

  useEffect(() => {
    if (deleteState.ok) {
      toast.success('Đã xóa câu hỏi thành công!');
    }
  }, [deleteState]);

  return (
    <>
      <div className={'flex shrink-0 items-center gap-2'}>
        <Button
          type={'button'}
          variant={'outline'}
          size={'sm'}
          onClick={() => setModalOpen(true)}
          className={'gap-1'}
          title={currentAnswer ? 'Sửa câu trả lời' : 'Trả lời câu hỏi'}
        >
          {currentAnswer ? (
            <>
              <Pencil className={'h-3.5 w-3.5'} />
              <span>Sửa trả lời</span>
            </>
          ) : (
            <>
              <MessageSquare className={'h-3.5 w-3.5'} />
              <span>Trả lời</span>
            </>
          )}
        </Button>

        <form
          action={deleteAction}
          onSubmit={(e) => {
            if (!window.confirm('Xóa câu hỏi này? Hành động này không thể hoàn tác.')) {
              e.preventDefault();
            }
          }}
        >
          <input type={'hidden'} name={'id'} value={id} />
          <Button
            type={'submit'}
            variant={'destructive'}
            size={'sm'}
            disabled={deletePending}
          >
            {deletePending ? 'Đang xóa...' : 'Xóa'}
          </Button>
        </form>

        <FormError message={deleteState.ok ? undefined : deleteState.message} />
      </div>

      <AnswerQuestionModal
        id={id}
        question={question}
        recipeTitle={recipeTitle}
        currentAnswer={currentAnswer}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  );
}
