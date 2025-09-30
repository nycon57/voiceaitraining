'use client';

import { motion } from 'framer-motion';
import {
  Github,
  Linkedin,
  Twitter,
  Youtube,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  Mic,
  BarChart3,
  Users,
  BookOpen
} from 'lucide-react';
import { Link } from 'next-view-transitions';
import React from 'react';

import Logo from '@/components/layout/logo';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface FooterLinkProps {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}

const FooterLink = ({ href, children, external = false }: FooterLinkProps) => (
  <Link
    href={href}
    className="text-muted-foreground hover:text-foreground transition-colors duration-200"
    {...(external && { target: '_blank', rel: 'noopener noreferrer' })}
  >
    {children}
  </Link>
);

interface SocialLinkProps {
  href: string;
  icon: React.ComponentType<any>;
  label: string;
}

const SocialLink = ({ href, icon: Icon, label }: SocialLinkProps) => (
  <Link
    href={href}
    className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted hover:bg-accent transition-colors duration-200 group"
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
  >
    <Icon className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors duration-200" />
  </Link>
);

const COMPANY_LINKS = [
  { href: '/about', label: 'About' },
  { href: '/careers', label: 'Careers' },
  { href: '/press', label: 'Press' },
  { href: '/contact', label: 'Contact' },
];

const PLATFORM_LINKS = [
  { href: '/platform', label: 'Features', icon: Mic },
  { href: '/pricing', label: 'Pricing', icon: BarChart3 },
  { href: '/integrations', label: 'Integrations', icon: Users },
  { href: '/api', label: 'API', icon: BookOpen },
];

const RESOURCES_LINKS = [
  { href: '/docs', label: 'Documentation' },
  { href: '/blog', label: 'Blog' },
  { href: '/help', label: 'Help Center' },
  { href: '/community', label: 'Community' },
];

const LEGAL_LINKS = [
  { href: '/legal/privacy', label: 'Privacy Policy' },
  { href: '/legal/terms', label: 'Terms of Service' },
  { href: '/legal/cookies', label: 'Cookie Policy' },
  { href: '/legal/disclaimers', label: 'Disclaimers' },
];

const SOCIAL_LINKS = [
  { href: 'https://linkedin.com/company/voice-ai-training', icon: Linkedin, label: 'LinkedIn' },
  { href: 'https://twitter.com/speakstride', icon: Twitter, label: 'Twitter' },
  { href: 'https://youtube.com/@speakstride', icon: Youtube, label: 'YouTube' },
  { href: 'https://github.com/voice-ai-training', icon: Github, label: 'GitHub' },
];

export default function Footer() {
  return (
    <footer className="relative">
      {/* CTA Section */}
      <section className="relative overflow-hidden">
        {/* Enhanced Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--chart-1)]/20 via-[var(--chart-2)]/10 to-[var(--chart-3)]/20 animate-pulse [animation-duration:8s]" />

        {/* Secondary Gradient Layer */}
        <div className="absolute inset-0 bg-gradient-to-tl from-[var(--chart-2)]/10 via-transparent to-[var(--chart-1)]/15" />

        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] [background-size:24px_24px] opacity-30" />

        <div className="relative container section-padding">
          <motion.div
            className="text-center max-w-4xl mx-auto space-y-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            {/* Badge */}
            <motion.div
              className="inline-flex items-center rounded-full border px-4 py-2 text-sm bg-background/30 backdrop-blur-md border-white/10"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <span className="bg-gradient-to-r from-[var(--chart-1)] to-[var(--chart-2)] bg-clip-text text-transparent font-medium">
                🚀 Ready to Transform Your Sales Training?
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h2
              className="font-headline text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Start training with{' '}
              <span className="text-gradient">AI voice agents</span>{' '}
              today
            </motion.h2>

            {/* Description */}
            <motion.p
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              Join 500+ sales teams already using SpeakStride to improve their performance and close more deals.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <Button size="lg" className="min-w-48 group bg-gradient-to-r from-[var(--chart-1)] to-[var(--chart-2)] hover:from-[var(--chart-1)]/90 hover:to-[var(--chart-2)]/90 border-0 text-white font-medium">
                Start Free Trial
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
              </Button>
              <Button size="lg" variant="outline" className="min-w-48 bg-background/20 backdrop-blur-sm border-white/20 hover:bg-background/30">
                Book a Demo
              </Button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                14-day free trial
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-chart-1/50" />
                Setup in 5 minutes
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Separator className="opacity-20" />

      {/* Footer Content */}
      <div className="container py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-6">
            <Logo className="w-auto" />
            <p className="text-muted-foreground max-w-sm">
              Empowering sales teams with AI-powered voice training simulations.
              Practice, learn, and excel in realistic sales scenarios.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                hello@speakstride.com
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                +1 (555) 123-4567
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                San Francisco, CA
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              {SOCIAL_LINKS.map((social) => (
                <SocialLink key={social.label} {...social} />
              ))}
            </div>
          </div>

          {/* Company */}
          <div className="space-y-6">
            <h3 className="font-headline text-sm font-semibold tracking-wide uppercase">Company</h3>
            <ul className="space-y-3">
              {COMPANY_LINKS.map((link) => (
                <li key={link.href}>
                  <FooterLink href={link.href}>{link.label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform */}
          <div className="space-y-6">
            <h3 className="font-headline text-sm font-semibold tracking-wide uppercase">Platform</h3>
            <ul className="space-y-3">
              {PLATFORM_LINKS.map((link) => (
                <li key={link.href} className="flex items-center gap-2">
                  <link.icon className="w-4 h-4 text-muted-foreground" />
                  <FooterLink href={link.href}>{link.label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-6">
            <h3 className="font-headline text-sm font-semibold tracking-wide uppercase">Resources</h3>
            <ul className="space-y-3">
              {RESOURCES_LINKS.map((link) => (
                <li key={link.href}>
                  <FooterLink href={link.href}>{link.label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-6">
            <h3 className="font-headline text-sm font-semibold tracking-wide uppercase">Legal</h3>
            <ul className="space-y-3">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <FooterLink href={link.href}>{link.label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <Separator className="opacity-20" />

      {/* Bottom Bar */}
      <div className="container py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            © 2024 SpeakStride. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm">
            <FooterLink href="/sitemap">Sitemap</FooterLink>
            <FooterLink href="/status">Status</FooterLink>
            <FooterLink href="/accessibility">Accessibility</FooterLink>
          </div>
        </div>
      </div>
    </footer>
  );
}