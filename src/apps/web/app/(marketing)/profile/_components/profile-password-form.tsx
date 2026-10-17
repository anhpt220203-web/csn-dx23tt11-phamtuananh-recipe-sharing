'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { useUpdateUser } from '@kit/supabase/hooks/use-update-user-mutation';
import { Button } from '@kit/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kit/ui/form';
import { Input } from '@kit/ui/input';

const ChangePasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Mật khẩu phải có ít nhất 8 ký tự.')
      .max(99, 'Mật khẩu không được quá 99 ký tự.'),
    repeatPassword: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.repeatPassword) {
      ctx.addIssue({
        code: 'custom',
        path: ['repeatPassword'],
        message: 'Mật khẩu nhập lại không khớp.',
      });
    }
  });

/**
 * Form đổi mật khẩu — gọi `supabase.auth.updateUser({ password })`.
 */
export function ProfilePasswordForm() {
  const updateUser = useUpdateUser();

  const form = useForm<z.infer<typeof ChangePasswordSchema>>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: {
      password: '',
      repeatPassword: '',
    },
  });

  const onSubmit = async ({
    password,
  }: z.infer<typeof ChangePasswordSchema>) => {
    try {
      await updateUser.mutateAsync({
        password,
        redirectTo: '/profile',
      });

      toast.success('Đổi mật khẩu thành công.');
      form.reset();
    } catch {
      toast.error('Đổi mật khẩu thất bại. Vui lòng thử lại.');
    }
  };

  return (
    <Form {...form}>
      <form
        className={'flex flex-col gap-4'}
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          name={'password'}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mật khẩu mới</FormLabel>

              <FormControl>
                <Input
                  type={'password'}
                  autoComplete={'new-password'}
                  placeholder={'Nhập mật khẩu mới (ít nhất 8 ký tự)'}
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name={'repeatPassword'}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nhập lại mật khẩu mới</FormLabel>

              <FormControl>
                <Input
                  type={'password'}
                  autoComplete={'new-password'}
                  placeholder={'Nhập lại mật khẩu mới'}
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <Button type={'submit'} disabled={updateUser.isPending}>
            {updateUser.isPending ? 'Đang lưu...' : 'Đổi mật khẩu'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
