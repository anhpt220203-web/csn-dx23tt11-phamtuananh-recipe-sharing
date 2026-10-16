import Link from 'next/link';

import { cn } from '@kit/ui/utils';

function LogoImage({
  className,
}: {
  className?: string;
  width?: number;
}) {
  return (
    <img
      src={'/images/logo-cong-thuc-mon-ngon.webp'}
      alt={'Công thức món ngon'}
      className={cn(`h-[36px] w-auto lg:h-[42px]`, className)}
    />
  );
}

export function AppLogo({
  href,
  label,
  className,
}: {
  href?: string | null;
  className?: string;
  label?: string;
}) {
  if (href === null) {
    return <LogoImage className={className} />;
  }

  return (
    <Link aria-label={label ?? 'Home Page'} href={href ?? '/'}>
      <LogoImage className={className} />
    </Link>
  );
}
