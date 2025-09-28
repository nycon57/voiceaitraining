"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { List, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface Heading {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  headings: Heading[]
  className?: string
}

export function TableOfContents({ headings, className }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      {
        rootMargin: '-80px 0px -80% 0px',
        threshold: 0.1,
      }
    )

    // Add IDs to headings and observe them
    headings.forEach((heading) => {
      const element = document.querySelector(`h${heading.level}`)
      if (element && !element.id) {
        element.id = heading.id
      }
      if (element) {
        observer.observe(element)
      }
    })

    return () => observer.disconnect()
  }, [headings])

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const offset = 100 // Account for fixed header
      const elementPosition = element.offsetTop - offset
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth',
      })
    }
  }

  if (headings.length === 0) {
    return null
  }

  return (
    <Card className={cn("border-0 shadow-lg bg-card/80 backdrop-blur-sm", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <List className="w-4 h-4" />
          Table of Contents
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <nav className="space-y-1">
          {headings.map((heading) => (
            <motion.button
              key={heading.id}
              onClick={() => scrollToHeading(heading.id)}
              className={cn(
                "group flex items-start gap-2 w-full text-left p-2 rounded-lg transition-all duration-200 text-sm",
                "hover:bg-purple-50 hover:text-purple-700",
                activeId === heading.id
                  ? "bg-gradient-to-r from-purple-50 to-magenta-50 text-purple-700 font-medium border-l-2 border-purple-500"
                  : "text-muted-foreground hover:text-foreground",
                heading.level > 2 && "ml-4"
              )}
              style={{
                marginLeft: `${(heading.level - 1) * 0.75}rem`,
              }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <ChevronRight
                className={cn(
                  "w-3 h-3 mt-0.5 transition-transform shrink-0",
                  activeId === heading.id
                    ? "rotate-90 text-purple-600"
                    : "group-hover:rotate-90 group-hover:text-purple-600"
                )}
              />
              <span className="leading-relaxed break-words">
                {heading.text}
              </span>
            </motion.button>
          ))}
        </nav>
      </CardContent>
    </Card>
  )
}