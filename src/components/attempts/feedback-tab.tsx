import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import type { AttemptFeedback } from './types';

export interface FeedbackTabProps {
  feedback: AttemptFeedback;
}

/**
 * FeedbackTab Component
 *
 * Displays AI-generated feedback including:
 * - Performance summary
 * - Strengths with descriptions
 * - Areas for improvement with suggestions
 * - Next steps for training
 *
 * @example
 * ```tsx
 * <FeedbackTab feedback={attempt.feedback_json} />
 * ```
 */
export function FeedbackTab({ feedback }: FeedbackTabProps) {
  const hasStrengths = feedback.strengths && feedback.strengths.length > 0;
  const hasImprovements = feedback.improvements && feedback.improvements.length > 0;
  const hasNextSteps = feedback.next_steps && feedback.next_steps.length > 0;

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      {feedback.summary && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-lg">
              AI Performance Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{feedback.summary}</p>
          </CardContent>
        </Card>
      )}

      {/* Strengths and Improvements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {hasStrengths && (
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-lg text-success">
                Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {feedback.strengths!.map((strength, index) => (
                  <div
                    key={index}
                    className="border-l-4 border-success pl-3"
                  >
                    <div className="font-medium text-sm">{strength.area}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {strength.description}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {hasImprovements && (
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-lg text-warning">
                Areas for Improvement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {feedback.improvements!.map((improvement, index) => (
                  <div
                    key={index}
                    className="border-l-4 border-warning pl-3"
                  >
                    <div className="font-medium text-sm">{improvement.area}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {improvement.description}
                    </div>
                    <div className="text-sm text-info mt-1 font-medium">
                      💡 {improvement.suggestion}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Next Steps */}
      {hasNextSteps && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-lg">Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {feedback.next_steps!.map((step, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-info/20 text-info rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                    {index + 1}
                  </div>
                  <div className="text-sm">{step}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}