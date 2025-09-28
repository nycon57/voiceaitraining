'use client';

import { motion } from 'framer-motion';
import { Mic, TrendingUp, Users } from 'lucide-react';
import Logo from '@/components/layout/logo';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-background via-background/95 to-background/90">
      {/* Enhanced Background Gradient Layers - More Sophisticated */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--chart-1)]/8 via-[var(--chart-2)]/4 to-[var(--chart-3)]/8 dark:from-[var(--chart-1)]/12 dark:via-[var(--chart-2)]/6 dark:to-[var(--chart-3)]/12" />
      <div className="absolute inset-0 bg-gradient-to-tl from-[var(--chart-2)]/6 via-transparent to-[var(--chart-1)]/4 dark:from-[var(--chart-2)]/10 dark:to-[var(--chart-1)]/8" />
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[var(--chart-3)]/3 to-transparent dark:via-[var(--chart-3)]/6" />

      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />

      {/* Enhanced Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-40 h-40 rounded-full bg-gradient-to-br from-[var(--chart-1)]/10 via-[var(--chart-2)]/8 to-[var(--chart-3)]/10 dark:from-[var(--chart-1)]/15 dark:via-[var(--chart-2)]/12 dark:to-[var(--chart-3)]/15 blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-40 right-20 w-32 h-32 rounded-full bg-gradient-to-br from-[var(--chart-2)]/8 via-[var(--chart-3)]/10 to-[var(--chart-1)]/8 dark:from-[var(--chart-2)]/12 dark:via-[var(--chart-3)]/15 dark:to-[var(--chart-1)]/12 blur-2xl"
          animate={{
            x: [0, -25, 0],
            y: [0, 25, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        <motion.div
          className="absolute bottom-40 left-1/4 w-24 h-24 rounded-full bg-gradient-to-br from-[var(--chart-3)]/10 via-[var(--chart-1)]/8 to-[var(--chart-2)]/10 dark:from-[var(--chart-3)]/15 dark:via-[var(--chart-1)]/12 dark:to-[var(--chart-2)]/15 blur-xl"
          animate={{
            x: [0, 15, 0],
            y: [0, -15, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>

      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Enhanced Branding */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12 relative">
          <motion.div
            className="max-w-lg text-center space-y-8"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <Logo className="w-auto mx-auto" />

            <motion.h1
              className="text-4xl lg:text-5xl font-headline font-bold text-balance leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Perfect your{' '}
              <span className="text-gradient">sales pitch</span>{' '}
              with AI
            </motion.h1>

            <motion.p
              className="text-lg text-foreground/80 dark:text-foreground/90 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Train with AI voice agents in realistic sales scenarios.
              Get instant feedback and improve your conversion rates.
            </motion.p>

            {/* Enhanced Feature highlights */}
            <motion.div
              className="space-y-4 pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {[
                { icon: Mic, title: "AI Voice Training", desc: "Practice with realistic voice agents" },
                { icon: TrendingUp, title: "Performance Analytics", desc: "Track your improvement over time" },
                { icon: Users, title: "Team Management", desc: "Manage and coach your entire sales team" }
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className="flex items-center gap-4 p-4 rounded-xl bg-background/60 dark:bg-background/40 backdrop-blur-lg border border-foreground/8 dark:border-white/8 shadow-lg dark:shadow-xl hover:bg-background/70 dark:hover:bg-background/50 transition-all duration-300 group"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                >
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[var(--chart-1)] via-[var(--chart-2)] to-[var(--chart-3)] flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-sm text-foreground">{feature.title}</h3>
                    <p className="text-xs text-foreground/70 dark:text-foreground/80 leading-relaxed">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Right Side - Enhanced Auth Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <motion.div
            className="w-full max-w-md"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Enhanced Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <Logo className="w-auto mx-auto mb-4" />
              <h2 className="text-2xl font-headline font-bold text-foreground">Welcome to SpeakStride</h2>
              <p className="text-foreground/70 dark:text-foreground/80 mt-2 leading-relaxed">
                Sign in to start training with AI voice agents
              </p>
            </div>

            {/* Enhanced Auth Card */}
            <motion.div
              className="relative group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {/* Enhanced Card Background with Glass Morphism */}
              <div className="absolute inset-0 bg-background/90 dark:bg-background/80 backdrop-blur-2xl rounded-2xl border border-foreground/10 dark:border-white/15 shadow-2xl dark:shadow-3xl" />
              <div className="absolute inset-0 bg-gradient-to-br from-foreground/[0.02] via-transparent to-[var(--chart-1)]/[0.02] dark:from-white/[0.03] dark:to-[var(--chart-1)]/[0.03] rounded-2xl" />
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[var(--chart-2)]/[0.01] to-transparent dark:via-[var(--chart-2)]/[0.02] rounded-2xl" />

              <div className="relative p-8">
                {children}
              </div>
            </motion.div>

            {/* Enhanced Bottom Text */}
            <motion.p
              className="text-center text-sm text-foreground/60 dark:text-foreground/70 mt-6 font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Trusted by <span className="text-gradient font-semibold">500+</span> sales teams worldwide
            </motion.p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}