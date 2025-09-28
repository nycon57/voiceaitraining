'use client';

import * as React from 'react';
import { GripVerticalIcon } from 'lucide-react';
import * as ResizablePrimitive from 'react-resizable-panels';
import { motion } from 'framer-motion';

import { cn } from '@/lib/utils';

interface ResizablePanelGroupProps
  extends React.ComponentProps<typeof ResizablePrimitive.PanelGroup> {
  animated?: boolean;
}

interface ResizableHandleProps
  extends React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> {
  withHandle?: boolean;
  variant?: 'default' | 'accent' | 'subtle';
  animated?: boolean;
}

function ResizablePanelGroup({
  className,
  animated = true,
  ...props
}: ResizablePanelGroupProps) {
  const variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  };

  if (animated) {
    return (
      <motion.div
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.3 }}
        className="h-full w-full"
      >
        <ResizablePrimitive.PanelGroup
          data-slot="resizable-panel-group"
          className={cn(
            'flex h-full w-full data-[panel-group-direction=vertical]:flex-col transition-all duration-200',
            className
          )}
          {...props}
        />
      </motion.div>
    );
  }

  return (
    <ResizablePrimitive.PanelGroup
      data-slot="resizable-panel-group"
      className={cn(
        'flex h-full w-full data-[panel-group-direction=vertical]:flex-col',
        className
      )}
      {...props}
    />
  );
}

function ResizablePanel({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.Panel>) {
  return (
    <ResizablePrimitive.Panel
      data-slot="resizable-panel"
      className={cn('transition-all duration-200', className)}
      {...props}
    >
      {children}
    </ResizablePrimitive.Panel>
  );
}

const handleVariants = {
  default: 'bg-border hover:bg-border/80',
  accent: 'bg-accent hover:bg-accent/80',
  subtle: 'bg-muted hover:bg-muted/80',
};

function ResizableHandle({
  withHandle = false,
  className,
  variant = 'default',
  animated = true,
  ...props
}: ResizableHandleProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);

  return (
    <ResizablePrimitive.PanelResizeHandle
      data-slot="resizable-handle"
      className={cn(
        'focus-visible:ring-ring relative flex w-px items-center justify-center after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:translate-x-0 data-[panel-group-direction=vertical]:after:-translate-y-1/2 [&[data-panel-group-direction=vertical]>div]:rotate-90 transition-all duration-200',
        handleVariants[variant],
        'hover:bg-accent cursor-col-resize data-[panel-group-direction=vertical]:cursor-row-resize',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={() => setIsDragging(true)}
      onMouseUp={() => setIsDragging(false)}
      {...props}
    >
      {withHandle && (
        <motion.div
          className={cn(
            'z-10 flex h-4 w-3 items-center justify-center rounded-xs border shadow-sm',
            'bg-background border-border',
            isHovered && 'bg-accent border-accent-foreground/20',
            isDragging && 'bg-accent/80'
          )}
          animate={animated ? {
            scale: isHovered ? 1.1 : 1,
            opacity: isHovered || isDragging ? 1 : 0.7,
          } : {}}
          transition={{ duration: 0.2 }}
        >
          <GripVerticalIcon className="size-2.5 text-muted-foreground" />
        </motion.div>
      )}
    </ResizablePrimitive.PanelResizeHandle>
  );
}

// Enhanced ResizableContainer for common use cases
interface ResizableContainerProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'horizontal' | 'vertical';
  animated?: boolean;
}

function ResizableContainer({
  children,
  className,
  direction = 'horizontal',
  animated = true,
}: ResizableContainerProps) {
  return (
    <div className={cn('h-full w-full overflow-hidden rounded-lg border', className)}>
      <ResizablePanelGroup direction={direction} animated={animated}>
        {children}
      </ResizablePanelGroup>
    </div>
  );
}

// Enhanced ResizableSection for sidebar patterns
interface ResizableSectionProps {
  children: React.ReactNode;
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
  collapsible?: boolean;
  className?: string;
}

function ResizableSection({
  children,
  defaultSize,
  minSize,
  maxSize,
  collapsible = false,
  className,
}: ResizableSectionProps) {
  return (
    <ResizablePanel
      defaultSize={defaultSize}
      minSize={minSize}
      maxSize={maxSize}
      collapsible={collapsible}
      className={cn('bg-background border-r', className)}
    >
      <div className="h-full p-4 overflow-auto">
        {children}
      </div>
    </ResizablePanel>
  );
}

export {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
  ResizableContainer,
  ResizableSection,
};