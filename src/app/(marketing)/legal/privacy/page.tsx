import { Metadata } from 'next';
import { PageHero } from '@/components/sections/page-hero';

export const metadata: Metadata = {
  title: 'Privacy Policy | SpeakStride',
  description: 'Privacy Policy for SpeakStride - Learn how we collect, use, and protect your personal information and voice data in our AI sales training platform.',
  openGraph: {
    title: 'Privacy Policy | SpeakStride',
    description: 'Privacy Policy for SpeakStride - Learn how we collect, use, and protect your personal information and voice data.',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageHero
        title="Privacy Policy"
        description="Your privacy is important to us. Learn how we collect, use, and protect your information."
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto prose prose-gray dark:prose-invert prose-lg">
          <div className="mb-8 text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="mb-4">
              SpeakStride, Inc. ("we", "us", "our") is committed to protecting your privacy. This Privacy Policy
              explains how we collect, use, disclose, and safeguard your information when you use our AI-powered
              voice agent sales training platform ("Service").
            </p>
            <p>
              This policy applies to all users of our Service, including trainees, managers, administrators,
              and other authorized users within your organization.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>

            <h3 className="text-xl font-semibold mb-3">2.1 Personal Information</h3>
            <p className="mb-4">We collect personal information that you provide directly to us, including:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Name, email address, and contact information</li>
              <li>Job title, company information, and role within your organization</li>
              <li>Account credentials and authentication information</li>
              <li>Profile information and preferences</li>
              <li>Billing and payment information (processed securely through third-party providers)</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">2.2 Voice Data and Recordings</h3>
            <p className="mb-4">Our Service involves the collection and processing of voice data:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Voice recordings during training sessions with AI agents</li>
              <li>Audio transcripts generated from recordings</li>
              <li>Voice patterns and speech characteristics for analysis</li>
              <li>Performance metrics derived from voice interactions</li>
              <li>Training session metadata (duration, timestamp, scenario details)</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">2.3 Usage and Technical Data</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Device information (browser type, operating system, device identifiers)</li>
              <li>Usage patterns and interaction data within the platform</li>
              <li>Log files, IP addresses, and access times</li>
              <li>Performance data and analytics</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
            <p className="mb-4">We use the collected information for the following purposes:</p>

            <h3 className="text-xl font-semibold mb-3">3.1 Service Provision</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Delivering AI-powered voice training simulations</li>
              <li>Generating performance scores and feedback</li>
              <li>Creating transcripts and training reports</li>
              <li>Managing user accounts and organizational access</li>
              <li>Providing customer support and technical assistance</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">3.2 AI Processing and Analytics</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Processing voice recordings through AI models for analysis</li>
              <li>Generating performance insights and recommendations</li>
              <li>Improving our AI algorithms and training effectiveness</li>
              <li>Creating anonymized benchmarks and industry insights</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">3.3 Business Operations</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Processing payments and managing subscriptions</li>
              <li>Communicating about service updates and features</li>
              <li>Compliance with legal obligations</li>
              <li>Fraud prevention and security monitoring</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">4. Information Sharing and Disclosure</h2>
            <p className="mb-4">We do not sell, trade, or rent your personal information. We may share information in the following limited circumstances:</p>

            <h3 className="text-xl font-semibold mb-3">4.1 Within Your Organization</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Managers and administrators in your organization may access performance data</li>
              <li>Training records may be shared with authorized personnel for coaching purposes</li>
              <li>Aggregate performance metrics may be available to organizational leaders</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">4.2 Service Providers</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Third-party AI and voice processing services</li>
              <li>Cloud storage and hosting providers</li>
              <li>Payment processors and billing services</li>
              <li>Analytics and monitoring services</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">4.3 Legal Requirements</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>When required by law or court order</li>
              <li>To protect our rights, property, or safety</li>
              <li>To prevent fraud or security threats</li>
              <li>In connection with business transfers or acquisitions</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
            <p className="mb-4">We implement comprehensive security measures to protect your information:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Encryption in transit and at rest for all sensitive data</li>
              <li>Secure access controls and authentication mechanisms</li>
              <li>Regular security audits and vulnerability assessments</li>
              <li>Employee training on data protection and privacy</li>
              <li>Incident response procedures for potential breaches</li>
              <li>Compliance with industry-standard security frameworks</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">6. Data Retention</h2>
            <p className="mb-4">We retain your information for different periods based on the type of data:</p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Voice recordings:</strong> Retained for the duration of your subscription plus 12 months</li>
              <li><strong>Training data:</strong> Retained for historical reporting and progress tracking</li>
              <li><strong>Account information:</strong> Retained while your account is active</li>
              <li><strong>Billing records:</strong> Retained as required by law (typically 7 years)</li>
              <li><strong>Usage logs:</strong> Retained for 24 months for security and analytics purposes</li>
            </ul>
            <p>
              You may request deletion of your data subject to legal and contractual obligations.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">7. Your Privacy Rights</h2>
            <p className="mb-4">Depending on your location, you may have the following rights:</p>

            <h3 className="text-xl font-semibold mb-3">7.1 General Rights</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Access to your personal information</li>
              <li>Correction of inaccurate data</li>
              <li>Deletion of your data (subject to limitations)</li>
              <li>Data portability where technically feasible</li>
              <li>Objection to certain processing activities</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">7.2 GDPR Rights (EU Users)</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Right to restriction of processing</li>
              <li>Right to withdraw consent</li>
              <li>Right to lodge a complaint with supervisory authorities</li>
              <li>Right to data protection impact assessments</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">7.3 CCPA Rights (California Users)</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Right to know what personal information is collected</li>
              <li>Right to delete personal information</li>
              <li>Right to opt-out of sale (we do not sell personal information)</li>
              <li>Right to non-discrimination for exercising privacy rights</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">8. International Data Transfers</h2>
            <p className="mb-4">
              Your information may be transferred to and processed in countries other than your country of residence.
              We ensure appropriate safeguards are in place for international transfers, including:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Standard Contractual Clauses approved by the European Commission</li>
              <li>Adequacy decisions for certain countries</li>
              <li>Certification schemes and codes of conduct</li>
              <li>Other lawful transfer mechanisms</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">9. Children's Privacy</h2>
            <p>
              Our Service is not intended for children under 16 years of age. We do not knowingly collect
              personal information from children under 16. If we become aware that we have collected
              personal information from a child under 16, we will take steps to delete such information.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">10. Changes to This Privacy Policy</h2>
            <p className="mb-4">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Posting the updated policy on our website</li>
              <li>Sending email notifications to account administrators</li>
              <li>Providing in-app notifications</li>
              <li>Giving at least 30 days notice for material changes</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">11. Contact Information</h2>
            <p className="mb-4">
              If you have questions about this Privacy Policy or want to exercise your privacy rights, please contact us:
            </p>
            <div className="bg-muted p-4 rounded-lg">
              <p className="mb-2"><strong>Privacy Officer:</strong> privacy@speakstride.com</p>
              <p className="mb-2"><strong>General Inquiries:</strong> support@speakstride.com</p>
              <p className="mb-2"><strong>Data Protection Officer (EU):</strong> dpo@speakstride.com</p>
              <p className="mb-2"><strong>Address:</strong> SpeakStride, Inc.</p>
              <p>1234 Business Ave, Suite 100</p>
              <p>San Francisco, CA 94105</p>
              <p className="mt-2"><strong>Phone:</strong> +1 (555) 123-4567</p>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}