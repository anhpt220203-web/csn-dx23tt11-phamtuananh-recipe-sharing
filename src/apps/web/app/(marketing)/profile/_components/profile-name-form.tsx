'use client';

import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { useUpdateUser } from '@kit/supabase/hooks/use-update-user-mutation';
import { Button } from '@kit/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kit/ui/form';
import { Input } from '@kit/ui/input';

const DisplayNameSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập họ tên.')
    .max(80, 'Họ tên không được quá 80 ký tự.'),
});

/**
 * Form xem và sửa họ tên — lưu vào user_metadata của Supabase Auth
 * qua supabase.auth.updateUser({ data: { name } }).
 */
export function ProfileNameForm({ initialName }: { initialName: string }) {
  const router = useRouter();
  const updateUser = useUpdateUser();

  const form = useForm<z.infer<typeof DisplayNameSchema>>({
    resolver: zodResolver(DisplayNameSchema),
    defaultValues: {
      name: initialName,
    },
  });

  const onSubmit = async ({ name }: z.infer<typeof DisplayNameSchema>) => {
    try {
      await updateUser.mutateAsync({
        data: { name },
        redirectTo: '/profile',
      });

      toast.success('Đã cập nhật họ tên.');
      router.refresh();
    } catch {
      toast.error('Không cập nhật được họ tên. Vui lòng thử lại.');
    }
  };

  return (
    <Form {...form}>
      <form
        className={'flex flex-col gap-4'}
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          name={'name'}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Họ tên</FormLabel>

              <FormControl>
                <Input
                  type={'text'}
                  autoComplete={'name'}
                  placeholder={'Nhập họ tên của bạn'}
                  maxLength={80}
                  {...field}
                />
              </FormControl>

              <FormDescription>
                Tên này hiển thị trên trang hồ sơ và khi bạn tương tác với cộng
                đồng.
              </FormDescription>

              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <Button type={'submit'} disabled={updateUser.isPending}>
            {updateUser.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
