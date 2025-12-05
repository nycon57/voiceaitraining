"use client";

import * as React from 'react';
import { motion } from 'framer-motion';

import { cn } from '@/lib/utils';

interface CardProps extends React.ComponentProps<'div'> {
  animated?: boolean;
  variant?: 'default' | 'featured';
}

function Card({ className, animated = true, variant = 'default', ...props }: CardProps) {
  const cardVariants = {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -20, scale: 0.95 },
    hover: { y: -2, transition: { duration: 0.2 } }
  };

  const cardClasses = cn(
    'bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm',
    'hover:shadow-md transition-shadow duration-200',
    'backdrop-blur-sm bg-card/90',
    variant === 'featured' && [
      'border-transparent bg-gradient-to-br from-chart-1/10 via-transparent to-chart-3/10',
      'shadow-xl hover:shadow-2xl',
      'relative before:absolute before:inset-0 before:rounded-xl',
      'before:bg-gradient-to-r before:from-chart-1 before:via-chart-2 before:to-chart-3',
      'before:p-[2px] before:-z-10 before:content-[""]',
      'before:mask-composite:exclude before:[mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)]',
    ],
    className,
  );

  if (animated) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { onDrag, onDragEnd, onDragStart, ...motionProps } = props as any;
    return (
      <motion.div
        data-slot="card"
        className={cardClasses}
        variants={cardVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        whileHover="hover"
        transition={{ duration: 0.3, ease: "easeOut" }}
        {...motionProps}
      />
    );
  }

  return (
    <div
      data-slot="card"
      className={cardClasses}
      {...props}
    />
  );
}

interface CardHeaderProps extends React.ComponentProps<'div'> {
  animated?: boolean;
}

function CardHeader({ className, animated = true, ...props }: CardHeaderProps) {
  const headerVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  };

  const headerClasses = cn(
    '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6',
    className,
  );

  if (animated) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { onDrag, onDragEnd, onDragStart, ...motionProps } = props as any;
    return (
      <motion.div
        data-slot="card-header"
        className={headerClasses}
        variants={headerVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.3, ease: "easeOut", delay: 0.1 }}
        {...motionProps}
      />
    );
  }

  return (
    <div
      data-slot="card-header"
      className={headerClasses}
      {...props}
    />
  );
}

interface CardTitleProps extends React.ComponentProps<'div'> {
  isHeadline?: boolean;
}

function CardTitle({ className, isHeadline = true, ...props }: CardTitleProps) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        'leading-none font-semibold',
        isHeadline && 'font-headline',
        className
      )}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
        className,
      )}
      {...props}
    />
  );
}

interface CardContentProps extends React.ComponentProps<'div'> {
  animated?: boolean;
}

function CardContent({ className, animated = true, ...props }: CardContentProps) {
  const contentVariants = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -15 }
  };

  const contentClasses = cn('px-6', className);

  if (animated) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { onDrag, onDragEnd, onDragStart, ...motionProps } = props as any;
    return (
      <motion.div
        data-slot="card-content"
        className={contentClasses}
        variants={contentVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.3, ease: "easeOut", delay: 0.2 }}
        {...motionProps}
      />
    );
  }

  return (
    <div
      data-slot="card-content"
      className={contentClasses}
      {...props}
    />
  );
}

interface CardFooterProps extends React.ComponentProps<'div'> {
  animated?: boolean;
}

function CardFooter({ className, animated = true, ...props }: CardFooterProps) {
  const footerVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  };

  const footerClasses = cn('flex items-center px-6 [.border-t]:pt-6', className);

  if (animated) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { onDrag, onDragEnd, onDragStart, ...motionProps } = props as any;
    return (
      <motion.div
        data-slot="card-footer"
        className={footerClasses}
        variants={footerVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.3, ease: "easeOut", delay: 0.3 }}
        {...motionProps}
      />
    );
  }

  return (
    <div
      data-slot="card-footer"
      className={footerClasses}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
