import { PageHero } from '@/components/sections/page-hero'
// import { FeaturesOverview } from '@/components/sections/features2'
// import { FeatureTabs } from '@/components/sections/features-tabs'
// import { ProductDashboard } from '@/components/sections/product-dashboard'
// import { AIAutomation } from '@/components/sections/ai-automation'

export const metadata = {
  title: 'Features | SpeakStride',
  description: 'Discover SpeakStride\'s AI-powered voice simulation, intelligent scoring, and advanced analytics for sales training excellence.',
  openGraph: {
    title: 'Features | SpeakStride',
    description: 'Discover SpeakStride\'s AI-powered voice simulation, intelligent scoring, and advanced analytics for sales training excellence.',
    type: 'website',
  },
}

export default function FeaturesPage() {
  return (
    <>
      <PageHero
        badge={{
          text: "Product Features"
        }}
        title="Complete Sales Training Platform"
        description="Transform your sales team with AI-powered voice simulation, intelligent performance scoring, and comprehensive analytics to drive measurable results."
      />

      {/* <FeaturesOverview /> */}
      {/* <FeatureTabs /> */}
      {/* <ProductDashboard /> */}
      {/* <AIAutomation /> */}
    </>
  )
}