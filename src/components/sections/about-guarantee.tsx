import { Shield, TrendingUp, Clock, RefreshCw } from 'lucide-react';
import { Separator } from "@/components/ui/separator";

const GUARANTEES = [
  {
    icon: TrendingUp,
    title: '40% Improvement',
    description: 'Your team closes 40% more deals within 90 days or full refund',
  },
  {
    icon: Clock,
    title: '30-Day Results',
    description: 'See measurable improvement in 30 days or get an extra month free',
  },
  {
    icon: RefreshCw,
    title: '14-Day Free Trial',
    description: 'Try everything free for 14 days. No credit card required',
  },
  {
    icon: Shield,
    title: 'Success or Refund',
    description: 'Transform your worst rep into a closer or get 100% money back',
  },
];

export default function AboutGuarantee() {
  return (
    <section className="py-16 md:py-32">
      <div className="container">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
            <div className="flex flex-col items-center gap-3 text-center lg:items-start lg:text-left">
              <h2 className="mb-5 text-4xl md:text-5xl lg:text-6xl font-headline text-pretty">
                Our{" "}
                <span className="bg-gradient-to-r from-chart-1 via-chart-2 to-chart-3 bg-clip-text text-transparent">
                  Iron-Clad
                </span>{" "}
                Guarantees
              </h2>
              <p className="text-muted-foreground text-lg">
                We're so confident in our AI voice training that we'll put our money where our mouth is.
                Try it risk-free with these industry-leading guarantees.
              </p>
            </div>
            <div className="mt-12 flex justify-center gap-7 lg:justify-start">
              <div className="flex flex-col gap-1.5">
                <p className="text-2xl font-bold text-foreground sm:text-3xl">
                  95%
                </p>
                <p className="text-muted-foreground">Success Rate</p>
              </div>
              <Separator orientation="vertical" className="h-auto" />
              <div className="flex flex-col gap-1.5">
                <p className="text-2xl font-bold text-foreground sm:text-3xl">
                  500+
                </p>
                <p className="text-muted-foreground">Teams Helped</p>
              </div>
              <Separator orientation="vertical" className="h-auto" />
              <div className="flex flex-col gap-1.5">
                <p className="text-2xl font-bold text-foreground sm:text-3xl">
                  $12M+
                </p>
                <p className="text-muted-foreground">Extra Revenue</p>
              </div>
            </div>

            {/* Main Guarantee */}
            <div className="mt-12 rounded-xl bg-gradient-to-br from-chart-1/5 via-chart-2/5 to-chart-3/5 dark:from-chart-1/10 dark:via-chart-2/10 dark:to-chart-3/10 p-8 border border-chart-2/50 dark:border-chart-2/50">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-chart-1 via-chart-2 to-chart-3">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-headline text-xl font-bold mb-3">
                    The "Better Than Your Best Rep" Guarantee
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                    We guarantee that after 90 days of using our AI voice training, your <strong>worst performing rep</strong> will close more deals than they ever have before. If they don't hit at least 40% improvement in closed deals, we'll refund 100% of your money.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    No fine print. No hidden conditions. If we don't deliver results, you get your money back. Period.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 text-left sm:grid-cols-2 sm:text-center lg:text-left">
            {GUARANTEES.map((guarantee, index) => {
              const Icon = guarantee.icon;
              return (
                <div key={index} className="flex items-center gap-6 rounded-lg border border-border bg-muted p-8 sm:flex-col sm:items-start">
                  <div className="mx-0 h-12 w-12 sm:mx-auto lg:mx-0 flex items-center justify-center rounded-lg bg-gradient-to-br from-chart-1 via-chart-2 to-chart-3">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-semibold text-foreground sm:text-base">
                      {guarantee.title}
                    </p>
                    <p className="text-sm text-muted-foreground sm:text-base">
                      {guarantee.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}