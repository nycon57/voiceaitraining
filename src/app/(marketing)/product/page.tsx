import ProductHero from '@/components/sections/product-hero';
import ProductFeatures from '@/components/sections/product-features';
import ProductDashboard from '@/components/sections/product-dashboard';
import ProductLogs from '@/components/sections/product-logs';
import FeatureShowcase from '@/components/sections/feature-showcase';

export const metadata = {
  title: 'Product Overview | SpeakStride - AI Voice Training Platform',
  description: 'Transform your sales team with AI-powered voice simulations. Practice real conversations, get instant feedback, and close 40% more deals.',
};

export default function Product() {
  return (
    <>
      <ProductHero />
      <ProductFeatures />
      <ProductDashboard />
      <FeatureShowcase />
      <ProductLogs />
    </>
  );
}