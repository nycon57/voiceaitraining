import { type LucideIcon } from 'lucide-react';

/**
 * Plan tier types
 */
export type PlanType = 'basic' | 'business' | 'enterprise';

/**
 * Feature value - can be boolean (included/not included) or string (description)
 */
export interface FeatureItem {
  name: string;
  value: string | boolean;
}

/**
 * Grouped features by category
 */
export interface PlanFeatures {
  training: FeatureItem[];
  analytics: FeatureItem[];
}

/**
 * Complete plan definition
 */
export interface Plan {
  /**
   * Display name of the plan (e.g., "Starter", "Professional", "Enterprise")
   */
  name: string;

  /**
   * Plan tier type for programmatic access
   */
  type: PlanType;

  /**
   * Icon component to display with the plan
   */
  icon: LucideIcon;

  /**
   * Pricing information
   */
  price: {
    /**
     * Monthly price in dollars
     */
    monthly: number;
    /**
     * Yearly price in dollars (typically discounted)
     */
    yearly: number;
  };

  /**
   * Call-to-action button configuration
   */
  button: {
    /**
     * Button text
     */
    text: string;
    /**
     * Button variant (default or outline)
     */
    variant: 'default' | 'outline';
    /**
     * Link destination
     */
    href: string;
  };

  /**
   * Feature lists grouped by category
   */
  features: PlanFeatures;
}

/**
 * Feature category configuration
 */
export interface CategoryConfig {
  name: string;
  icon: LucideIcon;
}

/**
 * All feature categories
 */
export type CategoryConfigMap = Record<keyof PlanFeatures, CategoryConfig>;