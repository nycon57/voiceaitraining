import LoanOfficersHero from '@/components/sections/loan-officers-hero';
import LoanOfficersProblem from '@/components/sections/loan-officers-problem';
import LoanOfficersSolution from '@/components/sections/loan-officers-solution';
import LoanOfficersFeatures from '@/components/sections/loan-officers-features';
import LoanOfficersValueStack from '@/components/sections/loan-officers-value-stack';

export const metadata = {
  title: 'AI Voice Training for Loan Officers | Close 40% More Mortgage Deals',
  description: 'Train loan officers with AI voice agents that simulate realistic mortgage scenarios. Master rate objections, compliance discussions, and closing techniques. Trusted by 150+ mortgage companies.',
  keywords: 'loan officer training, mortgage sales training, rate objection handling, compliance training, TRID training, mortgage AI training',
};

export default function LoanOfficersPage() {
  return (
    <>
      <LoanOfficersHero />
      <LoanOfficersProblem />
      <LoanOfficersSolution />
      <LoanOfficersFeatures />
      <LoanOfficersValueStack />
    </>
  );
}