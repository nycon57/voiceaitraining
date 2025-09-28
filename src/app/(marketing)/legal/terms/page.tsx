import { Metadata } from 'next';
import { PageHero } from '@/components/sections/page-hero';

export const metadata: Metadata = {
  title: 'Terms of Service | SpeakStride',
  description: 'Terms of Service for SpeakStride - AI-powered voice agent sales training platform. Review our terms and conditions for using our B2B SaaS platform.',
  openGraph: {
    title: 'Terms of Service | SpeakStride',
    description: 'Terms of Service for SpeakStride - AI-powered voice agent sales training platform.',
  },
};

export default function TermsOfServicePage() {
  return (
    <>
      <PageHero
        title="Terms of Service"
        description="Please read these terms and conditions carefully before using our service."
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto prose prose-gray dark:prose-invert prose-lg">
          <div className="mb-8 text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="mb-4">
              By accessing and using SpeakStride ("Service", "Platform"), operated by SpeakStride, Inc. ("Company", "we", "us", "our"),
              you accept and agree to be bound by the terms and provision of this agreement.
            </p>
            <p>
              If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p className="mb-4">
              SpeakStride is a Software-as-a-Service (SaaS) platform that provides AI-powered voice agent simulation
              for sales training purposes. Our service includes:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Interactive voice simulations with AI agents</li>
              <li>Performance scoring and analytics</li>
              <li>Training scenario management</li>
              <li>Call recordings and transcripts</li>
              <li>Team management and reporting tools</li>
              <li>Integration capabilities with third-party systems</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts and Registration</h2>
            <p className="mb-4">
              To access certain features of the Service, you must register for an account. You agree to:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain and promptly update your account information</li>
              <li>Maintain the security of your password and account</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">4. Acceptable Use Policy</h2>
            <p className="mb-4">You agree not to use the Service to:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe upon the rights of others</li>
              <li>Transmit malicious code, viruses, or harmful content</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Use the Service for any fraudulent or deceptive purposes</li>
              <li>Reverse engineer, decompile, or disassemble any part of the Service</li>
              <li>Create derivative works based on the Service</li>
              <li>Use the Service to compete with us or develop competing products</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">5. Voice Recordings and Data</h2>
            <p className="mb-4">
              By using our voice simulation features, you acknowledge and agree that:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Voice recordings will be captured and stored during training sessions</li>
              <li>Recordings may be processed using AI for analysis and scoring</li>
              <li>You have the right to record and that all participants consent to recording</li>
              <li>We will handle recordings in accordance with our Privacy Policy</li>
              <li>You are responsible for compliance with local recording laws</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">6. Subscription and Payment Terms</h2>
            <p className="mb-4">
              Our Service is offered on a subscription basis. By subscribing, you agree to:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Pay all fees and charges on time</li>
              <li>Automatic renewal of your subscription unless cancelled</li>
              <li>That fees are non-refundable except as required by law</li>
              <li>Price changes with 30 days advance notice</li>
              <li>Suspension of service for non-payment</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">7. Intellectual Property Rights</h2>
            <p className="mb-4">
              The Service and its original content, features, and functionality are and will remain
              the exclusive property of SpeakStride, Inc. and its licensors. The Service is protected
              by copyright, trademark, and other laws.
            </p>
            <p className="mb-4">
              You retain ownership of any content you create or upload, but grant us a license to use,
              modify, and display such content as necessary to provide the Service.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">8. Privacy and Data Protection</h2>
            <p className="mb-4">
              Your privacy is important to us. Our collection and use of personal information is governed
              by our Privacy Policy, which is incorporated into these Terms by reference.
            </p>
            <p>
              We implement appropriate security measures to protect your data, including voice recordings
              and personal information processed through our platform.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">9. Service Availability and Support</h2>
            <p className="mb-4">
              We strive to maintain high availability of our Service but cannot guarantee uninterrupted access.
              We may temporarily suspend the Service for maintenance, updates, or other operational reasons.
            </p>
            <p>
              Support is provided to paying subscribers according to the terms of their subscription plan.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">10. Limitation of Liability</h2>
            <p className="mb-4">
              In no event shall SpeakStride, Inc., nor its directors, employees, partners, agents, suppliers,
              or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages,
              including without limitation, loss of profits, data, use, goodwill, or other intangible losses,
              resulting from your use of the Service.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">11. Termination</h2>
            <p className="mb-4">
              We may terminate or suspend your account and bar access to the Service immediately, without prior
              notice or liability, under our sole discretion, for any reason whatsoever and without limitation,
              including but not limited to a breach of the Terms.
            </p>
            <p>
              You may terminate your account at any time by cancelling your subscription through your account settings.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">12. Governing Law</h2>
            <p className="mb-4">
              These Terms shall be interpreted and governed by the laws of the State of Delaware, United States,
              without regard to its conflict of law provisions.
            </p>
            <p>
              Any disputes arising from these Terms or your use of the Service shall be resolved through binding
              arbitration in accordance with the rules of the American Arbitration Association.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">13. Changes to Terms</h2>
            <p className="mb-4">
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time.
              If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
            </p>
            <p>
              Your continued use of the Service after any such changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">14. Contact Information</h2>
            <p className="mb-4">
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <div className="bg-muted p-4 rounded-lg">
              <p className="mb-2"><strong>Email:</strong> legal@speakstride.com</p>
              <p className="mb-2"><strong>Address:</strong> SpeakStride, Inc.</p>
              <p>1234 Business Ave, Suite 100</p>
              <p>San Francisco, CA 94105</p>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}