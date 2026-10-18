'use client';

import {
  createContext,
  useCallback,
  useContext,
  useState,
  useTransition,
} from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { PasswordSignInContainer } from '@kit/auth/sign-in';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@kit/ui/dialog';

import pathsConfig from '~/config/paths.config';

type OpenModalOptions = {
  title?: string;
  description?: string;
  onSuccess?: () => void | Promise<void>;
};

type AuthModalContextType = {
  openSignInModal: (options?: OpenModalOptions) => void;
  closeSignInModal: () => void;
};

const AuthModalContext = createContext<AuthModalContextType | null>(null);

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error('useAuthModal must be used within an AuthModalProvider');
  }
  return context;
}

export function AuthModalProvider({ children }: React.PropsWithChildren) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [modalOptions, setModalOptions] = useState<OpenModalOptions>({});

  const openSignInModal = useCallback((options?: OpenModalOptions) => {
    setModalOptions(options ?? {});
    setIsOpen(true);
  }, []);

  const closeSignInModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleSignInSuccess = useCallback(async () => {
    toast.success('Đăng nhập thành công!');
    setIsOpen(false);

    if (modalOptions.onSuccess) {
      try {
        await modalOptions.onSuccess();
      } catch {
        // ignore callback error
      }
    }

    startTransition(() => {
      router.refresh();
    });
  }, [modalOptions, router]);

  const signUpHref =
    typeof window !== 'undefined'
      ? `${pathsConfig.auth.signUp}?next=${encodeURIComponent(
          window.location.pathname + window.location.search,
        )}`
      : pathsConfig.auth.signUp;

  return (
    <AuthModalContext.Provider value={{ openSignInModal, closeSignInModal }}>
      {children}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className={'sm:max-w-md'}>
          <DialogHeader>
            <DialogTitle>
              {modalOptions.title ?? 'Đăng nhập vào Công Thức Việt'}
            </DialogTitle>
            <DialogDescription>
              {modalOptions.description ??
                'Đăng nhập để lưu món yêu thích, đánh giá công thức và tham gia hỏi đáp cùng cộng đồng.'}
            </DialogDescription>
          </DialogHeader>

          <div className={'mt-2'}>
            <PasswordSignInContainer onSignIn={handleSignInSuccess} />
          </div>

          <div className={'mt-4 text-center text-sm text-muted-foreground'}>
            {'Chưa có tài khoản? '}
            <Link
              href={signUpHref}
              onClick={() => setIsOpen(false)}
              className={
                'font-medium text-primary underline-offset-4 hover:underline'
              }
            >
              {'Đăng ký ngay'}
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </AuthModalContext.Provider>
  );
}
