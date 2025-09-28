'use client';

import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Marquee } from '@/components/magicui/marquee';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

const REVIEWS = [
  {
    name: 'Sarah Mitchell',
    username: '@sarahmitchell',
    body: "Our mortgage team's closing rate improved 40% in 3 months using @speakstride. The AI scenarios feel incredibly realistic.",
    img: 'https://avatar.vercel.sh/sarahmitchell',
  },
  {
    name: 'Mike Rodriguez',
    username: '@mikerodriguez',
    body: "The AI feedback is spot on - it caught objection handling mistakes I didn't even know I was making. Game changer for sales training.",
    img: 'https://avatar.vercel.sh/mikerodriguez',
  },
  {
    name: 'Jessica Chen',
    username: '@jessicachen',
    body: '@speakstride helped me prep for difficult client calls. The talk-listen ratio insights alone improved my conversion rate by 25%.',
    img: 'https://avatar.vercel.sh/jessicachen',
  },
  {
    name: 'David Thompson',
    username: '@davidthompson',
    body: "Finally, sales training that doesn't waste time. Real scenarios, instant feedback, and measurable improvement. My reps love it.",
    img: 'https://avatar.vercel.sh/davidthompson',
  },
  {
    name: 'Amanda Foster',
    username: '@amandafoster',
    body: "The leaderboard feature created healthy competition in our team. Everyone's trying to beat their scores and it's driving real results.",
    img: 'https://avatar.vercel.sh/amandafoster',
  },
  {
    name: 'Robert Kim',
    username: '@robertkim',
    body: "@speakstride made onboarding new loan officers 10x easier. They practice difficult scenarios before talking to real clients.",
    img: 'https://avatar.vercel.sh/robertkim',
  },
];

const firstRow = REVIEWS.slice(0, REVIEWS.length / 2);
const secondRow = REVIEWS.slice(REVIEWS.length / 2);
const Testimonials = () => {
  return (
    <section className="container flex flex-col gap-y-10 overflow-x-hidden py-10 md:py-15 lg:flex-row">
      <div className="flex max-w-lg flex-col gap-15 text-balance">
        <h2 className="font-headline text-4xxl leading-tight tracking-tight md:text-5xl">
          Trusted by top sales teams
        </h2>
        <div className="space-y-7.5">
          <p className="text-muted-foreground text-lg leading-snug">
            Sales professionals across industries trust our AI-powered training
            platform to improve performance, boost confidence, and drive results.
          </p>

          <Button
            variant="ghost"
            asChild
            className="text-accent-foreground group gap-3 !px-0 hover:!bg-transparent hover:opacity-90"
          >
            <Link href="#">
              Join them today
              <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="relative -mr-[max(2rem,calc((100vw-80rem)/2+5rem))] flex flex-1 flex-col gap-2.25 overflow-hidden mask-l-from-50% mask-l-to-100%">
        <Marquee
          pauseOnHover
          className="py-0 [--duration:20s] [--gap:calc(var(--spacing)*2.25)]"
        >
          {firstRow.map((review) => (
            <ReviewCard key={review.username} {...review} />
          ))}
        </Marquee>
        <Marquee
          reverse
          pauseOnHover
          className="py-0 [--duration:20s] [--gap:calc(var(--spacing)*2.25)]"
        >
          {secondRow.map((review) => (
            <ReviewCard key={review.username} {...review} />
          ))}
        </Marquee>
      </div>
    </section>
  );
};

export default Testimonials;

const ReviewCard = ({
  img,
  name,
  username,
  body,
}: {
  img: string;
  name: string;
  username: string;
  body: string;
}) => {
  return (
    <Card
      className={cn(
        'hover:bg-accent/60 max-w-xs cursor-pointer gap-4 bg-transparent p-6 md:max-w-sm md:p-8',
        'transition-colors duration-200',
      )}
    >
      <CardHeader className="flex items-center gap-4 p-0">
        <Image
          className="rounded-full"
          width={32}
          height={32}
          alt={`${name} avatar`}
          src={img}
        />
        <div className="flex flex-col">
          <CardTitle className="text-sm font-bold">{name}</CardTitle>
          <CardDescription className="text-muted-foreground text-xs">
            {username}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <blockquote className="font-headline text-sm leading-snug">
          {body.split(/(@speakstride)/g).map((part, index) =>
            part === '@speakstride' ? (
              <span key={index} className="text-chart-1">
                {part}
              </span>
            ) : (
              part
            ),
          )}
        </blockquote>
      </CardContent>
    </Card>
  );
};
