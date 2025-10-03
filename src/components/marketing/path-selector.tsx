'use client';

import Link from 'next/link';
import { User, Users, Sparkles, TrendingUp, Target, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PathSelector = () => {
  return (
    <section className="overflow-hidden py-32">
      <div className="relative container">
        <div className="pointer-events-none absolute inset-0 -top-20 -z-10 mx-auto hidden h-[500px] w-[500px] bg-[radial-gradient(var(--color-gray-400)_1px,transparent_1px)] [mask-image:radial-gradient(circle_at_center,white_250px,transparent_250px)] [background-size:6px_6px] opacity-25 lg:block"></div>

        {/* Individual Section */}
        <div className="relative flex flex-col justify-between gap-16 lg:flex-row">
          <div className="pointer-events-none absolute inset-0 hidden bg-linear-to-t from-background via-transparent to-transparent lg:block"></div>

          <div className="w-full max-w-96 shrink-0 justify-between">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 text-primary ring-2 ring-primary/10">
              <User className="h-6 w-6" />
            </div>
            <h2 className="mt-6 mb-3 text-3xl font-medium lg:text-4xl">
              For Individuals
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Master your sales craft with AI-powered voice training. Perfect for freelancers, consultants, and solo practitioners who want to sharpen their skills and close more deals.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/for/individuals">Start Free Trial</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/pricing#individual">View Pricing</Link>
              </Button>
            </div>
          </div>

          <div className="hidden w-full max-w-3xl shrink-0 lg:block">
            <div className="relative h-[450px] w-full rounded-lg border bg-gradient-to-br from-muted/50 to-muted overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                    <Sparkles className="h-10 w-10" />
                  </div>
                  <p className="text-lg font-medium">Individual Dashboard Preview</p>
                  <p className="text-sm text-muted-foreground mt-2">Your personal training command center</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative mt-8 grid md:grid-cols-3">
          <div className="flex flex-col gap-y-6 px-2 py-10 md:p-6 lg:p-8">
            <Sparkles className="h-6 w-6 text-primary" />
            <div>
              <h3 className="text-lg font-medium">AI-Powered Scenarios</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Generate unlimited custom sales scenarios tailored to your industry and skill level. Practice real-world situations on demand.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-y-6 px-2 py-10 md:p-6 lg:p-8">
            <Target className="h-6 w-6 text-primary" />
            <div>
              <h3 className="text-lg font-medium">Instant Feedback</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Get detailed analysis of your performance after every call. Understand your strengths and areas for improvement immediately.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-y-6 px-2 py-10 md:p-6 lg:p-8">
            <TrendingUp className="h-6 w-6 text-primary" />
            <div>
              <h3 className="text-lg font-medium">Track Your Growth</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Watch your skills improve over time with personal analytics. See your progress and celebrate your wins.
              </p>
            </div>
          </div>
          {/* Grid borders */}
          <div className="absolute top-0 -right-4 -left-4 h-px bg-input md:hidden"></div>
          <div className="absolute top-[-0.5px] -right-4 -left-4 row-start-2 h-px bg-input md:hidden"></div>
          <div className="absolute top-[-0.5px] -right-4 -left-4 row-start-3 h-px bg-input md:hidden"></div>
          <div className="absolute -right-4 bottom-0 -left-4 row-start-4 h-px bg-input md:hidden"></div>
          <div className="absolute -top-2 bottom-0 -left-2 w-px bg-input md:hidden"></div>
          <div className="absolute -top-2 -right-2 bottom-0 col-start-2 w-px bg-input md:hidden"></div>
          <div className="absolute top-0 -right-2 -left-2 hidden h-px bg-input md:block"></div>
          <div className="absolute -top-2 bottom-0 left-0 hidden w-px bg-input md:block"></div>
          <div className="absolute -top-2 bottom-0 -left-[0.5px] col-start-2 hidden w-px bg-input md:block"></div>
          <div className="absolute -top-2 bottom-0 -left-[0.5px] col-start-3 hidden w-px bg-input md:block"></div>
          <div className="absolute -top-2 right-0 bottom-0 hidden w-px bg-input md:block"></div>
        </div>

        {/* Team Section */}
        <div className="relative flex flex-col-reverse justify-between gap-16 lg:flex-row mt-32">
          <div className="hidden w-full max-w-3xl shrink-0 lg:block">
            <div className="relative h-[450px] w-full rounded-lg border bg-gradient-to-br from-muted/50 to-muted overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                    <BarChart3 className="h-10 w-10" />
                  </div>
                  <p className="text-lg font-medium">Team Dashboard Preview</p>
                  <p className="text-sm text-muted-foreground mt-2">Complete visibility into team performance</p>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full max-w-96 shrink-0 justify-between">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 text-primary ring-2 ring-primary/10">
              <Users className="h-6 w-6" />
            </div>
            <h2 className="mt-6 mb-3 text-3xl font-medium lg:text-4xl">
              For Teams
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Build a world-class sales organization with comprehensive team training, analytics, and compliance tracking. Scale your training across your entire organization.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/request-demo">Schedule Demo</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/pricing#team">View Team Plans</Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="relative mt-8 grid md:grid-cols-3">
          <div className="flex flex-col gap-y-6 px-2 py-10 md:p-6 lg:p-8">
            <BarChart3 className="h-6 w-6 text-primary" />
            <div>
              <h3 className="text-lg font-medium">Team Analytics</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Get complete visibility into team performance with leaderboards, comparative analytics, and trend reports across your organization.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-y-6 px-2 py-10 md:p-6 lg:p-8">
            <Target className="h-6 w-6 text-primary" />
            <div>
              <h3 className="text-lg font-medium">Assignment Management</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Create and track assignments for individuals or groups. Ensure compliance with automated reminders and completion tracking.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-y-6 px-2 py-10 md:p-6 lg:p-8">
            <Users className="h-6 w-6 text-primary" />
            <div>
              <h3 className="text-lg font-medium">Scalable Training</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Train unlimited team members with role-based permissions, custom scenarios, and enterprise-grade security and support.
              </p>
            </div>
          </div>
          {/* Grid borders */}
          <div className="absolute top-0 -right-4 -left-4 h-px bg-input md:hidden"></div>
          <div className="absolute top-[-0.5px] -right-4 -left-4 row-start-2 h-px bg-input md:hidden"></div>
          <div className="absolute top-[-0.5px] -right-4 -left-4 row-start-3 h-px bg-input md:hidden"></div>
          <div className="absolute -right-4 bottom-0 -left-4 row-start-4 h-px bg-input md:hidden"></div>
          <div className="absolute -top-2 bottom-0 -left-2 w-px bg-input md:hidden"></div>
          <div className="absolute -top-2 -right-2 bottom-0 col-start-2 w-px bg-input md:hidden"></div>
          <div className="absolute top-0 -right-2 -left-2 hidden h-px bg-input md:block"></div>
          <div className="absolute -top-2 bottom-0 left-0 hidden w-px bg-input md:block"></div>
          <div className="absolute -top-2 bottom-0 -left-[0.5px] col-start-2 hidden w-px bg-input md:block"></div>
          <div className="absolute -top-2 bottom-0 -left-[0.5px] col-start-3 hidden w-px bg-input md:block"></div>
          <div className="absolute -top-2 right-0 bottom-0 hidden w-px bg-input md:block"></div>
        </div>
      </div>
    </section>
  );
};

export { PathSelector };
