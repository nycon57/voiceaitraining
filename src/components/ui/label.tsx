"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

interface LabelProps extends React.ComponentProps<typeof LabelPrimitive.Root> {
  animated?: boolean;
  isHeadline?: boolean;
}

function Label({
  className,
  animated = true,
  isHeadline = false,
  ...props
}: LabelProps) {
  const labelVariants = {
    initial: { opacity: 0, x: -10 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 10 }
  };

  const labelClasses = cn(
    "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
    "transition-colors duration-200",
    isHeadline && "font-headline font-semibold text-base",
    className
  );

  if (animated) {
    return (
      <motion.div
        variants={labelVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <LabelPrimitive.Root
          data-slot="label"
          className={labelClasses}
          {...props}
        />
      </motion.div>
    );
  }

  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={labelClasses}
      {...props}
    />
  );
}

export { Label }
