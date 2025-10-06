/**
 * A/B Testing Implementation for MicroSaaS
 *
 * Production-ready A/B testing framework with:
 * - Deterministic variant assignment (consistent user experience)
 * - Statistical significance calculations
 * - Event tracking and analysis
 * - Type-safe configuration
 *
 * @example
 * ```typescript
 * const experiment = new ABTest({
 *   id: 'pricing-test-2024',
 *   name: 'Pricing Page Test',
 *   variants: [
 *     { id: 'control', name: 'Current', weight: 50 },
 *     { id: 'treatment', name: 'New Design', weight: 50 }
 *   ],
 *   startDate: new Date('2024-01-15'),
 *   endDate: new Date('2024-01-29'),
 *   targetSampleSize: 1000
 * });
 *
 * const variant = experiment.assignVariant(userId);
 * experiment.trackEvent(userId, 'conversion');
 * const results = experiment.analyzeResults();
 * ```
 */

import * as crypto from 'crypto';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface Variant {
  id: string;
  name: string;
  weight: number; // 0-100, must sum to 100 across all variants
  metadata?: Record<string, any>;
}

export interface ExperimentConfig {
  id: string;
  name: string;
  description?: string;
  variants: Variant[];
  startDate: Date;
  endDate: Date;
  targetSampleSize: number; // Per variant
  metadata?: Record<string, any>;
}

export interface ExperimentEvent {
  userId: string;
  variant: string;
  eventType: 'view' | 'conversion' | 'custom';
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface VariantResults {
  variant: string;
  users: number;
  events: number;
  conversions: number;
  conversionRate: number;
}

export interface StatisticalResults {
  pValue: number;
  isSignificant: boolean;
  confidenceLevel: number;
  zScore: number;
}

export interface ExperimentAnalysis {
  experimentId: string;
  startDate: Date;
  endDate: Date;
  isComplete: boolean;
  sampleSize: number;
  variants: VariantResults[];
  control: VariantResults;
  treatment: VariantResults;
  statistics: StatisticalResults;
  absoluteLift: number;
  relativeLift: number;
  recommendation: 'SHIP_IT' | 'KILL_IT' | 'KEEP_RUNNING' | 'INCONCLUSIVE';
  warnings: string[];
}

// ============================================================================
// ABTest Class
// ============================================================================

export class ABTest {
  private config: ExperimentConfig;
  private events: Map<string, ExperimentEvent[]>;
  private assignments: Map<string, string>;

  constructor(config: ExperimentConfig) {
    this.validateConfig(config);
    this.config = config;
    this.events = new Map();
    this.assignments = new Map();
  }

  // ============================================================================
  // Variant Assignment
  // ============================================================================

  /**
   * Assigns a user to a variant using deterministic hashing.
   * Same user always gets same variant for consistency.
   *
   * @param userId - Unique user identifier
   * @returns Variant ID the user is assigned to
   */
  public assignVariant(userId: string): string {
    // Return cached assignment if exists
    if (this.assignments.has(userId)) {
      return this.assignments.get(userId)!;
    }

    // Check if experiment is active
    const now = new Date();
    if (now < this.config.startDate || now > this.config.endDate) {
      throw new Error(
        `Experiment ${this.config.id} is not active. ` +
        `Active period: ${this.config.startDate} to ${this.config.endDate}`
      );
    }

    // Deterministic hash: same user + experiment = same variant
    const hash = this.hashUserToExperiment(userId, this.config.id);
    const variant = this.selectVariantByWeight(hash);

    // Cache assignment
    this.assignments.set(userId, variant);

    // Track assignment event
    this.trackEvent(userId, 'view', { assignedAt: now });

    return variant;
  }

  /**
   * Hashes user ID + experiment ID to get deterministic number [0, 1)
   */
  private hashUserToExperiment(userId: string, experimentId: string): number {
    const input = `${userId}:${experimentId}`;
    const hash = crypto.createHash('sha256').update(input).digest();

    // Convert first 4 bytes to number between 0 and 1
    const hashInt = hash.readUInt32BE(0);
    return hashInt / 0xffffffff;
  }

  /**
   * Selects variant based on configured weights
   */
  private selectVariantByWeight(hash: number): string {
    let cumulative = 0;

    for (const variant of this.config.variants) {
      cumulative += variant.weight / 100;
      if (hash < cumulative) {
        return variant.id;
      }
    }

    // Fallback to last variant (handles floating point errors)
    return this.config.variants[this.config.variants.length - 1].id;
  }

  // ============================================================================
  // Event Tracking
  // ============================================================================

  /**
   * Tracks an event for a user in the experiment
   *
   * @param userId - User who triggered the event
   * @param eventType - Type of event ('conversion', 'view', 'custom')
   * @param metadata - Additional event data
   */
  public trackEvent(
    userId: string,
    eventType: 'view' | 'conversion' | 'custom',
    metadata?: Record<string, any>
  ): void {
    const variant = this.assignments.get(userId);
    if (!variant) {
      throw new Error(
        `User ${userId} not assigned to experiment ${this.config.id}. ` +
        `Call assignVariant() first.`
      );
    }

    const event: ExperimentEvent = {
      userId,
      variant,
      eventType,
      timestamp: new Date(),
      metadata
    };

    if (!this.events.has(userId)) {
      this.events.set(userId, []);
    }

    this.events.get(userId)!.push(event);
  }

  /**
   * Gets all events for a specific user
   */
  public getUserEvents(userId: string): ExperimentEvent[] {
    return this.events.get(userId) || [];
  }

  /**
   * Gets all events of a specific type
   */
  public getEventsByType(eventType: string): ExperimentEvent[] {
    const allEvents: ExperimentEvent[] = [];

    for (const userEvents of this.events.values()) {
      allEvents.push(...userEvents.filter(e => e.eventType === eventType));
    }

    return allEvents;
  }

  // ============================================================================
  // Statistical Analysis
  // ============================================================================

  /**
   * Analyzes experiment results and provides recommendation
   */
  public analyzeResults(): ExperimentAnalysis {
    const warnings: string[] = [];
    const now = new Date();

    // Check if experiment is complete
    const isComplete = now > this.config.endDate;
    if (!isComplete) {
      warnings.push(
        `Experiment is still running. Results may change. ` +
        `Ends: ${this.config.endDate}`
      );
    }

    // Calculate results per variant
    const variantResults = this.calculateVariantResults();

    // Check sample size
    const totalUsers = variantResults.reduce((sum, v) => sum + v.users, 0);
    const targetTotal = this.config.targetSampleSize * this.config.variants.length;

    if (totalUsers < targetTotal) {
      warnings.push(
        `Sample size (${totalUsers}) below target (${targetTotal}). ` +
        `Need ${targetTotal - totalUsers} more users.`
      );
    }

    // Get control and treatment (assumes 2-variant test)
    const control = variantResults.find(v => v.variant === 'control');
    const treatment = variantResults.find(v => v.variant !== 'control');

    if (!control || !treatment) {
      throw new Error(
        'Analysis requires exactly 2 variants: "control" and one treatment variant'
      );
    }

    // Calculate statistical significance
    const statistics = this.calculateSignificance(control, treatment);

    // Calculate lift
    const absoluteLift = treatment.conversionRate - control.conversionRate;
    const relativeLift = control.conversionRate > 0
      ? absoluteLift / control.conversionRate
      : 0;

    // Generate recommendation
    const recommendation = this.generateRecommendation(
      statistics,
      absoluteLift,
      relativeLift,
      totalUsers,
      targetTotal,
      warnings
    );

    return {
      experimentId: this.config.id,
      startDate: this.config.startDate,
      endDate: this.config.endDate,
      isComplete,
      sampleSize: totalUsers,
      variants: variantResults,
      control,
      treatment,
      statistics,
      absoluteLift,
      relativeLift,
      recommendation,
      warnings
    };
  }

  /**
   * Calculates results for each variant
   */
  private calculateVariantResults(): VariantResults[] {
    const results: Map<string, VariantResults> = new Map();

    // Initialize results for each variant
    for (const variant of this.config.variants) {
      results.set(variant.id, {
        variant: variant.id,
        users: 0,
        events: 0,
        conversions: 0,
        conversionRate: 0
      });
    }

    // Count users and events per variant
    for (const [userId, userEvents] of this.events.entries()) {
      if (userEvents.length === 0) continue;

      const variant = userEvents[0].variant;
      const result = results.get(variant);

      if (result) {
        result.users++;
        result.events += userEvents.length;
        result.conversions += userEvents.filter(
          e => e.eventType === 'conversion'
        ).length;
      }
    }

    // Calculate conversion rates
    for (const result of results.values()) {
      result.conversionRate = result.users > 0
        ? result.conversions / result.users
        : 0;
    }

    return Array.from(results.values());
  }

  /**
   * Calculates statistical significance using z-test for proportions
   */
  private calculateSignificance(
    control: VariantResults,
    treatment: VariantResults
  ): StatisticalResults {
    const p1 = control.conversionRate;
    const n1 = control.users;
    const p2 = treatment.conversionRate;
    const n2 = treatment.users;

    // Check for sufficient sample size
    if (n1 < 30 || n2 < 30) {
      return {
        pValue: 1,
        isSignificant: false,
        confidenceLevel: 0,
        zScore: 0
      };
    }

    // Pooled proportion
    const pooledP = (control.conversions + treatment.conversions) / (n1 + n2);

    // Standard error
    const se = Math.sqrt(pooledP * (1 - pooledP) * (1 / n1 + 1 / n2));

    // Z-score
    const zScore = se > 0 ? (p2 - p1) / se : 0;

    // Two-tailed p-value (using normal approximation)
    const pValue = this.calculatePValue(Math.abs(zScore));

    // Confidence level (1 - p-value)
    const confidenceLevel = 1 - pValue;

    // Significance threshold: p < 0.05
    const isSignificant = pValue < 0.05;

    return {
      pValue,
      isSignificant,
      confidenceLevel,
      zScore
    };
  }

  /**
   * Calculates two-tailed p-value from z-score using normal distribution
   */
  private calculatePValue(zScore: number): number {
    // Approximation of cumulative distribution function for standard normal
    // Using error function approximation
    const t = 1 / (1 + 0.2316419 * zScore);
    const d = 0.3989423 * Math.exp(-zScore * zScore / 2);
    const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));

    // Two-tailed test
    return 2 * p;
  }

  /**
   * Generates recommendation based on results
   */
  private generateRecommendation(
    statistics: StatisticalResults,
    absoluteLift: number,
    relativeLift: number,
    sampleSize: number,
    targetSampleSize: number,
    warnings: string[]
  ): 'SHIP_IT' | 'KILL_IT' | 'KEEP_RUNNING' | 'INCONCLUSIVE' {
    // Not enough data yet
    if (sampleSize < targetSampleSize * 0.8) {
      return 'KEEP_RUNNING';
    }

    // Statistically significant positive result
    if (statistics.isSignificant && absoluteLift > 0) {
      // Check practical significance (>10% relative lift)
      if (relativeLift > 0.10) {
        return 'SHIP_IT';
      } else {
        warnings.push(
          `Result is statistically significant but effect size is small ` +
          `(${(relativeLift * 100).toFixed(1)}%). Consider if worth implementing.`
        );
        return 'INCONCLUSIVE';
      }
    }

    // Statistically significant negative result
    if (statistics.isSignificant && absoluteLift < 0) {
      return 'KILL_IT';
    }

    // Not significant after full sample size
    if (sampleSize >= targetSampleSize && !statistics.isSignificant) {
      if (Math.abs(relativeLift) < 0.02) {
        warnings.push('No meaningful difference detected between variants.');
        return 'KILL_IT';
      } else {
        warnings.push(
          `Trend detected (${(relativeLift * 100).toFixed(1)}%) but not statistically significant. ` +
          `Consider extending test or declaring no effect.`
        );
        return 'INCONCLUSIVE';
      }
    }

    // Close to significant, need more data
    if (statistics.pValue < 0.10 && sampleSize < targetSampleSize * 1.5) {
      warnings.push(
        `p-value = ${statistics.pValue.toFixed(3)} (close to 0.05). ` +
        `Consider extending test for more data.`
      );
      return 'KEEP_RUNNING';
    }

    return 'INCONCLUSIVE';
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  /**
   * Validates experiment configuration
   */
  private validateConfig(config: ExperimentConfig): void {
    if (!config.id || !config.name) {
      throw new Error('Experiment must have id and name');
    }

    if (!config.variants || config.variants.length < 2) {
      throw new Error('Experiment must have at least 2 variants');
    }

    // Validate weights sum to 100
    const totalWeight = config.variants.reduce((sum, v) => sum + v.weight, 0);
    if (Math.abs(totalWeight - 100) > 0.01) {
      throw new Error(
        `Variant weights must sum to 100, got ${totalWeight}`
      );
    }

    // Validate dates
    if (config.startDate >= config.endDate) {
      throw new Error('Start date must be before end date');
    }

    // Validate sample size
    if (config.targetSampleSize < 100) {
      throw new Error('Target sample size must be at least 100 per variant');
    }
  }

  /**
   * Gets experiment configuration
   */
  public getConfig(): ExperimentConfig {
    return { ...this.config };
  }

  /**
   * Checks if experiment is currently active
   */
  public isActive(): boolean {
    const now = new Date();
    return now >= this.config.startDate && now <= this.config.endDate;
  }

  /**
   * Gets total number of users in experiment
   */
  public getTotalUsers(): number {
    return this.assignments.size;
  }

  /**
   * Gets users assigned to specific variant
   */
  public getUsersByVariant(variantId: string): string[] {
    const users: string[] = [];

    for (const [userId, variant] of this.assignments.entries()) {
      if (variant === variantId) {
        users.push(userId);
      }
    }

    return users;
  }

  /**
   * Exports experiment data for external analysis
   */
  public exportData(): {
    config: ExperimentConfig;
    assignments: { userId: string; variant: string }[];
    events: ExperimentEvent[];
  } {
    const assignments = Array.from(this.assignments.entries()).map(
      ([userId, variant]) => ({ userId, variant })
    );

    const events: ExperimentEvent[] = [];
    for (const userEvents of this.events.values()) {
      events.push(...userEvents);
    }

    return {
      config: this.getConfig(),
      assignments,
      events
    };
  }

  /**
   * Imports experiment data (for resuming or analysis)
   */
  public importData(data: {
    assignments: { userId: string; variant: string }[];
    events: ExperimentEvent[];
  }): void {
    // Import assignments
    for (const { userId, variant } of data.assignments) {
      this.assignments.set(userId, variant);
    }

    // Import events
    for (const event of data.events) {
      if (!this.events.has(event.userId)) {
        this.events.set(event.userId, []);
      }
      this.events.get(event.userId)!.push(event);
    }
  }

  /**
   * Resets all experiment data (for testing)
   */
  public reset(): void {
    this.events.clear();
    this.assignments.clear();
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Creates a simple A/B test configuration
 */
export function createABTest(
  id: string,
  name: string,
  durationDays: number,
  targetSampleSize: number = 1000
): ExperimentConfig {
  const startDate = new Date();
  const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

  return {
    id,
    name,
    variants: [
      { id: 'control', name: 'Control', weight: 50 },
      { id: 'treatment', name: 'Treatment', weight: 50 }
    ],
    startDate,
    endDate,
    targetSampleSize
  };
}

/**
 * Creates an A/B/C test configuration
 */
export function createABCTest(
  id: string,
  name: string,
  durationDays: number,
  targetSampleSize: number = 1000
): ExperimentConfig {
  const startDate = new Date();
  const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

  return {
    id,
    name,
    variants: [
      { id: 'control', name: 'Control', weight: 33.33 },
      { id: 'treatment-b', name: 'Treatment B', weight: 33.33 },
      { id: 'treatment-c', name: 'Treatment C', weight: 33.34 }
    ],
    startDate,
    endDate,
    targetSampleSize
  };
}

/**
 * Formats analysis results as human-readable summary
 */
export function formatAnalysis(analysis: ExperimentAnalysis): string {
  const lines: string[] = [];

  lines.push(`Experiment: ${analysis.experimentId}`);
  lines.push(`Period: ${analysis.startDate.toLocaleDateString()} - ${analysis.endDate.toLocaleDateString()}`);
  lines.push(`Status: ${analysis.isComplete ? 'Complete' : 'Running'}`);
  lines.push(`Sample Size: ${analysis.sampleSize}`);
  lines.push('');

  lines.push('Results:');
  lines.push(`  Control: ${(analysis.control.conversionRate * 100).toFixed(2)}% (${analysis.control.conversions}/${analysis.control.users})`);
  lines.push(`  Treatment: ${(analysis.treatment.conversionRate * 100).toFixed(2)}% (${analysis.treatment.conversions}/${analysis.treatment.users})`);
  lines.push('');

  lines.push('Statistics:');
  lines.push(`  Absolute Lift: ${(analysis.absoluteLift * 100).toFixed(2)}%`);
  lines.push(`  Relative Lift: ${(analysis.relativeLift * 100).toFixed(2)}%`);
  lines.push(`  p-value: ${analysis.statistics.pValue.toFixed(4)}`);
  lines.push(`  Significant: ${analysis.statistics.isSignificant ? 'Yes' : 'No'}`);
  lines.push(`  Confidence: ${(analysis.statistics.confidenceLevel * 100).toFixed(1)}%`);
  lines.push('');

  lines.push(`Recommendation: ${analysis.recommendation}`);

  if (analysis.warnings.length > 0) {
    lines.push('');
    lines.push('Warnings:');
    for (const warning of analysis.warnings) {
      lines.push(`  - ${warning}`);
    }
  }

  return lines.join('\n');
}

// ============================================================================
// Export
// ============================================================================

export default ABTest;
