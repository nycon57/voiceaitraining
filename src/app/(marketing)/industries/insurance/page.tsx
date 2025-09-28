import InsuranceHero from '@/components/sections/insurance-hero';
import InsuranceProblem from '@/components/sections/insurance-problem';
import InsuranceSolution from '@/components/sections/insurance-solution';
import InsuranceFeatures from '@/components/sections/insurance-features';
import InsuranceValueStack from '@/components/sections/insurance-value-stack';

export const metadata = {
  title: 'AI Voice Training for Insurance Agents | Build Trust & Sell 35% More Policies',
  description: 'Train insurance agents with AI voice scenarios that simulate real client conversations. Master needs assessment, policy explanations, and objection handling. Trusted by 120+ insurance agencies.',
  keywords: 'insurance agent training, needs assessment training, policy explanation skills, insurance sales training, cross-selling training, insurance AI training',
};

export default function InsurancePage() {
  return (
    <>
      <InsuranceHero />
      <InsuranceProblem />
      <InsuranceSolution />
      <InsuranceFeatures />
      <InsuranceValueStack />
    </>
  );
}