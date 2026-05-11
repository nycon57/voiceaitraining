import { Metadata } from 'next';
import { PageHero } from '@/components/sections/page-hero';

export const metadata: Metadata = {
  title: 'Cookie Policy | SpeakStride',
  description: 'Cookie Policy for SpeakStride - Learn about how we use cookies and similar technologies to enhance your experience on our platform.',
  openGraph: {
    title: 'Cookie Policy | SpeakStride',
    description: 'Cookie Policy for SpeakStride - Learn about how we use cookies and similar technologies.',
  },
};

const cookieTables = [
  {
    title: '3.1 Essential Cookies',
    description: 'These cookies are necessary for the website to function and cannot be switched off:',
    rows: [
      ['auth-token', 'Authentication and session management', 'Session'],
      ['csrf-token', 'Security protection against cross-site request forgery', 'Session'],
      ['org-context', 'Multi-tenant organization context', '30 days'],
      ['cookie-consent', 'Remember your cookie preferences', '1 year'],
    ],
  },
  {
    title: '3.2 Performance and Analytics Cookies',
    description: 'These cookies help us understand how visitors interact with our website:',
    rows: [
      ['_ga', 'Google Analytics - distinguish users', '2 years'],
      ['_ga_*', 'Google Analytics - session identification', '2 years'],
      ['ph_*', 'PostHog analytics - user behavior tracking', '1 year'],
      ['sentry-trace', 'Error monitoring and performance tracking', 'Session'],
    ],
  },
  {
    title: '3.3 Functional Cookies',
    description: 'These cookies enable enhanced functionality and personalization:',
    rows: [
      ['theme-preference', 'Remember light/dark mode preference', '1 year'],
      ['language-pref', 'Store language preferences', '1 year'],
      ['onboarding-state', 'Track onboarding progress', '30 days'],
      ['notification-prefs', 'Store notification preferences', '6 months'],
    ],
  },
  {
    title: '3.4 Marketing and Advertising Cookies',
    description: 'These cookies are used to deliver relevant advertisements:',
    rows: [
      ['_fbp', 'Facebook Pixel - track conversions', '3 months'],
      ['gclid', 'Google Ads click identification', '90 days'],
      ['linkedin_oauth', 'LinkedIn advertising and analytics', '30 days'],
      ['utm_campaign', 'Track marketing campaign effectiveness', '7 days'],
    ],
  },
];

type CookiePolicySection = {
  title: string;
  intro?: string;
  groups: Array<[string, string[]]>;
};

const policySections: CookiePolicySection[] = [
  {
    title: '4. Third-Party Cookies',
    intro: 'We use several third-party services that may set cookies on your device:',
    groups: [
      ['4.1 Analytics and Performance', ['Google Analytics: Helps us understand website usage and improve user experience', 'PostHog: Product analytics to understand feature usage and user behavior', 'Sentry: Error monitoring and performance tracking']],
      ['4.2 Authentication and Security', ['Clerk: Authentication and user management services', 'Supabase: Backend services and database authentication']],
      ['4.3 Business Services', ['Stripe: Payment processing and billing management', 'Intercom: Customer support and messaging', 'HubSpot: CRM and marketing automation']],
      ['4.4 AI and Voice Processing', ['OpenAI: AI processing services (may set performance cookies)', 'Deepgram: Speech-to-text processing', 'ElevenLabs: Text-to-speech services']],
    ],
  },
  {
    title: '6. How to Control Cookies',
    groups: [
      ['6.1 Browser Settings', ['Chrome: Settings -> Privacy and security -> Cookies and other site data', 'Firefox: Settings -> Privacy & Security -> Cookies and Site Data', 'Safari: Preferences -> Privacy -> Manage Website Data', 'Edge: Settings -> Cookies and site permissions -> Cookies and site data']],
      ['6.2 Cookie Consent Management', ['Accept or reject non-essential cookies', 'Manage preferences by cookie category', 'Update your preferences at any time', 'Access detailed information about each cookie type']],
      ['6.3 Opt-Out Links', ['Google Analytics: Google Analytics Opt-out', 'Facebook: Facebook Ad Preferences', 'LinkedIn: LinkedIn Opt-out', 'Digital Advertising Alliance: DAA Opt-out']],
    ],
  },
  {
    title: '7. Impact of Disabling Cookies',
    intro: 'Disabling certain cookies may affect your experience:',
    groups: [
      ['7.1 Essential Cookies', ['Prevent you from logging in to your account', 'Disable multi-tenant organization switching', 'Reduce security protections', 'Break core platform functionality']],
      ['7.2 Functional Cookies', ['Reset your preferences on each visit', 'Disable personalized experiences', 'Require re-configuration of settings', 'Impact user interface customizations']],
      ['7.3 Analytics Cookies', ['Prevent us from improving the platform based on usage data', 'Reduce our ability to identify and fix issues', 'Limit performance optimization efforts', 'Not affect your direct use of the platform']],
    ],
  },
];

export default function CookiePolicyPage() {
  return (
    <>
      <PageHero
        title="Cookie Policy"
        description="Learn how we use cookies and similar technologies to enhance your experience."
      />
      <CookiePolicyContent />
    </>
  );
}

function CookiePolicyContent() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-4xl mx-auto prose prose-gray dark:prose-invert prose-lg">
        <div suppressHydrationWarning className="mb-8 text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
        <IntroSections />
        <CookieTables />
        <PolicySections />
        <StorageAndMobileSections />
        <CookieConsentNotice />
      </div>
    </div>
  );
}

function IntroSections() {
  return (
    <>
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
        <p className="mb-4">This Cookie Policy explains how SpeakStride, Inc. ("we", "us", "our") uses cookies and similar technologies when you visit our website and use our AI-powered voice training platform ("Service").</p>
        <p>This policy explains what these technologies are, why we use them, and your rights to control our use of them.</p>
      </section>
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">2. What Are Cookies</h2>
        <p className="mb-4">Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used by website owners to make their websites work more efficiently and to provide reporting information.</p>
        <p className="mb-4">Cookies set by the website owner are called "first-party cookies." Cookies set by parties other than the website owner are called "third-party cookies."</p>
      </section>
    </>
  );
}

function CookieTables() {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-semibold mb-4">3. Types of Cookies We Use</h2>
      {cookieTables.map((table) => (
        <div key={table.title}>
          <h3 className="text-xl font-semibold mb-3">{table.title}</h3>
          <p className="mb-4">{table.description}</p>
          <div className="bg-muted p-4 rounded-lg mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-semibold">Cookie Name</th>
                  <th className="text-left py-2 font-semibold">Purpose</th>
                  <th className="text-left py-2 font-semibold">Duration</th>
                </tr>
              </thead>
              <tbody>
                {table.rows.map(([name, purpose, duration]) => (
                  <tr key={name} className="border-b last:border-b-0">
                    <td className="py-2">{name}</td>
                    <td className="py-2">{purpose}</td>
                    <td className="py-2">{duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </section>
  );
}

function PolicySections() {
  return (
    <>
      {policySections.map((section) => (
        <section key={section.title} className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">{section.title}</h2>
          {section.intro && <p className="mb-4">{section.intro}</p>}
          {section.groups.map(([title, items]) => (
            <div key={title}>
              <h3 className="text-xl font-semibold mb-3">{title}</h3>
              <ul className="list-disc pl-6 mb-4">
                {items.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          ))}
        </section>
      ))}
    </>
  );
}

function StorageAndMobileSections() {
  return (
    <>
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">5. Local Storage and Session Storage</h2>
        <p className="mb-4">In addition to cookies, we may use local storage and session storage:</p>
        <ul className="list-disc pl-6 mb-4">
          <li><strong>Local Storage:</strong> Stores user preferences and application state that persists between sessions</li>
          <li><strong>Session Storage:</strong> Temporarily stores data for the duration of your browser session</li>
          <li><strong>IndexedDB:</strong> Used for caching training data and offline functionality</li>
          <li><strong>Cache Storage:</strong> Stores application resources for improved performance</li>
        </ul>
      </section>
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">8. Mobile Applications</h2>
        <p className="mb-4">Our mobile applications may use similar technologies:</p>
        <ul className="list-disc pl-6 mb-4">
          <li>Device identifiers for analytics and personalization</li>
          <li>Local storage for offline functionality</li>
          <li>Push notification tokens</li>
          <li>Crash reporting and performance monitoring</li>
        </ul>
        <p>You can control these through your device settings and app permissions.</p>
      </section>
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">9. Updates to This Policy</h2>
        <p className="mb-4">We may update this Cookie Policy to reflect changes to cookie use, new features, third-party integrations, or applicable laws and regulations.</p>
        <p>We will notify you of material changes through our platform or by email.</p>
      </section>
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">10. Contact Information</h2>
        <p className="mb-4">If you have questions about our use of cookies or this policy, please contact us:</p>
        <div className="bg-muted p-4 rounded-lg">
          <p className="mb-2"><strong>Privacy Team:</strong> privacy@speakstride.com</p>
          <p className="mb-2"><strong>Support:</strong> support@speakstride.com</p>
          <p className="mb-2"><strong>Address:</strong> SpeakStride, Inc.</p>
          <p>1234 Business Ave, Suite 100</p>
          <p>San Francisco, CA 94105</p>
        </div>
      </section>
    </>
  );
}

function CookieConsentNotice() {
  return (
    <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
      <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">Cookie Consent</h3>
      <p className="text-blue-700 dark:text-blue-300 text-sm mb-3">
        By continuing to use our website and platform, you consent to our use of cookies as described in this policy. You can change your cookie preferences at any time through your browser settings or our cookie consent manager.
      </p>
      <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors">
        Manage Cookie Preferences
      </button>
    </div>
  );
}
