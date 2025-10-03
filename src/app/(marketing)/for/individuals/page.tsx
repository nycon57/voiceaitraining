import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CheckCircle2,
  TrendingUp,
  Target,
  Clock,
  Award,
  Zap,
  BarChart3,
  Brain,
  Mic,
  ArrowRight,
} from 'lucide-react';

export const metadata = {
  title: 'Voice AI Training for Individuals | Master Your Sales Skills',
  description:
    'Transform your sales skills with AI-powered voice training. Practice realistic scenarios, get instant feedback, and track your progress. Start free today.',
};

export default function IndividualsPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="section-padding relative">
        <div className="container">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm">
              <Zap className="h-4 w-4 text-primary" />
              <span>Perfect for Freelancers, Consultants & Solo Practitioners</span>
            </div>

            <h1 className="font-headline text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl mb-6">
              Master Sales Calls with{' '}
              <span className="text-gradient">AI Voice Training</span>
            </h1>

            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Practice realistic sales scenarios with AI voice agents. Get instant feedback,
              track your progress, and level up your skills—all on your own schedule.
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
              Free plan available • No credit card required • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="section-padding bg-muted/30">
        <div className="container">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-8 md:grid-cols-3 text-center">
              <div>
                <div className="text-4xl font-bold text-primary mb-2">10K+</div>
                <div className="text-sm text-muted-foreground">Individual Users</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">95%</div>
                <div className="text-sm text-muted-foreground">Improvement in Confidence</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">500K+</div>
                <div className="text-sm text-muted-foreground">Practice Sessions</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="section-padding">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Why Individual Professionals Love Us
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to sharpen your sales skills and close more deals.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Clock className="h-6 w-6" />
                </div>
                <CardTitle>Train on Your Schedule</CardTitle>
                <CardDescription>
                  Practice anytime, anywhere. No need to coordinate with others or wait for
                  availability.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Target className="h-6 w-6" />
                </div>
                <CardTitle>Personalized Practice</CardTitle>
                <CardDescription>
                  Focus on the scenarios and skills that matter most to your business and goals.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <CardTitle>Track Your Progress</CardTitle>
                <CardDescription>
                  See your improvement over time with detailed analytics and performance metrics.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Brain className="h-6 w-6" />
                </div>
                <CardTitle>AI-Powered Feedback</CardTitle>
                <CardDescription>
                  Get instant, actionable feedback on every call. Learn from your mistakes in
                  real-time.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Mic className="h-6 w-6" />
                </div>
                <CardTitle>Realistic Scenarios</CardTitle>
                <CardDescription>
                  Practice with AI voice agents that sound and respond like real prospects.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Award className="h-6 w-6" />
                </div>
                <CardTitle>Build Confidence</CardTitle>
                <CardDescription>
                  Master objection handling, discovery calls, and closing techniques through
                  repetition.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section-padding bg-muted/30">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Simple 3-Step Process
            </h2>
            <p className="text-lg text-muted-foreground">
              Get started in minutes and see results in days.
            </p>
          </div>

          <div className="mx-auto max-w-4xl">
            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xl">
                  1
                </div>
                <div>
                  <h3 className="font-headline text-xl font-bold mb-2">Choose a Scenario</h3>
                  <p className="text-muted-foreground">
                    Select from our library of pre-built scenarios or create your own custom
                    scenarios (Pro and Ultra plans).
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xl">
                  2
                </div>
                <div>
                  <h3 className="font-headline text-xl font-bold mb-2">Practice with AI</h3>
                  <p className="text-muted-foreground">
                    Have realistic voice conversations with our AI agent. Practice objection
                    handling, discovery, and closing.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xl">
                  3
                </div>
                <div>
                  <h3 className="font-headline text-xl font-bold mb-2">Get Instant Feedback</h3>
                  <p className="text-muted-foreground">
                    Review your performance metrics, listen to recordings, and get AI-powered
                    suggestions for improvement.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="section-padding">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
              <CardHeader className="text-center pb-6">
                <CardTitle className="font-headline text-3xl mb-4">
                  Ready to Master Your Sales Skills?
                </CardTitle>
                <CardDescription className="text-base">
                  Choose the plan that fits your needs. Start free, upgrade anytime.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-3">
                  {/* Free Plan */}
                  <Card className="text-center">
                    <CardHeader>
                      <CardTitle className="text-2xl">Free</CardTitle>
                      <div className="text-4xl font-bold">$0</div>
                      <CardDescription>per month</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ul className="space-y-2 text-sm text-left">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                          <span>10 sessions/month</span>
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
                        <Link href="/sign-up">Get Started</Link>
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Pro Plan */}
                  <Card className="border-primary shadow-lg relative">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                      MOST POPULAR
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
                          <span>100 sessions/month</span>
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

                  {/* Ultra Plan */}
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
                          <span>500 sessions/month</span>
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
                          <span>Webhooks & API</span>
                        </li>
                      </ul>
                      <Button className="w-full" asChild>
                        <Link href="/sign-up">Start Ultra Trial</Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <div className="text-center mt-8">
                  <Link href="/pricing" className="text-primary hover:underline">
                    View detailed pricing comparison →
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="section-padding bg-muted/30">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Perfect For
            </h2>
            <p className="text-lg text-muted-foreground">
              Individual professionals across industries use Voice AI Training to level up.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Freelance Consultants</CardTitle>
                <CardDescription>
                  Practice client discovery calls and proposal presentations.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Insurance Agents</CardTitle>
                <CardDescription>Master policy explanations and objection handling.</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Real Estate Agents</CardTitle>
                <CardDescription>
                  Perfect your listing presentations and negotiation skills.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tech Sales Reps</CardTitle>
                <CardDescription>
                  Practice product demos and technical objection handling.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-padding">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Start Training Today
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of professionals who have transformed their sales skills with AI voice
              training.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/sign-up">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/pricing">View All Plans</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}