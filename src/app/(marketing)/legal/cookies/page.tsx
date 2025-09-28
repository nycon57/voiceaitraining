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

export default function CookiePolicyPage() {
  return (
    <>
      <PageHero
        title="Cookie Policy"
        description="Learn how we use cookies and similar technologies to enhance your experience."
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto prose prose-gray dark:prose-invert prose-lg">
          <div className="mb-8 text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="mb-4">
              This Cookie Policy explains how SpeakStride, Inc. ("we", "us", "our") uses cookies and similar
              technologies when you visit our website and use our AI-powered voice training platform ("Service").
            </p>
            <p>
              This policy explains what these technologies are, why we use them, and your rights to control our use of them.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">2. What Are Cookies</h2>
            <p className="mb-4">
              Cookies are small text files that are placed on your computer or mobile device when you visit a website.
              They are widely used by website owners to make their websites work more efficiently and to provide
              reporting information.
            </p>
            <p className="mb-4">
              Cookies set by the website owner are called "first-party cookies." Cookies set by parties other than
              the website owner are called "third-party cookies."
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">3. Types of Cookies We Use</h2>

            <h3 className="text-xl font-semibold mb-3">3.1 Essential Cookies</h3>
            <p className="mb-4">These cookies are necessary for the website to function and cannot be switched off:</p>
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
                  <tr className="border-b">
                    <td className="py-2">auth-token</td>
                    <td className="py-2">Authentication and session management</td>
                    <td className="py-2">Session</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">csrf-token</td>
                    <td className="py-2">Security protection against cross-site request forgery</td>
                    <td className="py-2">Session</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">org-context</td>
                    <td className="py-2">Multi-tenant organization context</td>
                    <td className="py-2">30 days</td>
                  </tr>
                  <tr>
                    <td className="py-2">cookie-consent</td>
                    <td className="py-2">Remember your cookie preferences</td>
                    <td className="py-2">1 year</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-xl font-semibold mb-3">3.2 Performance and Analytics Cookies</h3>
            <p className="mb-4">These cookies help us understand how visitors interact with our website:</p>
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
                  <tr className="border-b">
                    <td className="py-2">_ga</td>
                    <td className="py-2">Google Analytics - distinguish users</td>
                    <td className="py-2">2 years</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">_ga_*</td>
                    <td className="py-2">Google Analytics - session identification</td>
                    <td className="py-2">2 years</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">ph_*</td>
                    <td className="py-2">PostHog analytics - user behavior tracking</td>
                    <td className="py-2">1 year</td>
                  </tr>
                  <tr>
                    <td className="py-2">sentry-trace</td>
                    <td className="py-2">Error monitoring and performance tracking</td>
                    <td className="py-2">Session</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-xl font-semibold mb-3">3.3 Functional Cookies</h3>
            <p className="mb-4">These cookies enable enhanced functionality and personalization:</p>
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
                  <tr className="border-b">
                    <td className="py-2">theme-preference</td>
                    <td className="py-2">Remember light/dark mode preference</td>
                    <td className="py-2">1 year</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">language-pref</td>
                    <td className="py-2">Store language preferences</td>
                    <td className="py-2">1 year</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">onboarding-state</td>
                    <td className="py-2">Track onboarding progress</td>
                    <td className="py-2">30 days</td>
                  </tr>
                  <tr>
                    <td className="py-2">notification-prefs</td>
                    <td className="py-2">Store notification preferences</td>
                    <td className="py-2">6 months</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-xl font-semibold mb-3">3.4 Marketing and Advertising Cookies</h3>
            <p className="mb-4">These cookies are used to deliver relevant advertisements:</p>
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
                  <tr className="border-b">
                    <td className="py-2">_fbp</td>
                    <td className="py-2">Facebook Pixel - track conversions</td>
                    <td className="py-2">3 months</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">gclid</td>
                    <td className="py-2">Google Ads click identification</td>
                    <td className="py-2">90 days</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">linkedin_oauth</td>
                    <td className="py-2">LinkedIn advertising and analytics</td>
                    <td className="py-2">30 days</td>
                  </tr>
                  <tr>
                    <td className="py-2">utm_campaign</td>
                    <td className="py-2">Track marketing campaign effectiveness</td>
                    <td className="py-2">7 days</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">4. Third-Party Cookies</h2>
            <p className="mb-4">We use several third-party services that may set cookies on your device:</p>

            <h3 className="text-xl font-semibold mb-3">4.1 Analytics and Performance</h3>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Google Analytics:</strong> Helps us understand website usage and improve user experience</li>
              <li><strong>PostHog:</strong> Product analytics to understand feature usage and user behavior</li>
              <li><strong>Sentry:</strong> Error monitoring and performance tracking</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">4.2 Authentication and Security</h3>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Clerk:</strong> Authentication and user management services</li>
              <li><strong>Supabase:</strong> Backend services and database authentication</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">4.3 Business Services</h3>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Stripe:</strong> Payment processing and billing management</li>
              <li><strong>Intercom:</strong> Customer support and messaging</li>
              <li><strong>HubSpot:</strong> CRM and marketing automation</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">4.4 AI and Voice Processing</h3>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>OpenAI:</strong> AI processing services (may set performance cookies)</li>
              <li><strong>Deepgram:</strong> Speech-to-text processing</li>
              <li><strong>ElevenLabs:</strong> Text-to-speech services</li>
            </ul>
          </section>

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
            <h2 className="text-2xl font-semibold mb-4">6. How to Control Cookies</h2>

            <h3 className="text-xl font-semibold mb-3">6.1 Browser Settings</h3>
            <p className="mb-4">You can control cookies through your browser settings:</p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
              <li><strong>Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data</li>
              <li><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
              <li><strong>Edge:</strong> Settings → Cookies and site permissions → Cookies and site data</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">6.2 Cookie Consent Management</h3>
            <p className="mb-4">We provide cookie consent controls that allow you to:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Accept or reject non-essential cookies</li>
              <li>Manage preferences by cookie category</li>
              <li>Update your preferences at any time</li>
              <li>Access detailed information about each cookie type</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">6.3 Opt-Out Links</h3>
            <p className="mb-4">You can opt out of specific third-party cookies:</p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Google Analytics:</strong> <a href="https://tools.google.com/dlpage/gaoptout" className="text-blue-600 underline">Google Analytics Opt-out</a></li>
              <li><strong>Facebook:</strong> <a href="https://www.facebook.com/settings?tab=ads" className="text-blue-600 underline">Facebook Ad Preferences</a></li>
              <li><strong>LinkedIn:</strong> <a href="https://www.linkedin.com/psettings/guest-controls/retargeting-opt-out" className="text-blue-600 underline">LinkedIn Opt-out</a></li>
              <li><strong>Digital Advertising Alliance:</strong> <a href="http://optout.aboutads.info/" className="text-blue-600 underline">DAA Opt-out</a></li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">7. Impact of Disabling Cookies</h2>
            <p className="mb-4">Disabling certain cookies may affect your experience:</p>

            <h3 className="text-xl font-semibold mb-3">7.1 Essential Cookies</h3>
            <p className="mb-4">Disabling essential cookies will:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Prevent you from logging in to your account</li>
              <li>Disable multi-tenant organization switching</li>
              <li>Reduce security protections</li>
              <li>Break core platform functionality</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">7.2 Functional Cookies</h3>
            <p className="mb-4">Disabling functional cookies will:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Reset your preferences on each visit</li>
              <li>Disable personalized experiences</li>
              <li>Require re-configuration of settings</li>
              <li>Impact user interface customizations</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">7.3 Analytics Cookies</h3>
            <p className="mb-4">Disabling analytics cookies will:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Prevent us from improving the platform based on usage data</li>
              <li>Reduce our ability to identify and fix issues</li>
              <li>Limit performance optimization efforts</li>
              <li>Not affect your direct use of the platform</li>
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
            <p>
              You can control these through your device settings and app permissions.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">9. Updates to This Policy</h2>
            <p className="mb-4">We may update this Cookie Policy to reflect:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Changes to our use of cookies and similar technologies</li>
              <li>New features or services that require additional cookies</li>
              <li>Updates to third-party service integrations</li>
              <li>Changes in applicable laws and regulations</li>
            </ul>
            <p>
              We will notify you of material changes through our platform or by email.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">10. Contact Information</h2>
            <p className="mb-4">
              If you have questions about our use of cookies or this policy, please contact us:
            </p>
            <div className="bg-muted p-4 rounded-lg">
              <p className="mb-2"><strong>Privacy Team:</strong> privacy@speakstride.com</p>
              <p className="mb-2"><strong>Support:</strong> support@speakstride.com</p>
              <p className="mb-2"><strong>Address:</strong> SpeakStride, Inc.</p>
              <p>1234 Business Ave, Suite 100</p>
              <p>San Francisco, CA 94105</p>
            </div>
          </section>

          <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
              Cookie Consent
            </h3>
            <p className="text-blue-700 dark:text-blue-300 text-sm mb-3">
              By continuing to use our website and platform, you consent to our use of cookies as described in this policy.
              You can change your cookie preferences at any time through your browser settings or our cookie consent manager.
            </p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors">
              Manage Cookie Preferences
            </button>
          </div>
        </div>
      </div>
    </>
  );
}