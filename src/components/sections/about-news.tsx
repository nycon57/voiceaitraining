import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const newsItems = [
  {
    id: 1,
    logo: {
      src: '/images/logos/forbes.svg',
      alt: 'Forbes',
      width: 162,
      height: 42,
      className: 'invert dark:invert-0',
    },
    title:
      'Voice AI Training is revolutionizing sales enablement. Their AI-powered simulation platform has helped 500+ teams increase close rates by an average of 40% in just 90 days.',
    readMoreLink: '#',
  },
  {
    id: 2,
    logo: {
      src: '/images/logos/tc.svg',
      alt: 'TechCrunch',
      width: 84,
      height: 42,
    },
    title:
      'The future of sales training is here. Voice AI Training\'s realistic conversation simulations provide unlimited practice opportunities without the scheduling headaches of traditional roleplay.',
    readMoreLink: '#',
  },
  {
    id: 3,
    logo: {
      src: '/images/logos/the-guardian.svg',
      alt: 'The Guardian',
      width: 127.8,
      height: 48,
      className: 'invert dark:invert-0',
    },
    title:
      "Enterprise sales teams are seeing unprecedented results with AI-powered training. Voice AI Training's platform transforms struggling reps into confident closers in weeks, not months.",
    readMoreLink: '#',
  },
];

export default function AboutNews() {
  return (
    <section className="section-padding bg-muted/40">
      <div className="container">
        <h2 className="font-headline text-4xxl leading-tight tracking-tight md:text-5xl">
          Leading publications are taking notice
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {newsItems.map((item) => (
            <div key={item.id} className="space-y-3">
              <Image
                src={item.logo.src}
                alt={item.logo.alt}
                width={item.logo.width}
                height={item.logo.height}
                className={cn`object-contain ${item.logo.className}`}
              />

              <p className="text-accent-foreground text-lg leading-snug">
                {item.title}
              </p>

              <Button
                variant="ghost"
                asChild
                className="group gap-3 !px-0 font-normal transition-opacity hover:!bg-transparent hover:opacity-95"
              >
                <Link href={item.readMoreLink}>
                  Read more
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
