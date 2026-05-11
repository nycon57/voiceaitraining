"use client";

import { cn } from "@/lib/utils";
import { m as motion, MotionProps } from "motion/react";
import { useCallback, useRef, useState } from "react";

interface TypingAnimationProps extends MotionProps {
  children: string;
  className?: string;
  duration?: number;
  delay?: number;
  as?: React.ElementType;
  startOnView?: boolean;
}

export function TypingAnimation({
  children,
  className,
  duration = 100,
  delay = 0,
  as: Component = "div",
  startOnView = false,
  ...props
}: TypingAnimationProps) {
  const MotionComponent = motion.create(Component, {
    forwardMotionProps: true,
  });

  const [displayedText, setDisplayedText] = useState<string>("");
  const elementRef = useRef<HTMLElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const startTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingEffectRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTypingTimers = useCallback(() => {
    if (startTimeoutRef.current) {
      clearTimeout(startTimeoutRef.current);
      startTimeoutRef.current = null;
    }
    if (typingEffectRef.current) {
      clearInterval(typingEffectRef.current);
      typingEffectRef.current = null;
    }
  }, []);

  const startTyping = useCallback(() => {
    clearTypingTimers();
    setDisplayedText("");

    startTimeoutRef.current = setTimeout(() => {
      let i = 0;
      typingEffectRef.current = setInterval(() => {
        if (i < children.length) {
          setDisplayedText(children.substring(0, i + 1));
          i++;
        } else {
          clearTypingTimers();
        }
      }, duration);
    }, delay);
  }, [children, clearTypingTimers, delay, duration]);

  const setTypingRef = useCallback(
    (node: HTMLElement | null) => {
      observerRef.current?.disconnect();
      clearTypingTimers();
      elementRef.current = node;

      if (!node) return;

      if (!startOnView) {
        startTyping();
        return;
      }

      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            startTyping();
            observerRef.current?.disconnect();
            observerRef.current = null;
          }
        },
        { threshold: 0.1 },
      );
      observerRef.current.observe(node);
    },
    [clearTypingTimers, startOnView, startTyping],
  );

  return (
    <MotionComponent
      ref={setTypingRef}
      className={cn(
        "text-4xl font-bold leading-[5rem] tracking-[-0.02em]",
        className,
      )}
      {...props}
    >
      {displayedText}
    </MotionComponent>
  );
}
