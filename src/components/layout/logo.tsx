import { Link } from 'next-view-transitions';

import { cn } from '@/lib/utils';

interface LogoProps {
  iconClassName?: string;
  wordmarkClassName?: string;
  className?: string;
  href?: string;
  noLink?: boolean;
}

export default function Logo({
  iconClassName,
  wordmarkClassName,
  className,
  href = '/',
  noLink = false,
}: LogoProps) {
  const Element = noLink ? 'div' : Link;

  return (
    <Element
      href={href}
      className={cn(
        'font-headline text-xl font-semibold tracking-tight',
        className,
      )}
      suppressHydrationWarning
    >
      <span className={cn('', wordmarkClassName)}>
        <span className="text-foreground">Speak</span>
        <span className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent font-medium">Stride</span>
      </span>
    </Element>
  );
}
