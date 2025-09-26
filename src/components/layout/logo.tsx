import Link from 'next/link';

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
        'flex items-center gap-1.75 text-xl font-medium',
        className,
      )}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 40 30"
        fill="none"
        className={cn('w-7 object-contain', iconClassName)}
      >
        <path
          d="M20 2L8 14H14V20C14 22.2091 15.7909 24 18 24H22C24.2091 24 26 22.2091 26 20V14H32L20 2Z"
          fill="currentColor"
          className="text-primary"
        />
        <circle cx="20" cy="26" r="2" fill="currentColor" className="text-primary opacity-60" />
      </svg>
      <span className={cn('', wordmarkClassName)}>Voice AI Training</span>
    </Element>
  );
}
