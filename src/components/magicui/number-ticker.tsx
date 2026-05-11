'use client';

import { useMotionValue, useMotionValueEvent, useSpring } from 'motion/react';
import { ComponentPropsWithoutRef, useCallback, useRef } from 'react';

import { cn } from '@/lib/utils';

interface NumberTickerProps extends ComponentPropsWithoutRef<'span'> {
  value: number;
  startValue?: number;
  direction?: 'up' | 'down';
  delay?: number;
  decimalPlaces?: number;
}

export function NumberTicker({
  value,
  startValue = 0,
  direction = 'up',
  delay = 0,
  className,
  decimalPlaces = 0,
  ...props
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const motionValue = useMotionValue(direction === 'down' ? value : startValue);
  const springValue = useSpring(motionValue, {
    damping: 60,
    stiffness: 100,
  });

  const startTicker = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      motionValue.set(direction === 'down' ? startValue : value);
    }, delay * 1000);
  }, [delay, direction, motionValue, startValue, value]);

  const setTickerRef = useCallback(
    (node: HTMLSpanElement | null) => {
      observerRef.current?.disconnect();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      ref.current = node;

      if (!node) return;

      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            startTicker();
            observerRef.current?.disconnect();
            observerRef.current = null;
          }
        },
        { threshold: 0.1 },
      );
      observerRef.current.observe(node);
    },
    [startTicker],
  );

  useMotionValueEvent(springValue, 'change', (latest) => {
    if (ref.current) {
      ref.current.textContent = Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces,
      }).format(Number(latest.toFixed(decimalPlaces)));
    }
  });

  return (
    <span ref={setTickerRef} className={cn('inline-block', className)} {...props}>
      {startValue}
    </span>
  );
}
