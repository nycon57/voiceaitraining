import Image from 'next/image';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';

const teamMembers = [
  {
    name: 'David Mitchell',
    role: 'CEO & Founder',
    image: '/images/about/team/1.webp',
    bio: '8+ years in sales management. Built top-performing teams at HubSpot and Salesforce.',
  },
  {
    name: 'Sarah Kim',
    role: 'Head of AI',
    image: '/images/about/team/2.webp',
    bio: 'Former OpenAI engineer. PhD in Machine Learning from Stanford.',
  },
  {
    name: 'Marcus Chen',
    role: 'VP of Sales',
    image: '/images/about/team/3.webp',
    bio: 'Top 1% sales performer at Oracle. Knows what actually closes deals.',
  },
  {
    name: 'Emily Rodriguez',
    role: 'Head of Customer Success',
    image: '/images/about/team/4.webp',
    bio: 'Scaled customer success at Gong. Expert in sales enablement.',
  },
];

export default function AboutTeam() {
  return (
    <section className="section-padding container max-w-screen-xl">
      <h2 className="font-headline text-4xxl leading-tight tracking-tight md:text-5xl">
        Meet the team transforming sales training
      </h2>
      <p className="text-muted-foreground mt-3 max-w-2xl text-lg leading-snug">
        We're former sales leaders, AI engineers, and customer success experts who understand
        what it takes to build a world-class sales organization.
      </p>

      <Carousel
        className="mt-10"
        opts={{
          align: 'start',
          loop: false,
        }}
      >
        <CarouselContent className="cursor-grab snap-x snap-mandatory">
          {teamMembers.map((member, index) => (
            <CarouselItem
              key={index}
              className="min-w-[289px] basis-1/4 snap-start"
            >
              <Image
                src={member.image}
                alt={member.name}
                width={289}
                height={358}
              />
              <h3 className="font-headline text-accent-foreground mt-4 text-2xl font-bold">
                {member.name}
              </h3>
              <p className="text-muted-foreground font-medium">{member.role}</p>
              <p className="text-muted-foreground text-sm mt-2 leading-snug">{member.bio}</p>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}
