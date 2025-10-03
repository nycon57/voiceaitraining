# Individual User Support - Comprehensive Implementation Plan

**Project**: Voice AI Training Platform
**Feature**: Support for individual users (not in organizations)
**Date**: September 30, 2025
**Status**: Planning Phase

---

## Executive Summary

This document outlines a comprehensive plan to add individual user support to the Voice AI Training platform, which currently requires all users to be part of an organization. The plan includes database changes, authentication/authorization updates, billing modifications, UI/UX changes, and marketing messaging updates.

**Recommended Approach**: Personal Organization Pattern (auto-create personal org for individual users)

**Timeline**: 2-3 weeks implementation
**Risk Level**: Low (minimal schema changes)
**Business Impact**: Opens platform to solo practitioners, freelancers, and individuals

---

## Current State Analysis

### Architecture Overview

The platform is **strictly organization-scoped**:

- **Database**: All 7 core tables require non-null `org_id` foreign keys
- **Authentication**: Clerk JWT claims include `org_id` for all users
- **Authorization**: All RLS policies filter by `org_id`
- **Billing**: Stripe subscriptions tied to organizations
- **UI**: Role-based views assume org context (admin, manager, trainee, hr)

### Key Dependencies

| Component | Org Dependency | Impact Level |
|-----------|---------------|--------------|
| Database Tables | 7 tables with NOT NULL `org_id` | 🔴 High |
| RLS Policies | 30+ policies check `org_id` | 🔴 High |
| Server Actions | All actions use `withOrgGuard` | 🔴 High |
| Billing System | Org-scoped subscriptions | 🟡 Medium |
| UI Components | Role-based, org-aware | 🟡 Medium |
| Storage Paths | Include `org_id` in folder structure | 🟢 Low |

---

## Strategic Options Analysis

### Option 1: Personal Organization Pattern ⭐ RECOMMENDED

**Concept**: Auto-create a personal org for each individual user at signup.

#### Architecture
```
Individual User Sign-Up
    ↓
Create Personal Org
  - name: "John's Workspace"
  - slug: "personal-{clerk_user_id}"
  - plan: "individual_free" or "individual_pro"
  - is_personal: true (new flag)
    ↓
Create User Record
  - org_id: {personal_org_id}
  - role: "trainee" (default)
    ↓
Set JWT Claim
  - org_id: {personal_org_id}
    ↓
User Uses Platform
  (All existing code works unchanged)
```

#### Pros ✅
- **Zero database schema changes** (no ALTER TABLE)
- **Zero RLS policy changes** (existing policies work)
- **Minimal code changes** (webhook + UI conditionals)
- **Fast implementation** (3-5 days vs 2-3 weeks)
- **Low risk** (no breaking changes)
- **Seamless upgrade path** (personal → team org)
- **Existing indexes remain effective**
- **Security model unchanged**

#### Cons ❌
- Additional org records in database (1 per individual user)
- Slight conceptual overhead ("fake" orgs for individuals)
- Need to hide org/team features in UI for personal users

#### Implementation Complexity
- **Database**: Add `is_personal` boolean to `orgs` table
- **Backend**: Modify Clerk webhook to auto-create org
- **Frontend**: Conditional UI based on `is_personal` flag
- **Billing**: Personal plan pricing (separate from team pricing)

---

### Option 2: Nullable org_id with Dual Model

**Concept**: Make `org_id` nullable and support both org-scoped and user-scoped queries.

#### Architecture
```
Individual User Sign-Up
    ↓
Create User Record
  - org_id: NULL
  - role: N/A (no role without org)
    ↓
Update All Queries
  - Filter by org_id OR clerk_user_id
    ↓
Update All RLS Policies
  - WHERE (org_id = X OR user_id = Y)
```

#### Pros ✅
- Clean separation between individual and org users
- No "fake" org records
- Clear data model

#### Cons ❌
- **Major database migration** (7 tables, drop/recreate FKs)
- **30+ RLS policies must be rewritten**
- **13+ indexes must be recreated** (partial indexes)
- **All server actions need dual-path logic**
- **Storage bucket restructuring**
- **High risk of breaking changes**
- **2-3 weeks implementation time**
- **Complex testing requirements**
- **Performance impact** (less effective composite indexes)

#### Implementation Complexity
- **Database**: Alter 7 tables, rewrite 30+ policies, recreate 13+ indexes
- **Backend**: Rewrite all server actions with conditional logic
- **Frontend**: Parallel UI components for org vs individual
- **Testing**: Extensive regression testing required

---

### Option 3: Separate Personal Schema

**Concept**: Create parallel `personal_*` tables for individual users.

#### Pros ✅
- Zero impact on existing org architecture
- Can optimize personal tables independently

#### Cons ❌
- **Massive code duplication**
- **Two codebases to maintain**
- **Difficult migration path** (personal → org)
- **Complex reporting** (union queries)
- **DRY violations**

**Status**: ❌ Not recommended

---

## Recommended Implementation: Personal Organization Pattern

### Phase 1: Database Foundation (Day 1)

#### 1.1 Add Personal Org Flag

```sql
-- Migration: 0009_add_personal_org_support.sql

-- Add is_personal flag to orgs table
ALTER TABLE orgs
ADD COLUMN is_personal BOOLEAN DEFAULT false NOT NULL;

-- Add personal plan limits
ALTER TABLE orgs
ADD COLUMN personal_user_clerk_id TEXT UNIQUE;

-- Create index for personal org lookups
CREATE INDEX idx_orgs_personal_user ON orgs(personal_user_clerk_id)
WHERE is_personal = true;

-- Add constraint: personal orgs must have personal_user_clerk_id
ALTER TABLE orgs
ADD CONSTRAINT personal_org_requires_clerk_id
CHECK (
  (is_personal = false AND personal_user_clerk_id IS NULL)
  OR
  (is_personal = true AND personal_user_clerk_id IS NOT NULL)
);

-- Add personal plan types
ALTER TABLE orgs
ADD CONSTRAINT valid_personal_plans
CHECK (
  (is_personal = false)
  OR
  (is_personal = true AND plan IN ('individual_free', 'individual_pro', 'individual_ultra'))
);

COMMENT ON COLUMN orgs.is_personal IS
  'True if this is a personal workspace for a single individual user';
COMMENT ON COLUMN orgs.personal_user_clerk_id IS
  'Clerk user ID for personal workspace owner (null for team orgs)';
```

#### 1.2 Create Helper Functions

```sql
-- Function to create personal org for new user
CREATE OR REPLACE FUNCTION create_personal_org(
  p_clerk_user_id TEXT,
  p_first_name TEXT,
  p_email TEXT,
  p_plan TEXT DEFAULT 'individual_free'
) RETURNS UUID AS $$
DECLARE
  v_org_id UUID;
  v_org_name TEXT;
  v_org_slug TEXT;
BEGIN
  -- Generate unique org name and slug
  v_org_name := p_first_name || '''s Workspace';
  v_org_slug := 'personal-' || p_clerk_user_id;

  -- Create personal org
  INSERT INTO orgs (
    name,
    slug,
    plan,
    is_personal,
    personal_user_clerk_id,
    plan_limits,
    settings
  ) VALUES (
    v_org_name,
    v_org_slug,
    p_plan,
    true,
    p_clerk_user_id,
    CASE
      WHEN p_plan = 'individual_free' THEN
        '{"max_users": 1, "max_sessions_per_month": 10, "max_scenarios": 3, "ai_generation": false}'::jsonb
      WHEN p_plan = 'individual_pro' THEN
        '{"max_users": 1, "max_sessions_per_month": 100, "max_scenarios": 50, "ai_generation": true}'::jsonb
      ELSE
        '{"max_users": 1, "max_sessions_per_month": 500, "max_scenarios": 200, "ai_generation": true}'::jsonb
    END,
    '{"show_team_features": false, "show_leaderboard": false}'::jsonb
  )
  RETURNING id INTO v_org_id;

  RETURN v_org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is in personal org
CREATE OR REPLACE FUNCTION is_personal_org_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM orgs
    WHERE id = get_current_org_id()
    AND is_personal = true
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get personal org for user
CREATE OR REPLACE FUNCTION get_personal_org_id(p_clerk_user_id TEXT)
RETURNS UUID AS $$
  SELECT id FROM orgs
  WHERE personal_user_clerk_id = p_clerk_user_id
  AND is_personal = true
  LIMIT 1;
$$ LANGUAGE sql STABLE;

-- Function to convert personal org to team org
CREATE OR REPLACE FUNCTION convert_personal_to_team_org(
  p_org_id UUID,
  p_new_name TEXT,
  p_new_slug TEXT,
  p_new_plan TEXT DEFAULT 'starter'
) RETURNS VOID AS $$
BEGIN
  -- Validate this is a personal org
  IF NOT EXISTS (
    SELECT 1 FROM orgs
    WHERE id = p_org_id AND is_personal = true
  ) THEN
    RAISE EXCEPTION 'Organization % is not a personal workspace', p_org_id;
  END IF;

  -- Convert to team org
  UPDATE orgs
  SET
    is_personal = false,
    personal_user_clerk_id = NULL,
    name = p_new_name,
    slug = p_new_slug,
    plan = p_new_plan,
    plan_limits = '{"max_users": 10, "max_sessions_per_month": 100, "max_scenarios": 20, "ai_generation": true}'::jsonb,
    settings = '{"show_team_features": true, "show_leaderboard": true}'::jsonb
  WHERE id = p_org_id;

  -- Update user role from trainee to admin
  UPDATE users
  SET role = 'admin'
  WHERE org_id = p_org_id
  AND role = 'trainee';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### 1.3 Update Plan Limits Configuration

```sql
-- Add individual plan pricing metadata
INSERT INTO public.plan_configurations (plan_type, limits, features, pricing) VALUES
('individual_free',
 '{"max_users": 1, "max_sessions_per_month": 10, "max_scenarios": 3}'::jsonb,
 '["voice_training", "basic_feedback", "transcript_access"]'::jsonb,
 '{"monthly": 0, "annual": 0}'::jsonb
),
('individual_pro',
 '{"max_users": 1, "max_sessions_per_month": 100, "max_scenarios": 50}'::jsonb,
 '["voice_training", "ai_feedback", "transcript_access", "performance_analytics", "ai_scenario_generation"]'::jsonb,
 '{"monthly": 29, "annual": 290}'::jsonb
),
('individual_ultra',
 '{"max_users": 1, "max_sessions_per_month": 500, "max_scenarios": 200}'::jsonb,
 '["all_features", "priority_support", "custom_voices", "api_access"]'::jsonb,
 '{"monthly": 99, "annual": 990}'::jsonb
)
ON CONFLICT (plan_type) DO UPDATE
SET limits = EXCLUDED.limits, features = EXCLUDED.features, pricing = EXCLUDED.pricing;
```

---

### Phase 2: Backend Integration (Days 2-3)

#### 2.1 Update Clerk Webhook Handler

**File**: `src/app/api/webhooks/clerk/route.ts`

```typescript
// Add to user.created event handler
case 'user.created': {
  const { id, email_addresses, first_name, last_name, image_url } = evt.data
  const primaryEmail = email_addresses.find(e => e.id === evt.data.primary_email_address_id)

  // Check if user is joining an existing org via invitation
  const hasOrgInvitation = evt.data.public_metadata?.pending_org_id

  if (!hasOrgInvitation) {
    // Create personal org for individual user
    const { data: personalOrgId, error: orgError } = await supabase
      .rpc('create_personal_org', {
        p_clerk_user_id: id,
        p_first_name: first_name || 'User',
        p_email: primaryEmail?.email_address || '',
        p_plan: 'individual_free'
      })

    if (orgError) {
      console.error('Failed to create personal org:', orgError)
      return new Response('Failed to create personal org', { status: 500 })
    }

    // Create user record with personal org
    const { error: userError } = await supabase
      .from('users')
      .insert({
        clerk_user_id: id,
        org_id: personalOrgId,
        role: 'trainee', // Personal users are always trainees
        email: primaryEmail?.email_address,
        first_name: first_name || '',
        last_name: last_name || '',
        avatar_url: image_url,
        is_active: true,
      })

    if (userError) {
      console.error('Failed to create user:', userError)
      return new Response('Failed to create user', { status: 500 })
    }

    // Update Clerk metadata with org_id for JWT claims
    await clerkClient.users.updateUserMetadata(id, {
      publicMetadata: {
        org_id: personalOrgId,
        role: 'trainee',
        is_personal_org: true,
      },
    })

    console.log(`✅ Created personal org for user ${id}`)
  } else {
    // User is joining existing org via invitation
    // ... existing org invitation logic
  }

  break
}
```

#### 2.2 Create Personal Org Type Definitions

**File**: `src/types/plans.ts`

```typescript
export type TeamPlanType = 'starter' | 'professional' | 'enterprise'
export type IndividualPlanType = 'individual_free' | 'individual_pro' | 'individual_ultra'
export type PlanType = TeamPlanType | IndividualPlanType

export interface PlanLimits {
  max_users: number
  max_sessions_per_month: number
  max_scenarios: number
  ai_generation: boolean
}

export interface PlanFeatures {
  voice_training: boolean
  ai_feedback: boolean
  transcript_access: boolean
  performance_analytics: boolean
  ai_scenario_generation: boolean
  team_management: boolean
  leaderboards: boolean
  custom_voices: boolean
  api_access: boolean
  priority_support: boolean
}

export interface IndividualPlan {
  type: IndividualPlanType
  name: string
  description: string
  price: {
    monthly: number
    annual: number
  }
  limits: PlanLimits
  features: PlanFeatures
  cta: string
  popular?: boolean
}

export const INDIVIDUAL_PLANS: Record<IndividualPlanType, IndividualPlan> = {
  individual_free: {
    type: 'individual_free',
    name: 'Free',
    description: 'Perfect for getting started',
    price: { monthly: 0, annual: 0 },
    limits: {
      max_users: 1,
      max_sessions_per_month: 10,
      max_scenarios: 3,
      ai_generation: false,
    },
    features: {
      voice_training: true,
      ai_feedback: true,
      transcript_access: true,
      performance_analytics: false,
      ai_scenario_generation: false,
      team_management: false,
      leaderboards: false,
      custom_voices: false,
      api_access: false,
      priority_support: false,
    },
    cta: 'Start Free',
  },
  individual_pro: {
    type: 'individual_pro',
    name: 'Pro',
    description: 'For serious practitioners',
    price: { monthly: 29, annual: 290 },
    limits: {
      max_users: 1,
      max_sessions_per_month: 100,
      max_scenarios: 50,
      ai_generation: true,
    },
    features: {
      voice_training: true,
      ai_feedback: true,
      transcript_access: true,
      performance_analytics: true,
      ai_scenario_generation: true,
      team_management: false,
      leaderboards: false,
      custom_voices: false,
      api_access: false,
      priority_support: false,
    },
    cta: 'Start Pro',
    popular: true,
  },
  individual_ultra: {
    type: 'individual_ultra',
    name: 'Ultra',
    description: 'Maximum power for power users',
    price: { monthly: 99, annual: 990 },
    limits: {
      max_users: 1,
      max_sessions_per_month: 1000,
      max_scenarios: 1000,
      ai_generation: true,
    },
    features: {
      voice_training: true,
      ai_feedback: true,
      transcript_access: true,
      performance_analytics: true,
      ai_scenario_generation: true,
      team_management: false,
      leaderboards: false,
      custom_voices: true,
      api_access: true,
      priority_support: true,
    },
    cta: 'Start Enterprise',
  },
}

export function isIndividualPlan(plan: PlanType): plan is IndividualPlanType {
  return plan.startsWith('individual_')
}

export function isTeamPlan(plan: PlanType): plan is TeamPlanType {
  return !plan.startsWith('individual_')
}
```

#### 2.3 Update Auth Helpers

**File**: `src/lib/auth.ts`

```typescript
// Add helper to check if user is in personal org
export async function isPersonalOrgUser(user: AuthUser): Promise<boolean> {
  if (!user.orgId) return false

  const supabase = await createClient()
  const { data } = await supabase
    .from('orgs')
    .select('is_personal')
    .eq('id', user.orgId)
    .single()

  return data?.is_personal === true
}

// Add helper to get org details including personal flag
export async function getOrgDetails(orgId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('orgs')
    .select('id, name, slug, plan, is_personal, settings, plan_limits')
    .eq('id', orgId)
    .single()

  if (error) throw error
  return data
}

// Update getCurrentUser to include personal org flag
export async function getCurrentUser(): Promise<AuthUser | null> {
  const user = await currentUser()
  if (!user) return null

  const supabase = await createAdminClient()
  const { data: dbUser, error } = await supabase
    .from('users')
    .select(`
      role,
      org_id,
      first_name,
      last_name,
      email,
      orgs!inner(is_personal)
    `)
    .eq('clerk_user_id', user.id)
    .limit(1)
    .single()

  if (error || !dbUser) {
    console.error('Failed to fetch user:', error)
    return null
  }

  return {
    id: user.id,
    email: dbUser.email,
    firstName: dbUser.first_name,
    lastName: dbUser.last_name,
    role: dbUser.role,
    orgId: dbUser.org_id,
    isPersonalOrg: dbUser.orgs?.is_personal || false, // NEW
  }
}
```

#### 2.4 Update Stripe Billing Actions

**File**: `src/actions/billing.ts`

```typescript
import { isIndividualPlan, INDIVIDUAL_PLANS } from '@/types/plans'

// Update createSubscriptionCheckout to support individual plans
export async function createSubscriptionCheckout(
  priceId: string,
  planType: PlanType,
  isYearly: boolean = false
): Promise<{ url: string } | { error: string }> {
  return withOrgGuard(async (user, orgId) => {
    const supabase = await createClient()

    // Get org details
    const { data: org } = await supabase
      .from('orgs')
      .select('stripe_customer_id, is_personal, name')
      .eq('id', orgId)
      .single()

    if (!org) {
      return { error: 'Organization not found' }
    }

    // Validate plan type matches org type
    if (org.is_personal && !isIndividualPlan(planType)) {
      return { error: 'Cannot subscribe to team plan as individual user' }
    }
    if (!org.is_personal && isIndividualPlan(planType)) {
      return { error: 'Cannot subscribe to individual plan as team' }
    }

    // Create or retrieve Stripe customer
    let customerId = org.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: org.is_personal ? `${user.firstName} ${user.lastName}` : org.name,
        metadata: {
          org_id: orgId,
          user_id: user.id,
          is_personal: org.is_personal.toString(),
        },
      })

      customerId = customer.id

      // Update org with customer ID
      await supabase
        .from('orgs')
        .update({ stripe_customer_id: customerId })
        .eq('id', orgId)
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?canceled=true`,
      metadata: {
        org_id: orgId,
        plan_type: planType,
        is_personal: org.is_personal.toString(),
      },
    })

    return { url: session.url! }
  })
}

// Add function to get billing info for personal users
export async function getPersonalBillingInfo(): Promise<BillingInfo | { error: string }> {
  return withOrgGuard(async (user, orgId) => {
    const supabase = await createClient()

    const { data: org } = await supabase
      .from('orgs')
      .select('*')
      .eq('id', orgId)
      .eq('is_personal', true)
      .single()

    if (!org) {
      return { error: 'Personal workspace not found' }
    }

    // Get usage stats
    const { count: sessionsThisMonth } = await supabase
      .from('scenario_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())

    const { count: totalScenarios } = await supabase
      .from('scenarios')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId)

    return {
      plan: org.plan,
      limits: org.plan_limits,
      usage: {
        sessions_this_month: sessionsThisMonth || 0,
        scenarios: totalScenarios || 0,
        users: 1, // Always 1 for personal
      },
      subscription: org.stripe_customer_id ? await getStripeSubscription(org.stripe_customer_id) : null,
    }
  })
}
```

---

### Phase 3: Frontend UI Changes (Days 4-7)

#### 3.1 Update Dashboard Logic

**File**: `src/app/(authenticated)/dashboard/page.tsx`

```typescript
import { isPersonalOrgUser } from '@/lib/auth'

export default async function DashboardPage() {
  const user = await requireAuth()

  // Check if user is in personal org
  const isPersonal = await isPersonalOrgUser(user)

  // Personal users always get trainee view with personal branding
  if (isPersonal) {
    return <PersonalDashboard user={user} />
  }

  // Team users get role-based views
  if (user.role === 'admin') return <AdminOverview />
  if (user.role === 'manager') return <ManagerOverview />
  if (user.role === 'hr') return <HROverview />
  return <TraineeOverview />
}
```

#### 3.2 Create Personal Dashboard Component

**File**: `src/components/dashboard/personal-dashboard.tsx`

```typescript
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sparkles, TrendingUp, Users } from 'lucide-react'

interface PersonalDashboardProps {
  user: AuthUser
}

export function PersonalDashboard({ user }: PersonalDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-lg border bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-pink-500/10 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back, {user.firstName}! 👋
            </h1>
            <p className="mt-2 text-muted-foreground">
              Ready to improve your sales skills today?
            </p>
          </div>
          <Badge variant="secondary" className="text-xs">
            Personal Plan
          </Badge>
        </div>
      </div>

      {/* Upgrade CTA for free users */}
      <UpgradePrompt />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Training Sessions"
          value="12"
          change="+3 this week"
          icon={TrendingUp}
        />
        <StatCard
          title="Average Score"
          value="78%"
          change="+5% improvement"
          icon={Sparkles}
        />
        <StatCard
          title="Scenarios Completed"
          value="8"
          change="5 remaining"
          icon={Users}
        />
      </div>

      {/* Recent Attempts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Training Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Attempt cards */}
        </CardContent>
      </Card>

      {/* Upgrade to Team Banner */}
      <TeamUpgradeBanner />
    </div>
  )
}

function UpgradePrompt() {
  // Show for free plan users
  return (
    <Card className="border-2 border-violet-500/20 bg-gradient-to-r from-violet-500/5 to-purple-500/5">
      <CardContent className="flex items-center justify-between p-6">
        <div>
          <h3 className="font-semibold">Unlock Pro Features</h3>
          <p className="text-sm text-muted-foreground">
            Get unlimited sessions, AI scenario generation, and advanced analytics
          </p>
        </div>
        <Button>Upgrade to Pro</Button>
      </CardContent>
    </Card>
  )
}

function TeamUpgradeBanner() {
  return (
    <Card className="border-dashed">
      <CardContent className="flex items-center justify-between p-6">
        <div>
          <h3 className="font-semibold">Want to train your team?</h3>
          <p className="text-sm text-muted-foreground">
            Upgrade to a Team plan and invite your colleagues
          </p>
        </div>
        <Button variant="outline">Explore Team Plans</Button>
      </CardContent>
    </Card>
  )
}
```

#### 3.3 Update Sidebar Navigation

**File**: `src/components/dashboard/app-sidebar.tsx`

```typescript
import { isPersonalOrgUser } from '@/lib/auth'

export async function AppSidebar() {
  const user = await getCurrentUser()
  if (!user) return null

  const isPersonal = await isPersonalOrgUser(user)

  // Filter nav items based on personal vs team org
  const navItems = getNavItems(user.role, isPersonal)

  return (
    <Sidebar>
      <SidebarHeader>
        <WorkspaceSwitcher isPersonal={isPersonal} />
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <Link href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <UserMenu user={user} isPersonal={isPersonal} />
      </SidebarFooter>
    </Sidebar>
  )
}

function getNavItems(role: UserRole, isPersonal: boolean) {
  const baseItems = [
    { title: 'Dashboard', url: '/dashboard', icon: Home },
    { title: 'Training', url: '/training', icon: Play },
    { title: 'Scenarios', url: '/scenarios', icon: FileText },
    { title: 'Analytics', url: '/analytics', icon: BarChart },
  ]

  // Personal users don't see team features
  if (isPersonal) {
    return [
      ...baseItems,
      { title: 'Billing', url: '/billing', icon: CreditCard },
      { title: 'Settings', url: '/settings', icon: Settings },
    ]
  }

  // Team users see role-based navigation
  const teamItems = [
    { title: 'Assignments', url: '/assignments', icon: CheckSquare },
    { title: 'Leaderboard', url: '/leaderboard', icon: Trophy },
  ]

  if (role === 'manager' || role === 'admin') {
    teamItems.push({ title: 'Team', url: '/team', icon: Users })
  }

  if (role === 'admin') {
    teamItems.push(
      { title: 'Users', url: '/admin/users', icon: UserCog },
      { title: 'Billing', url: '/billing', icon: CreditCard }
    )
  }

  return [...baseItems, ...teamItems, { title: 'Settings', url: '/settings', icon: Settings }]
}
```

#### 3.4 Create Pricing Page Update

**File**: `src/app/(marketing)/pricing/page.tsx`

```typescript
export default function PricingPage() {
  const [planType, setPlanType] = useState<'individual' | 'team'>('individual')

  return (
    <div className="container py-24">
      <div className="mx-auto max-w-5xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Simple, Transparent Pricing
        </h1>
        <p className="mt-6 text-lg text-muted-foreground">
          Whether you're practicing solo or training a team
        </p>

        {/* Plan Type Toggle */}
        <div className="mt-8 flex justify-center">
          <div className="inline-flex rounded-lg border p-1">
            <button
              onClick={() => setPlanType('individual')}
              className={cn(
                'rounded-md px-8 py-2 text-sm font-medium transition-colors',
                planType === 'individual'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Individual
            </button>
            <button
              onClick={() => setPlanType('team')}
              className={cn(
                'rounded-md px-8 py-2 text-sm font-medium transition-colors',
                planType === 'team'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Team
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="mt-16 grid gap-8 lg:grid-cols-3">
        {planType === 'individual' ? (
          <>
            <IndividualPricingCard plan={INDIVIDUAL_PLANS.individual_free} />
            <IndividualPricingCard plan={INDIVIDUAL_PLANS.individual_pro} featured />
            <IndividualPricingCard plan={INDIVIDUAL_PLANS.individual_ultra} />
          </>
        ) : (
          <>
            <TeamPricingCard plan={TEAM_PLANS.starter} />
            <TeamPricingCard plan={TEAM_PLANS.professional} featured />
            <TeamPricingCard plan={TEAM_PLANS.enterprise} />
          </>
        )}
      </div>

      {/* Comparison Table */}
      <PricingComparisonTable planType={planType} />

      {/* FAQ */}
      <PricingFAQ />
    </div>
  )
}
```

#### 3.5 Update Billing Page

**File**: `src/app/(authenticated)/billing/page.tsx`

```typescript
import { isPersonalOrgUser, getOrgDetails } from '@/lib/auth'

export default async function BillingPage() {
  const user = await requireAuth()
  const isPersonal = await isPersonalOrgUser(user)
  const orgDetails = await getOrgDetails(user.orgId!)

  if (isPersonal) {
    return <PersonalBillingView org={orgDetails} />
  }

  return <TeamBillingView org={orgDetails} />
}

function PersonalBillingView({ org }) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Billing & Subscription</h1>
        <p className="text-muted-foreground">
          Manage your personal plan and usage
        </p>
      </div>

      {/* Current Plan Card */}
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">
                {INDIVIDUAL_PLANS[org.plan].name}
              </h3>
              <p className="text-sm text-muted-foreground">
                ${INDIVIDUAL_PLANS[org.plan].price.monthly}/month
              </p>
            </div>
            <Button>Upgrade Plan</Button>
          </div>
        </CardContent>
      </Card>

      {/* Usage Stats */}
      <UsageStatsCard limits={org.plan_limits} />

      {/* Convert to Team CTA */}
      <Card className="border-dashed">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Need to train a team?</h3>
              <p className="text-sm text-muted-foreground">
                Convert your personal workspace to a team organization
              </p>
            </div>
            <Button variant="outline">Convert to Team</Button>
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <BillingHistoryTable />
    </div>
  )
}
```

---

### Phase 4: Marketing & Messaging (Days 8-10)

#### 4.1 Update Home Page Messaging

**File**: `src/app/(marketing)/page.tsx`

**Key Changes**:
- Hero section: "Whether you're a solo practitioner or leading a team"
- Social proof: Show both individual and team customer logos
- CTA buttons: "Start Free" (individual) and "Start Team Trial" (team)

#### 4.2 Create Individual vs Team Comparison

**New Component**: `src/components/marketing/use-case-toggle.tsx`

```typescript
export function UseCaseToggle() {
  const [useCase, setUseCase] = useState<'individual' | 'team'>('individual')

  return (
    <section className="py-24">
      <div className="container">
        <div className="flex justify-center mb-12">
          <div className="inline-flex rounded-lg border p-1">
            <button
              onClick={() => setUseCase('individual')}
              className={cn('px-6 py-2 rounded-md', ...)}
            >
              I'm an Individual
            </button>
            <button
              onClick={() => setUseCase('team')}
              className={cn('px-6 py-2 rounded-md', ...)}
            >
              I'm on a Team
            </button>
          </div>
        </div>

        {useCase === 'individual' ? (
          <IndividualUseCase />
        ) : (
          <TeamUseCase />
        )}
      </div>
    </section>
  )
}
```

#### 4.3 Update Feature Pages

**Updates Required**:
- `/features/ai-scoring` - Add "Available on all plans"
- `/features/voice-simulation` - Add usage limits by plan
- `/features/analytics` - Note team features vs individual features

#### 4.4 SEO and Meta Tags

**New Pages**:
- `/for/individuals` - Landing page for solo practitioners
- `/for/freelancers` - Specific messaging for freelancers
- `/for/consultants` - Messaging for consultants

---

### Phase 5: Conversion Flow (Days 11-12)

#### 5.1 Create Onboarding Flow

**File**: `src/app/(auth)/onboarding/page.tsx`

```typescript
'use client'

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [selection, setSelection] = useState<'individual' | 'team' | null>(null)

  return (
    <div className="container max-w-2xl py-24">
      {step === 1 && (
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Welcome to Voice AI Training!</h1>
            <p className="mt-2 text-muted-foreground">
              Let's get you set up. How will you be using the platform?
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <button
              onClick={() => {
                setSelection('individual')
                setStep(2)
              }}
              className="group relative rounded-lg border-2 border-transparent p-8 text-left transition-all hover:border-primary hover:shadow-lg"
            >
              <div className="mb-4 inline-flex rounded-lg bg-violet-500/10 p-3">
                <User className="h-6 w-6 text-violet-500" />
              </div>
              <h3 className="text-xl font-semibold">Just Me</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                I'm practicing on my own to improve my skills
              </p>
              <div className="mt-4">
                <Badge variant="secondary">Personal Plan</Badge>
              </div>
            </button>

            <button
              onClick={() => {
                setSelection('team')
                setStep(2)
              }}
              className="group relative rounded-lg border-2 border-transparent p-8 text-left transition-all hover:border-primary hover:shadow-lg"
            >
              <div className="mb-4 inline-flex rounded-lg bg-blue-500/10 p-3">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold">My Team</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                I'm training a team or managing sales reps
              </p>
              <div className="mt-4">
                <Badge variant="secondary">Team Plan</Badge>
              </div>
            </button>
          </div>
        </div>
      )}

      {step === 2 && selection === 'individual' && (
        <IndividualOnboarding />
      )}

      {step === 2 && selection === 'team' && (
        <TeamOnboarding />
      )}
    </div>
  )
}
```

#### 5.2 Convert Personal to Team Flow

**File**: `src/app/(authenticated)/settings/upgrade-to-team/page.tsx`

```typescript
export default function UpgradeToTeamPage() {
  return (
    <div className="container max-w-4xl py-12">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Upgrade to Team Plan</h1>
          <p className="text-muted-foreground">
            Convert your personal workspace to train your entire team
          </p>
        </div>

        {/* Benefits */}
        <Card>
          <CardHeader>
            <CardTitle>What you'll get</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle className="mt-0.5 h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">Invite unlimited team members</p>
                  <p className="text-sm text-muted-foreground">
                    Add your sales team and track their progress
                  </p>
                </div>
              </li>
              {/* More benefits */}
            </ul>
          </CardContent>
        </Card>

        {/* Migration Notice */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Your data stays safe</AlertTitle>
          <AlertDescription>
            All your scenarios and training history will be preserved when you upgrade
          </AlertDescription>
        </Alert>

        {/* Conversion Form */}
        <ConvertToTeamForm />
      </div>
    </div>
  )
}
```

---

### Phase 6: Testing & Quality Assurance (Days 13-14)

#### 6.1 Database Testing

**Test Cases**:
- [ ] Personal org creation on user signup
- [ ] User record creation with personal org_id
- [ ] Scenario creation as personal user
- [ ] Attempt creation and scoring
- [ ] Usage limit enforcement
- [ ] Personal to team conversion
- [ ] RLS policies still enforce isolation
- [ ] Storage paths work correctly

#### 6.2 Authentication Testing

**Test Cases**:
- [ ] Individual user signup flow
- [ ] JWT claims include correct org_id
- [ ] Personal org flag set correctly
- [ ] No access to team features
- [ ] Billing page shows individual plans
- [ ] Dashboard shows personal view

#### 6.3 UI/UX Testing

**Test Cases**:
- [ ] Sidebar navigation hides team items
- [ ] Dashboard displays personal branding
- [ ] Upgrade CTAs appear correctly
- [ ] Pricing page toggle works
- [ ] Onboarding flow completes
- [ ] Mobile responsive

#### 6.4 Billing Testing

**Test Cases**:
- [ ] Individual plan checkout works
- [ ] Stripe webhook updates user plan
- [ ] Usage tracking accurate
- [ ] Upgrade flow completes
- [ ] Conversion to team creates Stripe subscription

---

## Implementation Timeline

### Week 1: Backend Foundation
- **Days 1-2**: Database migration and functions
- **Days 3-4**: Clerk webhook and auth updates
- **Day 5**: Billing integration updates

### Week 2: Frontend & UX
- **Days 6-7**: Dashboard and sidebar updates
- **Days 8-9**: Pricing and billing pages
- **Days 10-11**: Onboarding and conversion flows

### Week 3: Testing & Launch
- **Days 12-13**: Comprehensive testing
- **Day 14**: Bug fixes and polish
- **Day 15**: Soft launch to beta users

---

## Migration Strategy

### Existing Users (All Team Orgs)
**No action required** - All existing functionality remains unchanged.

### New Individual Users
**Automatic flow**:
1. Sign up via Clerk
2. Personal org auto-created
3. User sees personal dashboard
4. Can upgrade to team at any time

### Converting Personal to Team
**User-initiated flow**:
1. User clicks "Upgrade to Team" CTA
2. Chooses team plan (Starter/Pro/Enterprise)
3. Enters team name and invites members
4. Stripe checkout for team plan
5. Database function converts org:
   - `is_personal: false`
   - `personal_user_clerk_id: NULL`
   - User role: trainee → admin
   - Enable team features

---

## Risks & Mitigations

### Risk 1: Personal Orgs Clutter Database
**Impact**: Low
**Mitigation**: Index on `is_personal` for efficient filtering, archive inactive personal orgs after 90 days

### Risk 2: Users Confused by Personal Org Concept
**Impact**: Medium
**Mitigation**: Clear UI labeling ("Personal Workspace"), hide org name from UI, call it "My Training" instead

### Risk 3: Billing Complexity
**Impact**: Medium
**Mitigation**: Separate Stripe price IDs for individual vs team plans, clear plan comparison table

### Risk 4: Support Burden
**Impact**: Low
**Mitigation**: Comprehensive onboarding, help docs for individual users, in-app tooltips

---

## Success Metrics

### User Acquisition
- **Target**: 500 individual users in first month
- **Metric**: Individual signups / Total signups

### Conversion Rate
- **Target**: 10% of free users upgrade to Individual Pro
- **Metric**: Paid individual users / Free individual users

### Team Conversion
- **Target**: 5% of individual users convert to team
- **Metric**: Personal → Team conversions / Total individual users

### Retention
- **Target**: 60% of individual users active after 30 days
- **Metric**: DAU / MAU for individual users

---

## Documentation Updates Required

### Technical Docs
- [ ] Update CLAUDE.md with personal org pattern
- [ ] Update SECURITY.md with individual user considerations
- [ ] Update DB_SCHEMA.md with new columns
- [ ] Create PERSONAL_ORG_PATTERN.md guide

### User Docs
- [ ] Individual user getting started guide
- [ ] FAQ: Individual vs Team plans
- [ ] How to upgrade to team
- [ ] Billing and usage limits

### Marketing Copy
- [ ] Home page hero section
- [ ] Pricing page
- [ ] Feature pages
- [ ] Email templates

---

## Post-Launch Optimization

### Week 1-2: Monitor & Iterate
- Track signup funnel drop-off
- Monitor support tickets for confusion
- A/B test onboarding flow
- Gather user feedback

### Month 1: Feature Additions
- Shared scenario library for individuals
- Community features (optional)
- Referral program
- Annual billing discount

### Month 2-3: Scale
- Optimize database queries
- Add individual user analytics
- Build conversion funnels
- Launch marketing campaigns

---

## Alternative Considered: Nullable org_id

**Why not recommended**:
- 7 tables require schema changes
- 30+ RLS policies need rewrites
- 13+ indexes need recreation
- All server actions need dual logic
- 2-3 weeks implementation vs 3-5 days
- High risk of breaking changes
- No clear benefit over personal org pattern

**When to reconsider**:
- If personal org count exceeds 100,000
- If query performance degrades significantly
- If storage costs become prohibitive
- If user confusion is persistent

---

## Conclusion

The **Personal Organization Pattern** provides the fastest, lowest-risk path to supporting individual users while maintaining all existing functionality for team users. By auto-creating personal orgs, we leverage the existing architecture with minimal changes and provide a clear upgrade path to team plans.

**Total Implementation Time**: 2-3 weeks
**Risk Level**: Low
**Expected ROI**: High (new user segment)
**Recommended Approach**: ✅ Proceed with Personal Org Pattern

---

## Appendix: Key Files to Modify

### Database (1 migration)
- `/db/migrations/0009_add_personal_org_support.sql`

### Backend (6 files)
- `/src/app/api/webhooks/clerk/route.ts`
- `/src/lib/auth.ts`
- `/src/actions/billing.ts`
- `/src/types/plans.ts`
- `/src/lib/supabase/server.ts`
- `/src/lib/stripe.ts`

### Frontend (8 files)
- `/src/app/(authenticated)/dashboard/page.tsx`
- `/src/components/dashboard/personal-dashboard.tsx`
- `/src/components/dashboard/app-sidebar.tsx`
- `/src/app/(authenticated)/billing/page.tsx`
- `/src/app/(marketing)/pricing/page.tsx`
- `/src/app/(auth)/onboarding/page.tsx`
- `/src/app/(authenticated)/settings/upgrade-to-team/page.tsx`
- `/src/components/marketing/use-case-toggle.tsx`

### Documentation (4 files)
- `/documentation/CLAUDE.md`
- `/documentation/SECURITY.md`
- `/documentation/PERSONAL_ORG_PATTERN.md` (new)
- `/documentation/USER_GUIDE.md` (new)

**Total files**: ~20 files to create/modify

---

*End of Implementation Plan*