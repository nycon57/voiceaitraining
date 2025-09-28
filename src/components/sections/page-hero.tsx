'use client';

import { LucideIcon } from 'lucide-react';

import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Aurora from '@/components/ui/aurora';

interface PageHeroProps {
  badge?: {
    text: string;
    subtext?: string;
  };
  title: string;
  description: string;
  cta?: {
    text: string;
    icon?: LucideIcon;
    href?: string;
    onClick?: () => void;
  };
  socialProof?: {
    avatars: string[];
    text: string;
  };
}

const PageHero = ({
  badge,
  title,
  description,
  cta,
  socialProof
}: PageHeroProps) => {
  return (
    <section className="relative py-16 md:py-32 overflow-hidden">
      {/* Aurora Background - Full viewport width, 65% height */}
      <div className="absolute inset-x-0 top-0 -z-10 h-[65%]">
        <Aurora
          colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
          blend={0.5}
          amplitude={1.0}
          speed={0.5}
        />
      </div>

      <div className="container px-4 sm:px-6 md:px-8 relative z-10">
        {badge && (
          <div className="flex w-fit items-center rounded-full border border-border bg-background p-1 text-xs mb-8">
            <Badge variant="secondary" className="rounded-full text-xs">
              {badge.text}
            </Badge>
            {badge.subtext && (
              <span className="px-3 text-muted-foreground">{badge.subtext}</span>
            )}
          </div>
        )}

        <h1 className="font-headline text-5xl tracking-tight md:text-6xl lg:text-7xl xl:text-8xl">
          {title}
        </h1>

        <div className="mt-10 flex flex-col gap-8 md:mt-12 md:flex-row md:items-center md:justify-between lg:mt-14">
          <p className="w-full md:w-[62%] text-xl leading-relaxed text-muted-foreground">
            {description}
          </p>

          <div className="flex flex-col gap-6">
            {cta && (
              <Button
                className="px-6 py-5 sm:w-fit"
                asChild={!!cta.href}
                onClick={cta.onClick}
              >
                {cta.href ? (
                  <a href={cta.href} className="flex items-center">
                    {cta.text} {cta.icon && <cta.icon className="ml-2 size-4" />}
                  </a>
                ) : (
                  <span className="flex items-center">
                    {cta.text} {cta.icon && <cta.icon className="ml-2 size-4" />}
                  </span>
                )}
              </Button>
            )}

            {socialProof && (
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center -space-x-1.5">
                  {socialProof.avatars.map((avatar, index) => (
                    <Avatar key={index} className="size-7 border border-border">
                      <AvatarImage
                        src={avatar}
                        alt={`Customer ${index + 1}`}
                      />
                    </Avatar>
                  ))}
                </span>
                <p className="text-sm text-muted-foreground">
                  {socialProof.text}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export { PageHero };