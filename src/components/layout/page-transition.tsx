'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { ReactNode, useEffect, useState } from 'react'

interface PageTransitionProps {
  children: ReactNode
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 12,
    scale: 0.99
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1
  },
  out: {
    opacity: 0,
    y: -8,
    scale: 1.01
  }
}

const pageTransition = {
  type: 'tween',
  ease: [0.22, 1, 0.36, 1], // Premium easing curve
  duration: 0.35
}

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()
  const [displayChildren, setDisplayChildren] = useState(children)
  const [previousPathname, setPreviousPathname] = useState(pathname)

  // Update children when pathname changes to ensure proper re-rendering
  useEffect(() => {
    if (pathname !== previousPathname) {
      setDisplayChildren(children)
      setPreviousPathname(pathname)
    }
  }, [pathname, previousPathname, children])

  return (
    <div className="relative">
      <AnimatePresence
        mode="wait"
        initial={false}
        onExitComplete={() => {
          // Force a re-render after exit animation completes
          setDisplayChildren(children)
        }}
      >
        <motion.div
          key={pathname}
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
          className="will-change-transform page-transition"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'translateZ(0)' // Force hardware acceleration
          }}
        >
          {displayChildren}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}