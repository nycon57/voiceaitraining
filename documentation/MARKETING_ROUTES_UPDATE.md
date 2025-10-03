# Marketing Routes Update Summary

**Date**: September 30, 2025
**Purpose**: Update guide for all marketing route files to support individual users

---

## Routes Requiring Updates

### Priority 1: Critical Updates

#### 1. `/src/app/(marketing)/page.tsx` - Home Page
**Changes Required**:
- Update hero headline to dual-purpose messaging
- Add "Choose Your Path" section (Individual vs Team)
- Update CTAs: "Start Free" (individual) and "Book Demo" (team)
- Update social proof to mention both individuals and teams
- Add individual user testimonials

**Key Sections**:
```typescript
// Add new section after hero
<UseCaseSelector />
  - Individual path → /for/individuals
  - Team path → /pricing (team toggle)

// Update hero
<Hero
  headline="Master Sales Conversations with AI That Feels Real"
  subheadline="Whether you're a solo practitioner or leading a team..."
  primaryCTA={{ text: "Start Free Training", href: "/sign-up" }}
  secondaryCTA={{ text: "Book Team Demo", href: "/request-demo" }}
/>
```

---

#### 2. `/src/app/(marketing)/pricing/page.tsx` - Pricing Page
**Changes Required**:
- Add Individual/Team toggle at top
- Create `IndividualPricingSection` component
- Update pricing cards to show:
  - Individual: Free, Pro, Ultra
  - Team: Starter, Professional, Enterprise
- Add comparison table with plan features
- Update FAQs for individual plans

**Component Structure**:
```typescript
export default function PricingPage() {
  const [planType, setPlanType] = useState<'individual' | 'team'>('individual')

  return (
    <>
      <PricingHeader />
      <PlanTypeToggle value={planType} onChange={setPlanType} />

      {planType === 'individual' ? (
        <IndividualPricingGrid />
      ) : (
        <TeamPricingGrid />
      )}

      <ComparisonTable planType={planType} />
      <PricingFAQ planType={planType} />
    </>
  )
}
```

---

#### 3. `/src/app/(marketing)/features/page.tsx` - Features Overview
**Changes Required**:
- Add badges to features showing plan availability
  - "All Plans" - Available to everyone
  - "Pro & Above" - Individual Pro/Ultra + all team plans
  - "Teams Only" - Team-exclusive features
- Update copy to address both individuals and teams
- Add individual use case examples

**Example**:
```typescript
<FeatureCard
  title="Voice AI Simulation"
  description="Practice with AI that feels real"
  badge="All Plans"
  individualExample="Practice your freelance pitch privately"
  teamExample="Train 50 reps simultaneously"
/>
```

---

### Priority 2: New Pages to Create

#### 4. `/src/app/(marketing)/for/individuals/page.tsx` - NEW
**Purpose**: Landing page for solo practitioners
**Content**:
- Hero: "Master Sales on Your Own Schedule"
- Pain points: Working solo, no coach, need practice
- How it works (3 steps)
- Individual pricing (Free, Pro, Ultra)
- Individual testimonials
- FAQ for individuals
- CTA: "Start Free Training"

**Template**:
```typescript
export default function IndividualsPage() {
  return (
    <>
      <Hero
        headline="Master Sales on Your Own Schedule"
        subheadline="Practice real conversations with AI..."
      />
      <PainPoints audience="individual" />
      <HowItWorks />
      <IndividualPricing />
      <Testimonials type="individual" />
      <FAQ type="individual" />
      <CTA text="Start Free Training" />
    </>
  )
}
```

---

#### 5. `/src/app/(marketing)/for/freelancers/page.tsx` - NEW
**Purpose**: Targeted page for freelancers
**Content**:
- Hero: "Close More Clients as a Freelancer"
- Pain points specific to freelancers
- ROI calculator (one extra client = 12 months paid)
- Freelancer testimonials
- Pro plan highlighted
- CTA: "Start Your Free Trial"

---

#### 6. `/src/app/(marketing)/for/consultants/page.tsx` - NEW
**Purpose**: Premium positioning for consultants
**Content**:
- Hero: "Consultants: Train Like the Elite"
- Focus on high-stakes, complex sales
- Ultra plan highlighted
- Premium testimonials
- API access feature callout
- CTA: "Go Ultra"

---

### Priority 3: Feature Page Updates

#### 7. `/src/app/(marketing)/features/ai-scoring/page.tsx`
**Changes Required**:
- Add "Available on all plans" badge
- Show individual vs team scoring views
- Individual example: Personal improvement tracking
- Team example: Leaderboard and team rankings

---

#### 8. `/src/app/(marketing)/features/voice-simulation/page.tsx`
**Changes Required**:
- Update usage limits by plan
  - Free: 10 sessions/month
  - Pro: 100 sessions/month
  - Ultra: 500 sessions/month
  - Team: Unlimited
- Add individual practice scenarios
- Show team assignment workflows

---

#### 9. `/src/app/(marketing)/features/analytics/page.tsx`
**Changes Required**:
- Differentiate individual vs team analytics
  - Individual: Personal performance tracking
  - Team: Manager dashboards, team reports
- Add "Pro & Above" badge to advanced analytics
- Add "Teams Only" badge to team-specific features

---

### Priority 4: Industry Page Updates

#### 10-13. Industry Pages (Mortgage, Insurance, Healthcare, Tech Sales)
**Changes Required for All**:
- Add section: "For Individual [Industry] Professionals"
- Show use cases for both individuals and teams
- Update CTAs:
  - Individual CTA: "Start Free"
  - Team CTA: "Book Demo"

**Example for Mortgage**:
```typescript
<Section>
  <h2>For Individual Loan Officers</h2>
  <p>Practice rate objections, explain complex products, perfect your pitch—on your own time.</p>
  <Button href="/for/individuals">Start Free Training</Button>
</Section>

<Section>
  <h2>For Mortgage Teams</h2>
  <p>Train your entire team on compliance, objection handling, and product knowledge—at scale.</p>
  <Button href="/request-demo">Book Team Demo</Button>
</Section>
```

---

### Priority 5: Supporting Pages

#### 14. `/src/app/(marketing)/about/page.tsx`
**Changes Required**:
- Update mission statement to include individuals
  - Old: "Help sales teams train better"
  - New: "Help sales professionals train better—individually or as a team"
- Add "Who we serve" section mentioning both segments

---

#### 15. `/src/app/(marketing)/contact/page.tsx`
**Changes Required**:
- Add "What are you interested in?" field
  - Options: Individual Plan, Team Plan, Partnership, Other
- Route submissions accordingly (sales team for teams, support for individuals)

---

#### 16. `/src/app/(marketing)/request-demo/page.tsx`
**Changes Required**:
- Update form to capture:
  - Company name (optional for individuals)
  - Team size (optional for individuals)
  - Role (add "Individual" option)
- Show different confirmation messages based on user type

---

### Priority 6: Resources and Legal

#### 17. `/src/app/(marketing)/resources/page.tsx`
**Changes Required**:
- Add individual-focused content categories
- Filter by audience (All, Individual, Team)
- Update featured articles to include individual topics

---

#### 18. Legal Pages (Terms, Privacy, etc.)
**Changes Required**:
- Update terms to address both individual and team accounts
- Clarify subscription terms for personal plans
- Add section on personal to team conversions

---

## Component Updates Needed

### New Components to Create

#### `PlanTypeToggle.tsx`
```typescript
export function PlanTypeToggle({ value, onChange }: Props) {
  return (
    <div className="flex justify-center">
      <div className="inline-flex rounded-lg border p-1">
        <button
          onClick={() => onChange('individual')}
          className={cn(
            'rounded-md px-8 py-2 text-sm font-medium transition-colors',
            value === 'individual'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Individual
        </button>
        <button
          onClick={() => onChange('team')}
          className={cn(
            'rounded-md px-8 py-2 text-sm font-medium transition-colors',
            value === 'team'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Team
        </button>
      </div>
    </div>
  )
}
```

#### `UseCaseSelector.tsx`
```typescript
export function UseCaseSelector() {
  return (
    <section className="py-24">
      <div className="container">
        <h2 className="text-center text-3xl font-bold">
          How will you use Voice AI Training?
        </h2>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          <UseCaseCard
            icon={User}
            title="I'm an Individual"
            description="Practice solo, get instant feedback, improve at my own pace"
            features={['10 free sessions', 'Instant AI feedback', 'Personal analytics']}
            href="/for/individuals"
            cta="See Plans"
          />

          <UseCaseCard
            icon={Users}
            title="I'm on a Team"
            description="Train my team, track progress, assign scenarios, measure ROI"
            features={['Team management', 'Leaderboards', 'Manager dashboards']}
            href="/request-demo"
            cta="Book Demo"
          />
        </div>
      </div>
    </section>
  )
}
```

#### `IndividualPricingCard.tsx`
```typescript
export function IndividualPricingCard({
  plan,
  featured = false
}: {
  plan: IndividualPlan
  featured?: boolean
}) {
  return (
    <Card className={cn(featured && 'border-2 border-primary')}>
      {featured && <Badge>Most Popular</Badge>}

      <CardHeader>
        <CardTitle>{plan.name}</CardTitle>
        <p className="text-muted-foreground">{plan.description}</p>
      </CardHeader>

      <CardContent>
        <div className="mb-6">
          <span className="text-4xl font-bold">${plan.price.monthly}</span>
          <span className="text-muted-foreground">/month</span>
        </div>

        <ul className="space-y-3">
          <li>✓ {plan.limits.max_sessions_per_month} sessions/month</li>
          <li>✓ {plan.limits.max_scenarios} scenarios</li>
          <li>✓ AI feedback</li>
          {plan.features.performance_analytics && <li>✓ Analytics</li>}
          {plan.features.ai_scenario_generation && <li>✓ AI generation</li>}
          {plan.features.custom_voices && <li>✓ Custom voices</li>}
          {plan.features.api_access && <li>✓ API access</li>}
        </ul>

        <Button className="mt-6 w-full">{plan.cta}</Button>
      </CardContent>
    </Card>
  )
}
```

---

## SEO Updates

### Meta Tags to Add

#### Home Page
```typescript
export const metadata: Metadata = {
  title: 'Voice AI Training - Sales Training for Individuals and Teams',
  description: 'Practice sales calls with AI. Perfect for solo practitioners and teams. Free plan available.',
  keywords: 'sales training, AI sales coach, practice sales calls, individual sales training, team training',
}
```

#### Individual Landing Page
```typescript
export const metadata: Metadata = {
  title: 'Individual Sales Training - Practice Solo with AI | Voice AI Training',
  description: 'Master sales on your own schedule. Practice calls, get instant feedback, close more deals. Start free.',
  keywords: 'individual sales training, solo sales practice, AI sales coach, freelance sales',
}
```

---

## Analytics Tracking

### Events to Track

**Individual User Events**:
- `individual_landing_view` - Viewed /for/individuals
- `individual_pricing_view` - Viewed individual plans
- `individual_plan_select` - Selected individual plan (free/pro/ultra)
- `individual_signup` - Completed individual signup

**Team User Events** (Existing):
- `team_demo_request` - Requested team demo
- `team_pricing_view` - Viewed team plans
- `team_signup` - Completed team signup

**Conversion Events**:
- `plan_type_toggle` - Toggled between individual/team on pricing
- `use_case_select` - Selected individual or team path on home
- `upgrade_intent` - Clicked upgrade CTA

---

## Implementation Priority

### Week 1 (Critical)
1. ✅ Home page updates (hero, use case selector)
2. ✅ Pricing page (individual/team toggle)
3. ✅ Create `/for/individuals` page

### Week 2 (High Priority)
4. ✅ Feature page updates (badges, plan availability)
5. ✅ Create `/for/freelancers` and `/for/consultants`
6. ✅ Update industry pages

### Week 3 (Medium Priority)
7. ✅ About page updates
8. ✅ Contact/demo form updates
9. ✅ Resources page filtering

### Week 4 (Low Priority)
10. ✅ Legal pages updates
11. ✅ SEO meta tags
12. ✅ Analytics event tracking

---

## Testing Checklist

- [ ] Individual pricing toggle works correctly
- [ ] All CTAs route to correct pages
- [ ] Use case selector shows appropriate content
- [ ] Individual testimonials display properly
- [ ] Mobile responsive on all new pages
- [ ] SEO meta tags present on all pages
- [ ] Analytics events firing correctly
- [ ] Forms capture individual vs team correctly

---

## Success Metrics

**Landing Page Performance**:
- Home → Individual path: >30% of visitors
- /for/individuals conversion rate: >15%
- Pricing page engagement: >3 min avg time

**SEO Performance**:
- Rank for "individual sales training" (top 10)
- Rank for "AI sales coach" (top 10)
- Organic traffic from individual keywords: >40%

---

## Next Steps

1. Review and approve this plan
2. Prioritize pages by business impact
3. Create design mockups for new pages
4. Implement week 1 critical updates
5. A/B test messaging and CTAs
6. Monitor conversion rates by segment
7. Iterate based on data

---

*End of Marketing Routes Update Guide*