'use client';

import { ArrowRight, Clock, Users, Star, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AboutCTA() {
  return (
    <section className="section-padding">
      <div className="container max-w-5xl">
        <div className="rounded-2xl bg-gradient-to-br from-chart-1/10 via-chart-2/10 to-chart-3/10 p-8 md:p-12 border border-chart-1/20">
          <div className="text-center">
            {/* Urgency Badge */}
            <div className="flex w-fit items-center rounded-full border border-orange-200 bg-orange-50 p-1 text-xs mx-auto mb-6">
              <span className="bg-orange-500 text-white rounded-full px-3 py-1">
                Limited Time
              </span>
              <span className="px-3 text-orange-700">Q1 2025 onboarding spots filling fast</span>
            </div>

            <h2 className="font-headline text-4xxl leading-tight tracking-tight md:text-5xl mb-6">
              Ready to Transform Your Sales Team?
            </h2>

            <p className="text-muted-foreground text-lg leading-snug max-w-3xl mx-auto mb-8">
              Join 500+ sales teams who've already discovered the secret to consistent, predictable revenue growth.
              Your competitors are already training with AI. Don't get left behind.
            </p>

            {/* Social Proof Badges */}
            <div className="flex flex-wrap justify-center gap-6 mb-12">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500 fill-current" />
                <span className="text-sm font-medium">4.9/5 rating</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-chart-1" />
                <span className="text-sm font-medium">500+ teams</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-chart-2" />
                <span className="text-sm font-medium">95% success rate</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-4 mb-8">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="text-lg px-8 py-6">
                  Start Free 14-Day Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                  Book Strategy Call
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                No credit card required • Cancel anytime • Setup in 5 minutes
              </p>
            </div>

            {/* Scarcity Section */}
            <div className="rounded-lg bg-background/50 p-6 border border-orange-200/50 mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-orange-500" />
                <h3 className="font-bold text-orange-700">Limited Q1 2025 Onboarding</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                We personally onboard every enterprise team to ensure 40%+ improvement.
                Only <strong className="text-orange-700">7 spots remaining</strong> for Q1 2025 implementations.
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-bold text-chart-1">3 weeks</div>
                  <div className="text-muted-foreground">Average setup time</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-chart-1">30 days</div>
                  <div className="text-muted-foreground">To see results</div>
                </div>
              </div>
            </div>

            {/* Final Value Props */}
            <div className="grid gap-4 md:grid-cols-3 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-chart-2" />
                <span>40% improvement guaranteed</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-chart-2" />
                <span>Works with existing CRM</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-chart-2" />
                <span>White-glove onboarding</span>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Reversal Reminder */}
        <div className="mt-8 text-center">
          <p className="text-muted-foreground text-sm">
            Remember: 14-day free trial, 90-day money-back guarantee, and cancel anytime.
            <br />
            <strong>The only risk is staying with broken training methods.</strong>
          </p>
        </div>
      </div>
    </section>
  );
}