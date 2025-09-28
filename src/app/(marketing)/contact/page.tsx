import { Metadata } from 'next';
import { Check, Mic, TrendingUp, Users } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const metadata: Metadata = {
  title: 'Contact Us | Audio Agent Sales Training',
  description: 'Get in touch with our team to learn how AI-powered sales training can transform your sales performance. We respond within 2 hours during business hours.',
  keywords: [
    'contact sales training',
    'AI sales coaching support',
    'enterprise sales software',
    'sales training platform contact',
    'voice AI sales training inquiry'
  ],
  openGraph: {
    title: 'Contact Us | Audio Agent Sales Training',
    description: 'Ready to transform your sales team? Contact our experts to learn about AI-powered sales training solutions.',
    type: 'website',
    url: 'https://speakstride.com/contact',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us | Audio Agent Sales Training',
    description: 'Ready to transform your sales team? Contact our experts to learn about AI-powered sales training solutions.',
  },
  alternates: {
    canonical: 'https://speakstride.com/contact',
  },
};

// Gradient SVG Component - matching PageHero style
function ContactGradient({ ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={800}
      height={600}
      fill="none"
      {...props}
    >
      <defs>
        <linearGradient
          id="contactGrad1"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#9259ED" />
          <stop offset="50%" stopColor="#CF54EE" />
          <stop offset="100%" stopColor="#FB8684" />
        </linearGradient>
        <linearGradient
          id="contactGrad2"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#FB07FF" />
          <stop offset="50%" stopColor="#FF6847" />
          <stop offset="100%" stopColor="#FF474A" />
        </linearGradient>
        <linearGradient
          id="contactGrad3"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#B956EE" />
          <stop offset="100%" stopColor="#9672FF" />
        </linearGradient>
      </defs>

      {/* Main gradient blob */}
      <ellipse
        cx="600"
        cy="200"
        rx="200"
        ry="150"
        fill="url(#contactGrad1)"
        opacity="0.6"
        transform="rotate(25 600 200)"
      />

      {/* Secondary gradient blob */}
      <ellipse
        cx="500"
        cy="350"
        rx="150"
        ry="100"
        fill="url(#contactGrad2)"
        opacity="0.4"
        transform="rotate(-15 500 350)"
      />

      {/* Accent gradient blob */}
      <ellipse
        cx="650"
        cy="100"
        rx="100"
        ry="80"
        fill="url(#contactGrad3)"
        opacity="0.3"
        transform="rotate(45 650 100)"
      />
    </svg>
  );
}

export default function ContactPage() {
  return (
    <section className="relative py-16 md:py-32 overflow-hidden">
      <div className="container px-4 sm:px-6 md:px-8 relative z-10">
        <div className="grid w-full grid-cols-1 gap-x-32 overflow-hidden lg:grid-cols-2">
          <div className="w-full pb-10 md:space-y-10 md:pb-0">
            <div className="space-y-4 md:max-w-[40rem]">
              <h1 className="font-headline text-5xl tracking-tight md:text-6xl lg:text-7xl">
                Transform your sales team with AI
              </h1>
              <div className="text-xl leading-relaxed text-muted-foreground">
                Book a personalized demo to see how our AI-powered voice training platform can boost your team's performance and close more deals.
              </div>
            </div>

            <div className="hidden md:block">
              <div className="space-y-16 pb-20 lg:pb-0">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <p className="text-sm font-semibold">What you can expect:</p>
                    <div className="flex items-center space-x-2.5">
                      <Check className="text-muted-foreground size-5 shrink-0" />
                      <p className="text-sm">
                        Live demo of AI-powered sales training scenarios
                      </p>
                    </div>
                    <div className="flex items-center space-x-2.5">
                      <Check className="text-muted-foreground size-5 shrink-0" />
                      <p className="text-sm">
                        Custom implementation strategy for your team
                      </p>
                    </div>
                    <div className="flex items-center space-x-2.5">
                      <Check className="text-muted-foreground size-5 shrink-0" />
                      <p className="text-sm">
                        Performance analytics and ROI insights
                      </p>
                    </div>
                    <div className="flex items-center space-x-2.5">
                      <Check className="text-muted-foreground size-5 shrink-0" />
                      <p className="text-sm">
                        Answers to all your questions about voice AI training
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 pt-8">
                    <p className="text-sm font-semibold">Why sales teams choose us:</p>
                    <div className="flex items-center space-x-2.5">
                      <Check className="text-primary size-5 shrink-0" />
                      <p className="text-sm">
                        40% increase in deal closure rates within 90 days
                      </p>
                    </div>
                    <div className="flex items-center space-x-2.5">
                      <Check className="text-primary size-5 shrink-0" />
                      <p className="text-sm">
                        24/7 AI training - no scheduling conflicts
                      </p>
                    </div>
                    <div className="flex items-center space-x-2.5">
                      <Check className="text-primary size-5 shrink-0" />
                      <p className="text-sm">
                        Real-time performance insights and coaching
                      </p>
                    </div>
                    <div className="flex items-center space-x-2.5">
                      <Check className="text-primary size-5 shrink-0" />
                      <p className="text-sm">
                        Enterprise-grade security and compliance
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-primary">15 minutes daily</div>
                    <div className="text-xs text-muted-foreground">Replaces: 60+ hours monthly training</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-primary">40% more deals</div>
                    <div className="text-xs text-muted-foreground">Replaces: $1M+ revenue lost annually</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-primary">30 days to results</div>
                    <div className="text-xs text-muted-foreground">Replaces: 6+ months to quota</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-primary">95% improvement</div>
                    <div className="text-xs text-muted-foreground">Replaces: 15% training success rate</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex w-full justify-center lg:mt-2.5">
            <div className="relative flex w-full min-w-[20rem] max-w-[30rem] flex-col items-center overflow-visible md:min-w-[24rem]">
              <form className="z-10 space-y-6">
                <div className="border-border bg-background w-full space-y-6 rounded-xl border px-6 py-10 shadow-sm">
                  <div>
                    <div className="mb-2.5 text-sm font-medium">
                      <label htmlFor="fullName">Full name</label>
                    </div>
                    <Input
                      id="fullName"
                      name="fullName"
                      placeholder="John Smith"
                      required
                    />
                  </div>

                  <div>
                    <div className="mb-2.5 text-sm font-medium">
                      <label htmlFor="email">Business email</label>
                    </div>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="john@company.com"
                      required
                    />
                  </div>

                  <div>
                    <div className="mb-2.5 text-sm font-medium">
                      <label htmlFor="company">Company</label>
                    </div>
                    <Input
                      id="company"
                      name="company"
                      placeholder="Acme Corporation"
                      required
                    />
                  </div>

                  <div>
                    <div className="mb-2.5 text-sm font-medium">
                      <label htmlFor="role">Your role</label>
                    </div>
                    <Select name="role" required>
                      <SelectTrigger id="role">
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sales-manager">Sales Manager</SelectItem>
                        <SelectItem value="vp-sales">VP of Sales</SelectItem>
                        <SelectItem value="ceo">CEO</SelectItem>
                        <SelectItem value="hr-director">HR Director</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <div className="mb-2.5 text-sm font-medium">
                      <label htmlFor="phone">Phone number</label>
                    </div>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div>
                    <div className="mb-2.5 text-sm font-medium">
                      <label htmlFor="companySize">Company size</label>
                    </div>
                    <Select name="companySize" required>
                      <SelectTrigger id="companySize">
                        <SelectValue placeholder="Select company size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-10">1-10 employees</SelectItem>
                        <SelectItem value="11-50">11-50 employees</SelectItem>
                        <SelectItem value="51-200">51-200 employees</SelectItem>
                        <SelectItem value="201-1000">201-1000 employees</SelectItem>
                        <SelectItem value="1000+">1000+ employees</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <div className="mb-2.5 text-sm font-medium">
                      <label htmlFor="message">
                        Tell us about your training needs
                      </label>
                    </div>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="What challenges is your sales team facing? What are your training goals?"
                      className="min-h-[100px]"
                    />
                  </div>

                  <div>
                    <div className="mb-2.5 text-sm font-medium">
                      <label htmlFor="referral">
                        How did you hear about us?{" "}
                        <span className="text-muted-foreground">(Optional)</span>
                      </label>
                    </div>
                    <Select name="referral">
                      <SelectTrigger id="referral">
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="search">Web Search</SelectItem>
                        <SelectItem value="social">Social Media</SelectItem>
                        <SelectItem value="referral">Referral</SelectItem>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                        <SelectItem value="event">Event/Conference</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex w-full flex-col justify-end space-y-3 pt-2">
                    <Button type="submit" size="lg" className="w-full">
                      Book Demo
                    </Button>
                    <div className="text-muted-foreground text-xs text-center">
                      We typically respond within 2 hours during business hours. For more information about how we handle your personal information, please visit our{" "}
                      <a href="/legal/privacy" className="underline hover:text-foreground">
                        privacy policy
                      </a>
                      .
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Gradient Background - matching /about style */}
      <div className="absolute top-0 right-0 -z-10 origin-right scale-50 md:scale-75 lg:scale-100">
        <ContactGradient className="blur-3xl opacity-70" />
      </div>
    </section>
  );
}