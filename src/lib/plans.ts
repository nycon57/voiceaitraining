/**
 * Plan Configuration and Types
 *
 * Defines all available subscription plans, their limits, and pricing.
 * Supports both individual users and team organizations.
 */

// ============================================================================
// Plan Type Definitions
// ============================================================================

export type IndividualPlanType = 'individual_free' | 'individual_pro' | 'individual_ultra'
export type TeamPlanType = 'starter' | 'professional' | 'enterprise' | 'trial'
export type PlanType = IndividualPlanType | TeamPlanType

export type BillingInterval = 'monthly' | 'annual'

// ============================================================================
// Plan Limits Interface
// ============================================================================

export interface PlanLimits {
  max_users: number // -1 = unlimited
  max_sessions_per_month: number // -1 = unlimited
  max_scenarios: number // -1 = unlimited
  ai_generation: boolean
  custom_branding: boolean
  priority_support: boolean
  analytics_retention_days: number
  webhooks?: boolean
  sso?: boolean
  dedicated_support?: boolean
}

// ============================================================================
// Plan Pricing Interface
// ============================================================================

export interface PlanPricing {
  monthly: number
  annual: number // Annual price (typically monthly * 10 for 2 months free)
}

// ============================================================================
// Individual Plan Interface
// ============================================================================

export interface IndividualPlan {
  type: IndividualPlanType
  name: string
  description: string
  price: PlanPricing
  limits: PlanLimits
  features: string[]
  popular?: boolean
  cta: string
}

// ============================================================================
// Team Plan Interface
// ============================================================================

export interface TeamPlan {
  type: TeamPlanType
  name: string
  description: string
  price: PlanPricing | 'custom'
  limits: PlanLimits
  features: string[]
  popular?: boolean
  cta: string
}

// ============================================================================
// Individual Plan Configurations
// ============================================================================

export const INDIVIDUAL_PLANS: Record<IndividualPlanType, IndividualPlan> = {
  individual_free: {
    type: 'individual_free',
    name: 'Free',
    description: 'Perfect for trying out Voice AI Training',
    price: {
      monthly: 0,
      annual: 0,
    },
    limits: {
      max_users: 1,
      max_sessions_per_month: 10,
      max_scenarios: 3,
      ai_generation: false,
      custom_branding: false,
      priority_support: false,
      analytics_retention_days: 30,
    },
    features: [
      '10 training sessions per month',
      '3 pre-built scenarios',
      'Basic performance analytics',
      '30-day analytics retention',
      'Community support',
      'Voice simulation AI',
      'Automated scoring',
    ],
    cta: 'Get Started Free',
  },
  individual_pro: {
    type: 'individual_pro',
    name: 'Pro',
    description: 'For professionals serious about their skills',
    price: {
      monthly: 29,
      annual: 290, // Save $58/year (2 months free)
    },
    limits: {
      max_users: 1,
      max_sessions_per_month: 100,
      max_scenarios: 50,
      ai_generation: true,
      custom_branding: false,
      priority_support: false,
      analytics_retention_days: 90,
      webhooks: false,
    },
    features: [
      '100 training sessions per month',
      '50 custom scenarios',
      'AI scenario generation',
      'Advanced analytics',
      '90-day analytics retention',
      'Email support',
      'Performance insights',
      'Export reports (CSV)',
    ],
    popular: true,
    cta: 'Start Pro Trial',
  },
  individual_ultra: {
    type: 'individual_ultra',
    name: 'Ultra',
    description: 'Maximum power for power users',
    price: {
      monthly: 99,
      annual: 990, // Save $198/year (2 months free)
    },
    limits: {
      max_users: 1,
      max_sessions_per_month: 500,
      max_scenarios: 200,
      ai_generation: true,
      custom_branding: true,
      priority_support: true,
      analytics_retention_days: 365,
      webhooks: true,
    },
    features: [
      '500 training sessions per month',
      '200 custom scenarios',
      'AI scenario generation',
      'Advanced analytics + AI insights',
      '1-year analytics retention',
      'Priority support',
      'Custom branding',
      'Webhook integrations',
      'Export reports (CSV, PDF)',
      'Early access to new features',
    ],
    cta: 'Start Ultra Trial',
  },
}

// ============================================================================
// Team Plan Configurations
// ============================================================================

export const TEAM_PLANS: Record<TeamPlanType, TeamPlan> = {
  trial: {
    type: 'trial',
    name: 'Trial',
    description: '14-day free trial for teams',
    price: {
      monthly: 0,
      annual: 0,
    },
    limits: {
      max_users: 5,
      max_sessions_per_month: 50,
      max_scenarios: 10,
      ai_generation: true,
      custom_branding: false,
      priority_support: false,
      analytics_retention_days: 30,
    },
    features: [
      'Up to 5 team members',
      '50 training sessions',
      '10 scenarios',
      'Basic team analytics',
      '14-day trial period',
    ],
    cta: 'Start Free Trial',
  },
  starter: {
    type: 'starter',
    name: 'Starter',
    description: 'For small teams getting started',
    price: {
      monthly: 49,
      annual: 490,
    },
    limits: {
      max_users: 10,
      max_sessions_per_month: 500,
      max_scenarios: 25,
      ai_generation: true,
      custom_branding: false,
      priority_support: false,
      analytics_retention_days: 90,
      webhooks: false,
      sso: false,
    },
    features: [
      'Up to 10 team members',
      '500 training sessions per month',
      '25 custom scenarios',
      'AI scenario generation',
      'Team analytics & leaderboards',
      'Assignment management',
      'Role-based access (trainee, manager)',
      'Email support',
      '90-day analytics retention',
    ],
    cta: 'Start Starter Plan',
  },
  professional: {
    type: 'professional',
    name: 'Professional',
    description: 'For growing teams with advanced needs',
    price: {
      monthly: 199,
      annual: 1990,
    },
    limits: {
      max_users: 50,
      max_sessions_per_month: 2500,
      max_scenarios: 100,
      ai_generation: true,
      custom_branding: true,
      priority_support: true,
      analytics_retention_days: 180,
      webhooks: true,
      sso: false,
    },
    features: [
      'Up to 50 team members',
      '2,500 training sessions per month',
      '100 custom scenarios',
      'AI scenario generation + branching',
      'Advanced team analytics',
      'Custom branding',
      'Webhook integrations',
      'Priority support',
      'Learning tracks',
      'HR compliance reporting',
      'Role-based access (all roles)',
      '180-day analytics retention',
    ],
    popular: true,
    cta: 'Start Professional Plan',
  },
  enterprise: {
    type: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations with custom needs',
    price: 'custom',
    limits: {
      max_users: -1, // unlimited
      max_sessions_per_month: -1, // unlimited
      max_scenarios: -1, // unlimited
      ai_generation: true,
      custom_branding: true,
      priority_support: true,
      analytics_retention_days: 365,
      webhooks: true,
      sso: true,
      dedicated_support: true,
    },
    features: [
      'Unlimited team members',
      'Unlimited training sessions',
      'Unlimited custom scenarios',
      'AI scenario generation + advanced branching',
      'Enterprise analytics & reporting',
      'Custom branding',
      'SSO & SAML',
      'Webhook integrations',
      'Dedicated account manager',
      '24/7 priority support',
      'SLA guarantees',
      'Custom integrations',
      'On-premise deployment options',
      '1-year+ analytics retention',
    ],
    cta: 'Contact Sales',
  },
}

// ============================================================================
// Plan Helper Functions
// ============================================================================

/**
 * Check if a plan is an individual plan
 */
export function isIndividualPlan(plan: PlanType): plan is IndividualPlanType {
  return plan.startsWith('individual_')
}

/**
 * Check if a plan is a team plan
 */
export function isTeamPlan(plan: PlanType): plan is TeamPlanType {
  return !plan.startsWith('individual_')
}

/**
 * Get plan configuration by plan type
 */
export function getPlanConfig(plan: PlanType): IndividualPlan | TeamPlan {
  if (isIndividualPlan(plan)) {
    return INDIVIDUAL_PLANS[plan]
  }
  return TEAM_PLANS[plan]
}

/**
 * Get plan limits by plan type
 */
export function getPlanLimits(plan: PlanType): PlanLimits {
  const config = getPlanConfig(plan)
  return config.limits
}

/**
 * Check if a plan has a specific feature
 */
export function planHasFeature(plan: PlanType, feature: keyof PlanLimits): boolean {
  const limits = getPlanLimits(plan)
  return !!limits[feature]
}

/**
 * Check if a plan allows unlimited usage for a specific limit
 */
export function planIsUnlimited(plan: PlanType, limit: keyof Pick<PlanLimits, 'max_users' | 'max_sessions_per_month' | 'max_scenarios'>): boolean {
  const limits = getPlanLimits(plan)
  return limits[limit] === -1
}

/**
 * Check if usage is within plan limits
 */
export function isWithinPlanLimit(
  plan: PlanType,
  limit: keyof Pick<PlanLimits, 'max_users' | 'max_sessions_per_month' | 'max_scenarios'>,
  currentUsage: number
): boolean {
  const limits = getPlanLimits(plan)
  const maxLimit = limits[limit]

  // -1 means unlimited
  if (maxLimit === -1) return true

  return currentUsage < maxLimit
}

/**
 * Calculate usage percentage for a plan limit
 */
export function calculateUsagePercentage(
  plan: PlanType,
  limit: keyof Pick<PlanLimits, 'max_users' | 'max_sessions_per_month' | 'max_scenarios'>,
  currentUsage: number
): number {
  const limits = getPlanLimits(plan)
  const maxLimit = limits[limit]

  // -1 means unlimited, return 0%
  if (maxLimit === -1) return 0

  // Calculate percentage
  const percentage = (currentUsage / maxLimit) * 100
  return Math.min(Math.round(percentage), 100)
}

/**
 * Get plan display price
 */
export function getPlanDisplayPrice(plan: TeamPlan | IndividualPlan, interval: BillingInterval = 'monthly'): string {
  if (plan.price === 'custom') {
    return 'Custom'
  }

  const price = plan.price[interval]

  if (price === 0) {
    return 'Free'
  }

  // For annual, show monthly equivalent
  if (interval === 'annual') {
    const monthlyEquivalent = Math.round(price / 12)
    return `$${monthlyEquivalent}/mo`
  }

  return `$${price}/mo`
}

/**
 * Get annual savings amount
 */
export function getAnnualSavings(plan: TeamPlan | IndividualPlan): number {
  if (plan.price === 'custom' || plan.price.monthly === 0) {
    return 0
  }

  const monthlyTotal = plan.price.monthly * 12
  const annualPrice = plan.price.annual

  return monthlyTotal - annualPrice
}

/**
 * Get all individual plans as array
 */
export function getIndividualPlans(): IndividualPlan[] {
  return Object.values(INDIVIDUAL_PLANS)
}

/**
 * Get all team plans as array (excluding trial)
 */
export function getTeamPlans(): TeamPlan[] {
  const { trial, ...publicPlans } = TEAM_PLANS
  return Object.values(publicPlans)
}

/**
 * Get all plans as array
 */
export function getAllPlans(): (IndividualPlan | TeamPlan)[] {
  return [...getIndividualPlans(), ...getTeamPlans()]
}

// ============================================================================
// Plan Upgrade Paths
// ============================================================================

/**
 * Get available upgrade options for a plan
 */
export function getUpgradeOptions(currentPlan: PlanType): PlanType[] {
  if (isIndividualPlan(currentPlan)) {
    // Individual upgrade path
    switch (currentPlan) {
      case 'individual_free':
        return ['individual_pro', 'individual_ultra']
      case 'individual_pro':
        return ['individual_ultra']
      case 'individual_ultra':
        return [] // Already at top tier for individuals
    }
  } else {
    // Team upgrade path
    switch (currentPlan) {
      case 'trial':
        return ['starter', 'professional', 'enterprise']
      case 'starter':
        return ['professional', 'enterprise']
      case 'professional':
        return ['enterprise']
      case 'enterprise':
        return [] // Already at top tier
    }
  }
}

/**
 * Check if an upgrade is available
 */
export function canUpgrade(currentPlan: PlanType): boolean {
  return getUpgradeOptions(currentPlan).length > 0
}

/**
 * Get the recommended upgrade plan
 */
export function getRecommendedUpgrade(currentPlan: PlanType): PlanType | null {
  const options = getUpgradeOptions(currentPlan)

  if (options.length === 0) return null

  // Return the first upgrade option (next tier up)
  return options[0]
}