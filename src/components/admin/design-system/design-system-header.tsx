"use client"

import { motion } from "framer-motion"
import { Palette, Zap, Code2, Layers, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const features = [
  { icon: Palette, label: "Brand Foundation" },
  { icon: Zap, label: "Design Tokens" },
  { icon: Code2, label: "Components" },
  { icon: Layers, label: "Layout System" },
  { icon: Sparkles, label: "Interactions" },
]

export function DesignSystemHeader() {
  return (
    <div className="relative overflow-hidden border-b border-border/50 bg-gradient-to-b from-background via-background to-muted/10">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-black/[0.02] bg-[size:60px_60px] dark:bg-grid-white/[0.02]" />

      {/* Animated Gradient Orbs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-gradient-to-r from-secondary/10 via-accent/10 to-primary/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-gradient-to-r from-accent/10 via-primary/10 to-secondary/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />

      <div className="relative container mx-auto px-6 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <Badge
              variant="secondary"
              className="px-4 py-2 text-sm font-medium bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Design System v1.0
            </Badge>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl lg:text-6xl font-bold font-headline bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent mb-6"
          >
            SpeakStride
            <br />
            <span className="text-gradient">Design System</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed"
          >
            A comprehensive, world-class design system that powers the future of voice AI training.
            Built with precision, designed for scale, and crafted with love.
          </motion.p>

          {/* Feature Pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-3 mb-10"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                className="flex items-center gap-2 px-4 py-2 bg-card/80 backdrop-blur-sm border border-border/50 rounded-full text-sm text-muted-foreground hover:text-foreground hover:border-border transition-colors"
              >
                <feature.icon className="w-4 h-4" />
                {feature.label}
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Explore Components
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="px-8 py-3 text-base font-medium border-border/50 hover:border-border hover:bg-muted/50 transition-all duration-200"
            >
              Download Figma Kit
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

