import TechSalesHero from '@/components/sections/tech-sales-hero';
import TechSalesProblem from '@/components/sections/tech-sales-problem';
import TechSalesSolution from '@/components/sections/tech-sales-solution';
import TechSalesFeatures from '@/components/sections/tech-sales-features';
import TechSalesValueStack from '@/components/sections/tech-sales-value-stack';

export const metadata = {
  title: 'AI Voice Training for Tech Sales Teams | Close 50% More Enterprise Deals',
  description: 'Train SaaS sales teams with AI voice agents that simulate technical discovery calls, enterprise demos, and objection handling. Master complex sales cycles, competitive positioning, and technical conversations.',
  keywords: 'tech sales training, SaaS sales training, enterprise sales, technical demos, discovery calls, sales enablement, AI sales training, B2B sales',
};

export default function TechSalesPage() {
  return (
    <>
      <TechSalesHero />
      <TechSalesProblem />
      <TechSalesSolution />
      <TechSalesFeatures />
      <TechSalesValueStack />
    </>
  );
}