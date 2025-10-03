import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CheckCircle2,
  Briefcase,
  Target,
  TrendingUp,
  Clock,
  DollarSign,
  Users,
  Zap,
  ArrowRight,
} from 'lucide-react';

export const metadata = {
  title: 'Voice AI Training for Freelancers | Win More Clients',
  description:
    'Master client calls and win more freelance projects with AI-powered voice training. Practice discovery, proposals, and negotiations. Start free.',
};

export default function FreelancersPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="section-padding relative">
        <div className="container">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm">
              <Briefcase className="h-4 w-4 text-primary" />
              <span>Built for Freelance Consultants & Service Providers</span>
            </div>

            <h1 className="font-headline text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl mb-6">
              Win More Clients with{' '}
              <span className="text-gradient">Confident Sales Calls</span>
            </h1>

            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Practice discovery calls, proposal presentations, and price negotiations with AI.
              Build the confidence to close more deals and grow your freelance business.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/sign-up">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/pricing">View Pricing</Link>
              </Button>
            </div>

            <p className="mt-6 text-sm text-muted-foreground">
              Free plan • 10 practice sessions • No credit card required
            </p>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="section-padding bg-muted/30">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-headline text-3xl font-bold text-center mb-8">
              Sound Familiar?
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardDescription className="text-base">
                    💸 You're losing clients to competitors who sound more confident on calls
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardDescription className="text-base">
                    😰 You freeze up when prospects push back on your pricing
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardDescription className="text-base">
                    🤔 You struggle to ask the right discovery questions to uncover real needs
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardDescription className="text-base">
                    ⏰ You don't have time to role-play or practice with anyone
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="section-padding">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Practice Like a Pro, Close Like a Pro
            </h2>
            <p className="text-lg text-muted-foreground">
              AI voice training helps you master every type of client conversation.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Target className="h-6 w-6" />
                </div>
                <CardTitle>Discovery Calls</CardTitle>
                <CardDescription>
                  Master the art of asking questions that uncover real client pain points and
                  decision criteria.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <DollarSign className="h-6 w-6" />
                </div>
                <CardTitle>Price Negotiations</CardTitle>
                <CardDescription>
                  Practice defending your rates and handling pricing objections with confidence and
                  authority.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Briefcase className="h-6 w-6" />
                </div>
                <CardTitle>Proposal Presentations</CardTitle>
                <CardDescription>
                  Perfect your pitch delivery and learn to handle objections during proposal
                  meetings.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Users className="h-6 w-6" />
                </div>
                <CardTitle>Client Onboarding</CardTitle>
                <CardDescription>
                  Practice setting expectations, explaining your process, and establishing authority
                  from day one.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <CardTitle>Upselling Services</CardTitle>
                <CardDescription>
                  Learn to identify opportunities and confidently pitch additional services to
                  existing clients.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Clock className="h-6 w-6" />
                </div>
                <CardTitle>Scope Changes</CardTitle>
                <CardDescription>
                  Practice difficult conversations about timeline extensions and additional fees
                  with confidence.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* ROI Section */}
      <section className="section-padding bg-muted/30">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <h2 className="font-headline text-3xl font-bold text-center mb-12">
              The Math is Simple
            </h2>
            <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
              <CardContent className="p-8">
                <div className="grid gap-8 md:grid-cols-2">
                  <div>
                    <h3 className="text-2xl font-bold mb-4">Before Voice AI Training</h3>
                    <ul className="space-y-3 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-destructive">✗</span>
                        <span>Win rate: ~20%</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-destructive">✗</span>
                        <span>5 proposals sent/month</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-destructive">✗</span>
                        <span>1 new client/month</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-destructive">✗</span>
                        <span>$3,000 average project value</span>
                      </li>
                      <li className="flex items-start gap-2 text-lg font-semibold text-foreground">
                        <DollarSign className="h-5 w-5" />
                        <span>Revenue: $3,000/month</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-4 text-primary">
                      After Voice AI Training
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span>Win rate: ~35%</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span>5 proposals sent/month</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span>1.75 new clients/month</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span>$3,500 average project value</span>
                      </li>
                      <li className="flex items-start gap-2 text-lg font-semibold text-primary">
                        <DollarSign className="h-5 w-5" />
                        <span>Revenue: $6,125/month</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="mt-8 p-6 bg-primary/10 rounded-lg text-center">
                  <div className="text-3xl font-bold text-primary mb-2">+$3,125/month</div>
                  <div className="text-muted-foreground">
                    Additional revenue with just a 15% improvement in close rate
                  </div>
                  <div className="mt-4 text-sm text-muted-foreground">
                    Investment: $29/month • ROI: 10,775%
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="section-padding">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Start Free, Upgrade When Ready
            </h2>
            <p className="text-lg text-muted-foreground">
              Most freelancers see results with the Pro plan ($29/month).
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-2xl">Free</CardTitle>
                <div className="text-4xl font-bold">$0</div>
                <CardDescription>Forever</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-left">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                    <span>10 practice sessions/month</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                    <span>3 pre-built scenarios</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                    <span>Basic analytics</span>
                  </li>
                </ul>
                <Button className="w-full" variant="outline" asChild>
                  <Link href="/sign-up">Get Started Free</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-primary shadow-lg relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                RECOMMENDED
              </div>
              <CardHeader>
                <CardTitle className="text-2xl">Pro</CardTitle>
                <div className="text-4xl font-bold">$29</div>
                <CardDescription>per month</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-left">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                    <span>100 practice sessions/month</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                    <span>50 custom scenarios</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                    <span>AI scenario generation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                    <span>Advanced analytics</span>
                  </li>
                </ul>
                <Button className="w-full" asChild>
                  <Link href="/sign-up">Start Pro Trial</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-2xl">Ultra</CardTitle>
                <div className="text-4xl font-bold">$99</div>
                <CardDescription>per month</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-left">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                    <span>500 practice sessions/month</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                    <span>200 custom scenarios</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                    <span>Custom branding</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                    <span>Webhooks & API access</span>
                  </li>
                </ul>
                <Button className="w-full" asChild>
                  <Link href="/sign-up">Start Ultra Trial</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-padding bg-muted/30">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Close More Deals Starting Today
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of freelancers who use AI voice training to win more clients and grow
              their business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/sign-up">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/for/individuals">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}