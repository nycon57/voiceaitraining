import HealthcareHero from '@/components/sections/healthcare-hero';
import HealthcareProblem from '@/components/sections/healthcare-problem';
import HealthcareSolution from '@/components/sections/healthcare-solution';
import HealthcareFeatures from '@/components/sections/healthcare-features';
import HealthcareValueStack from '@/components/sections/healthcare-value-stack';

export const metadata = {
  title: 'AI Voice Training for Healthcare Sales | Build Trusted Provider Relationships',
  description: 'Train healthcare sales teams with AI voice agents that simulate realistic clinical conversations. Master value-based selling, ROI discussions, and provider education. Build trusted relationships with clinicians.',
  keywords: 'healthcare sales training, medical device sales, pharmaceutical sales, clinical value training, provider education, healthcare AI training',
};

export default function HealthcarePage() {
  return (
    <>
      <HealthcareHero />
      <HealthcareProblem />
      <HealthcareSolution />
      <HealthcareFeatures />
      <HealthcareValueStack />
    </>
  );
}