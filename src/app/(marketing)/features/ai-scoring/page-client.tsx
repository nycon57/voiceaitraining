'use client';

import { PageHero } from '@/components/sections/page-hero';
import AIScoringProblem from '@/components/sections/ai-scoring-problem';
import AIScoringSolution from '@/components/sections/ai-scoring-solution';
import AIScoringFeatures from '@/components/sections/ai-scoring-features';
import AIScoringValueStack from '@/components/sections/ai-scoring-value-stack';
import { BarChart3 } from 'lucide-react';

export default function AIScoringPage() {
  return (
    <>
      <PageHero
        title="Get instant, objective feedback on every sales conversation"
        description="Transform subjective manager feedback into precise, actionable insights. Our AI analyzes every word, pause, and technique to deliver consistent scoring that accelerates improvement and eliminates bias."
        cta={{
          text: "See Your Score",
          icon: BarChart3,
          href: "/request-demo"
        }}
      />
      <AIScoringProblem />
      <AIScoringSolution />
      <AIScoringFeatures />
      <AIScoringValueStack />
    </>
  );
}