import { ArrowLeft, BarChart3, FileText, Lightbulb, Target, Download, Share2, TrendingUp, Users, Link2 } from 'lucide-react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import { getAttempt } from '@/actions/attempts';
import {
  AttemptHeader,
  BreakdownTab,
  FeedbackTab,
  KPIsTab,
  TranscriptTab,
  type AttemptFeedback,
  type AttemptKPIs,
  type ScoreBreakdown,
  type TranscriptEntry,
} from '@/components/attempts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getCurrentUser } from '@/lib/auth';
import { ExportActions } from '@/components/attempts/ExportActions';

interface AttemptResultsPageProps {
  params: Promise<{ attemptId: string }>;
}

export default async function AttemptResultsPage({
  params,
}: AttemptResultsPageProps) {
  const { attemptId } = await params;

  const user = await getCurrentUser();
  if (!user) {
    redirect('/sign-in');
  }

  let attempt;
  try {
    attempt = await getAttempt(attemptId);
  } catch (error) {
    notFound();
  }

  // Parse data with proper types
  // Note: Supabase automatically parses JSONB columns, so no need to JSON.parse
  const transcript: TranscriptEntry[] = Array.isArray(attempt.transcript_json)
    ? attempt.transcript_json
    : attempt.transcript_json
      ? (typeof attempt.transcript_json === 'string' ? JSON.parse(attempt.transcript_json) : attempt.transcript_json)
      : [];
  const kpis: AttemptKPIs = attempt.kpis || { global: {}, scenario: {} };
  const feedback: AttemptFeedback = attempt.feedback_json || {};
  const scoreBreakdown: ScoreBreakdown = attempt.score_breakdown || {};

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/training`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Training
          </Link>
        </Button>
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">
            Training Results
          </h1>
          <p className="text-muted-foreground">
            Performance analysis for {attempt.scenarios?.title}
          </p>
        </div>
      </div>

      {/* Overall Score Card */}
      <AttemptHeader attempt={attempt} />

      {/* Quick Stats Comparison */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-2.5">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground font-medium">Your Score</div>
                <div className="font-headline text-2xl font-bold text-primary">
                  {attempt.score || 0}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-muted p-2.5">
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground font-medium">Platform Avg</div>
                <div className="font-headline text-2xl font-bold">82%</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`rounded-full p-2.5 ${
                (attempt.score || 0) > 82 ? 'bg-primary/10' : 'bg-destructive/10'
              }`}>
                <TrendingUp className={`h-5 w-5 ${
                  (attempt.score || 0) > 82 ? 'text-primary' : 'text-destructive'
                }`} />
              </div>
              <div>
                <div className="text-sm text-muted-foreground font-medium">vs Average</div>
                <div className={`font-headline text-2xl font-bold ${
                  (attempt.score || 0) > 82 ? 'text-primary' : 'text-destructive'
                }`}>
                  {(attempt.score || 0) > 82 ? '+' : ''}{Math.round((attempt.score || 0) - 82)}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-muted p-2.5">
                <BarChart3 className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground font-medium">Rank</div>
                <div className="font-headline text-2xl font-bold">
                  Top {(attempt.score || 0) >= 90 ? '10' : (attempt.score || 0) >= 80 ? '25' : '50'}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for detailed results */}
      <Tabs defaultValue="feedback" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="feedback" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            AI Feedback
          </TabsTrigger>
          <TabsTrigger value="kpis" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Performance KPIs
          </TabsTrigger>
          <TabsTrigger value="breakdown" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Score Breakdown
          </TabsTrigger>
          <TabsTrigger value="transcript" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Transcript
          </TabsTrigger>
        </TabsList>

        <TabsContent value="feedback" className="space-y-4">
          <FeedbackTab feedback={feedback} />
        </TabsContent>

        <TabsContent value="kpis" className="space-y-4">
          <KPIsTab kpis={kpis} />
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-4">
          <BreakdownTab scoreBreakdown={scoreBreakdown} />
        </TabsContent>

        <TabsContent value="transcript" className="space-y-4">
          <TranscriptTab
            transcript={transcript}
            agentName={attempt.scenarios?.persona?.profile?.name}
          />
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-3">
              <h3 className="font-semibold mb-2">Practice Again</h3>
              <div className="flex gap-3">
                <Button className="flex-1" asChild>
                  <Link href={`/play/${attempt.scenario_id}/call`}>Try Again</Link>
                </Button>
                <Button variant="outline" className="flex-1" asChild>
                  <Link href={`/training/scenarios/${attempt.scenario_id}`}>View Scenario</Link>
                </Button>
              </div>
              <Button variant="ghost" className="w-full" asChild>
                <Link href={`/training`}>Browse More Scenarios</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <ExportActions
          attemptId={attemptId}
          scenarioTitle={attempt.scenarios?.title || 'Training Scenario'}
          score={attempt.score || 0}
        />
      </div>

      {/* Related Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Keep Improving</CardTitle>
          <CardDescription>Based on your performance, we recommend</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-primary/20 p-4 hover:bg-primary/5 transition-colors">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/10 p-2 shrink-0">
                  <Lightbulb className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">Review Best Practices</h4>
                  <p className="text-xs text-muted-foreground mb-3">
                    Study top performer techniques for this scenario
                  </p>
                  <Button variant="link" size="sm" className="h-auto p-0 text-xs text-primary" asChild>
                    <Link href="/resources/best-practices">Learn More →</Link>
                  </Button>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-primary/20 p-4 hover:bg-primary/5 transition-colors">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/10 p-2 shrink-0">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">Similar Scenarios</h4>
                  <p className="text-xs text-muted-foreground mb-3">
                    Practice related scenarios to reinforce skills
                  </p>
                  <Button variant="link" size="sm" className="h-auto p-0 text-xs text-primary" asChild>
                    <Link href={`/training`}>Explore →</Link>
                  </Button>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-primary/20 p-4 hover:bg-primary/5 transition-colors">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/10 p-2 shrink-0">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">Track Progress</h4>
                  <p className="text-xs text-muted-foreground mb-3">
                    View your overall performance trends
                  </p>
                  <Button variant="link" size="sm" className="h-auto p-0 text-xs text-primary" asChild>
                    <Link href="/analytics">View Analytics →</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}