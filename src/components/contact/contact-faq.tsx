'use client'

import { HelpCircle, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

const faqData = [
  {
    question: 'How quickly can we get started?',
    answer: 'Most organizations can be onboarded within 1-2 weeks. This includes initial setup, user provisioning, and training content configuration. Enterprise clients with complex requirements may need 2-4 weeks for full deployment.',
  },
  {
    question: 'What industries do you support?',
    answer: 'While our platform is industry-agnostic, we specialize in loan officer training and have pre-built scenarios for mortgage, auto, and personal loans. We also support insurance sales, real estate, and other consultative sales verticals.',
  },
  {
    question: 'How does pricing work?',
    answer: 'Our pricing is based on the number of active users and features required. We offer tiered plans starting with essential features for small teams, scaling up to enterprise plans with advanced analytics, integrations, and dedicated support.',
  },
  {
    question: 'Do you offer implementation support?',
    answer: 'Yes, all clients receive dedicated onboarding support including platform setup, user training, and content customization. Enterprise clients get a dedicated customer success manager and priority support.',
  },
  {
    question: 'Can we integrate with our existing systems?',
    answer: 'Absolutely. We offer webhooks, API integrations, and pre-built connectors for popular CRM and LMS platforms. Our team will work with you to ensure seamless integration with your existing workflow.',
  },
  {
    question: 'Is there a free trial available?',
    answer: 'We offer personalized demos and proof-of-concept deployments for qualified prospects. Contact our sales team to discuss trial options that fit your evaluation needs.',
  },
];

export default function ContactFAQ() {
  return (
    <div className="mt-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Get answers to common questions about our AI sales training platform.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-4">
        {faqData.map((faq, index) => (
          <Collapsible key={index}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <CardTitle className="flex items-center justify-between text-left">
                    <span className="flex items-center gap-2">
                      <HelpCircle className="h-5 w-5" />
                      {faq.question}
                    </span>
                    <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ))}
      </div>
    </div>
  );
}