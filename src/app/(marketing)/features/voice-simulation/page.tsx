'use client';

import { PageHero } from '@/components/sections/page-hero';
import VoiceSimulationProblem from '@/components/sections/voice-simulation-problem';
import VoiceSimulationSolution from '@/components/sections/voice-simulation-solution';
import VoiceSimulationFeatures from '@/components/sections/voice-simulation-features';
import VoiceSimulationValueStack from '@/components/sections/voice-simulation-value-stack';
import { Mic } from 'lucide-react';

export default function VoiceSimulationPage() {
  return (
    <>
      <PageHero
        title="Practice with AI prospects that feel completely real"
        description="Experience the future of sales training with voice simulation technology that creates unlimited realistic conversations. No more scheduling conflicts, no judgment, just perfect practice every time."
        cta={{
          text: "Try Voice Simulation",
          icon: Mic,
          href: "/request-demo"
        }}
      />
      <VoiceSimulationProblem />
      <VoiceSimulationSolution />
      <VoiceSimulationFeatures />
      <VoiceSimulationValueStack />
    </>
  );
}