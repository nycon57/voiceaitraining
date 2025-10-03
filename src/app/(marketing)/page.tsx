import Hero from '@/components/sections/hero';
import Features from '@/components/sections/features';
import FeaturesTabsSection from '@/components/sections/features-tabs';
import AIAutomation from '@/components/sections/ai-automation';
import Testimonials from '@/components/sections/testimonials';
import { PathSelector } from '@/components/marketing/path-selector';

export default function Home() {
  return (
    <>
      <Hero />
      <PathSelector />
      <Features />
      <FeaturesTabsSection />
      <AIAutomation />
      <Testimonials />
    </>
  );
}