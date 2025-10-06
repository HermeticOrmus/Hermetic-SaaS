/**
 * Experiment Tracker for Managing Multiple A/B Tests
 *
 * Tracks all running experiments, prevents conflicts, aggregates results,
 * and provides decision framework for ship/kill/iterate decisions.
 *
 * @example
 * ```typescript
 * const tracker = new ExperimentTracker();
 *
 * // Register experiments
 * tracker.registerExperiment(pricingTest);
 * tracker.registerExperiment(onboardingTest);
 *
 * // Check for conflicts
 * const conflicts = tracker.checkConflicts();
 *
 * // Get dashboard data
 * const dashboard = tracker.getDashboard();
 *
 * // Make decisions
 * const decision = tracker.makeDecision('pricing-test-2024');
 * ```
 */

import { ABTest, ExperimentConfig, ExperimentAnalysis } from './ab-test-implementation';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface ExperimentMetadata {
  id: string;
  status: 'planned' | 'running' | 'paused' | 'completed' | 'killed';
  category: string; // 'pricing', 'feature', 'onboarding', 'growth', etc.
  owner: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
  affectedPages: string[]; // Which pages/flows this experiment affects
  affectedMetrics: string[]; // Which metrics this experiment changes
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export interface ExperimentConflict {
  experiment1: string;
  experiment2: string;
  type: 'page_overlap' | 'metric_overlap' | 'user_overlap';
  severity: 'warning' | 'error';
  description: string;
}

export interface DashboardData {
  summary: {
    total: number;
    running: number;
    completed: number;
    killed: number;
    avgDuration: number;
    winRate: number; // % of experiments that shipped
  };
  experiments: ExperimentStatus[];
  conflicts: ExperimentConflict[];
  recommendations: string[];
}

export interface ExperimentStatus {
  id: string;
  name: string;
  status: string;
  category: string;
  progress: number; // 0-100
  daysRunning: number;
  sampleSize: number;
  targetSampleSize: number;
  currentResults?: {
    conversionRate: number;
    lift: number;
    pValue: number;
  };
  recommendation?: string;
  alerts: string[];
}

export interface DecisionRecord {
  experimentId: string;
  decision: 'ship' | 'kill' | 'iterate' | 'extend';
  decidedAt: Date;
  decidedBy: string;
  rationale: string;
  analysis: ExperimentAnalysis;
  nextSteps: string[];
  learnings: string[];
}

// ============================================================================
// ExperimentTracker Class
// ============================================================================

export class ExperimentTracker {
  private experiments: Map<string, ABTest>;
  private metadata: Map<string, ExperimentMetadata>;
  private decisions: Map<string, DecisionRecord>;

  constructor() {
    this.experiments = new Map();
    this.metadata = new Map();
    this.decisions = new Map();
  }

  // ============================================================================
  // Experiment Registration
  // ============================================================================

  /**
   * Registers a new experiment with the tracker
   */
  public registerExperiment(
    config: ExperimentConfig,
    metadata: Omit<ExperimentMetadata, 'id' | 'createdAt' | 'status'>
  ): void {
    // Check if experiment already exists
    if (this.experiments.has(config.id)) {
      throw new Error(`Experiment ${config.id} already registered`);
    }

    // Create experiment
    const experiment = new ABTest(config);
    this.experiments.set(config.id, experiment);

    // Store metadata
    this.metadata.set(config.id, {
      id: config.id,
      status: 'planned',
      createdAt: new Date(),
      ...metadata
    });
  }

  /**
   * Starts an experiment (moves from planned to running)
   */
  public startExperiment(experimentId: string): void {
    const meta = this.metadata.get(experimentId);
    if (!meta) {
      throw new Error(`Experiment ${experimentId} not found`);
    }

    // Check for conflicts before starting
    const conflicts = this.checkConflicts(experimentId);
    const errors = conflicts.filter(c => c.severity === 'error');

    if (errors.length > 0) {
      throw new Error(
        `Cannot start experiment due to conflicts:\n` +
        errors.map(e => `  - ${e.description}`).join('\n')
      );
    }

    meta.status = 'running';
    meta.startedAt = new Date();
  }

  /**
   * Pauses an experiment
   */
  public pauseExperiment(experimentId: string, reason: string): void {
    const meta = this.metadata.get(experimentId);
    if (!meta) {
      throw new Error(`Experiment ${experimentId} not found`);
    }

    meta.status = 'paused';
    console.log(`Paused experiment ${experimentId}: ${reason}`);
  }

  /**
   * Resumes a paused experiment
   */
  public resumeExperiment(experimentId: string): void {
    const meta = this.metadata.get(experimentId);
    if (!meta) {
      throw new Error(`Experiment ${experimentId} not found`);
    }

    if (meta.status !== 'paused') {
      throw new Error(`Experiment ${experimentId} is not paused`);
    }

    meta.status = 'running';
  }

  /**
   * Completes an experiment
   */
  public completeExperiment(experimentId: string): void {
    const meta = this.metadata.get(experimentId);
    if (!meta) {
      throw new Error(`Experiment ${experimentId} not found`);
    }

    meta.status = 'completed';
    meta.completedAt = new Date();
  }

  // ============================================================================
  // Conflict Detection
  // ============================================================================

  /**
   * Checks for conflicts with other running experiments
   */
  public checkConflicts(experimentId?: string): ExperimentConflict[] {
    const conflicts: ExperimentConflict[] = [];

    // Get experiments to check
    const experimentsToCheck = experimentId
      ? [experimentId]
      : Array.from(this.metadata.keys());

    for (const expId of experimentsToCheck) {
      const meta = this.metadata.get(expId);
      if (!meta || meta.status !== 'running') continue;

      // Check against all other running experiments
      for (const [otherId, otherMeta] of this.metadata.entries()) {
        if (otherId === expId || otherMeta.status !== 'running') continue;

        // Check for page overlap
        const pageOverlap = meta.affectedPages.some(page =>
          otherMeta.affectedPages.includes(page)
        );

        if (pageOverlap) {
          conflicts.push({
            experiment1: expId,
            experiment2: otherId,
            type: 'page_overlap',
            severity: 'error',
            description: `${expId} and ${otherId} both affect same pages: ${
              meta.affectedPages.filter(p => otherMeta.affectedPages.includes(p)).join(', ')
            }`
          });
        }

        // Check for metric overlap
        const metricOverlap = meta.affectedMetrics.some(metric =>
          otherMeta.affectedMetrics.includes(metric)
        );

        if (metricOverlap) {
          conflicts.push({
            experiment1: expId,
            experiment2: otherId,
            type: 'metric_overlap',
            severity: 'warning',
            description: `${expId} and ${otherId} both measure: ${
              meta.affectedMetrics.filter(m => otherMeta.affectedMetrics.includes(m)).join(', ')
            }. Results may be confounded.`
          });
        }
      }
    }

    return conflicts;
  }

  // ============================================================================
  // Dashboard & Reporting
  // ============================================================================

  /**
   * Gets dashboard data for all experiments
   */
  public getDashboard(): DashboardData {
    const experiments: ExperimentStatus[] = [];
    const allConflicts = this.checkConflicts();

    let totalDuration = 0;
    let completedCount = 0;
    let shippedCount = 0;

    for (const [id, meta] of this.metadata.entries()) {
      const experiment = this.experiments.get(id);
      if (!experiment) continue;

      const status = this.getExperimentStatus(id);
      experiments.push(status);

      // Calculate metrics
      if (meta.completedAt && meta.startedAt) {
        const duration = meta.completedAt.getTime() - meta.startedAt.getTime();
        totalDuration += duration / (1000 * 60 * 60 * 24); // Convert to days
        completedCount++;

        const decision = this.decisions.get(id);
        if (decision && decision.decision === 'ship') {
          shippedCount++;
        }
      }
    }

    const avgDuration = completedCount > 0 ? totalDuration / completedCount : 0;
    const winRate = completedCount > 0 ? shippedCount / completedCount : 0;

    const summary = {
      total: this.metadata.size,
      running: Array.from(this.metadata.values()).filter(m => m.status === 'running').length,
      completed: Array.from(this.metadata.values()).filter(m => m.status === 'completed').length,
      killed: Array.from(this.metadata.values()).filter(m => m.status === 'killed').length,
      avgDuration,
      winRate
    };

    const recommendations = this.generateRecommendations();

    return {
      summary,
      experiments,
      conflicts: allConflicts,
      recommendations
    };
  }

  /**
   * Gets detailed status for a single experiment
   */
  public getExperimentStatus(experimentId: string): ExperimentStatus {
    const meta = this.metadata.get(experimentId);
    const experiment = this.experiments.get(experimentId);

    if (!meta || !experiment) {
      throw new Error(`Experiment ${experimentId} not found`);
    }

    const config = experiment.getConfig();
    const sampleSize = experiment.getTotalUsers();
    const targetTotal = config.targetSampleSize * config.variants.length;
    const progress = Math.min(100, (sampleSize / targetTotal) * 100);

    const now = new Date();
    const startDate = meta.startedAt || config.startDate;
    const daysRunning = Math.floor(
      (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    const alerts: string[] = [];

    // Check for issues
    if (meta.status === 'running') {
      // Sample size too low
      if (daysRunning > 7 && progress < 50) {
        alerts.push('Low traffic - may not reach sample size in time');
      }

      // Running too long
      if (daysRunning > 28) {
        alerts.push('Running longer than recommended 4 weeks');
      }

      // Check for conflicts
      const conflicts = this.checkConflicts(experimentId);
      if (conflicts.length > 0) {
        alerts.push(`${conflicts.length} conflict(s) detected`);
      }
    }

    // Get current results if experiment is active
    let currentResults;
    if (meta.status === 'running' && sampleSize >= 100) {
      try {
        const analysis = experiment.analyzeResults();
        currentResults = {
          conversionRate: analysis.treatment.conversionRate,
          lift: analysis.relativeLift,
          pValue: analysis.statistics.pValue
        };
      } catch (e) {
        // Analysis not ready yet
      }
    }

    return {
      id: experimentId,
      name: config.name,
      status: meta.status,
      category: meta.category,
      progress,
      daysRunning,
      sampleSize,
      targetSampleSize: targetTotal,
      currentResults,
      alerts
    };
  }

  // ============================================================================
  // Decision Making
  // ============================================================================

  /**
   * Makes a decision on an experiment based on analysis
   */
  public makeDecision(
    experimentId: string,
    decidedBy: string
  ): DecisionRecord {
    const experiment = this.experiments.get(experimentId);
    const meta = this.metadata.get(experimentId);

    if (!experiment || !meta) {
      throw new Error(`Experiment ${experimentId} not found`);
    }

    // Analyze results
    const analysis = experiment.analyzeResults();

    // Determine decision based on recommendation
    let decision: 'ship' | 'kill' | 'iterate' | 'extend';
    let rationale: string;
    let nextSteps: string[] = [];
    const learnings: string[] = [];

    switch (analysis.recommendation) {
      case 'SHIP_IT':
        decision = 'ship';
        rationale = `Treatment shows ${(analysis.relativeLift * 100).toFixed(1)}% improvement with ${(analysis.statistics.confidenceLevel * 100).toFixed(1)}% confidence.`;
        nextSteps = [
          'Deploy treatment to 100% of users',
          'Remove control variant code',
          'Monitor metrics for 2 weeks',
          'Document learnings'
        ];
        learnings.push(`Treatment improved conversion by ${(analysis.relativeLift * 100).toFixed(1)}%`);
        break;

      case 'KILL_IT':
        decision = 'kill';
        if (analysis.absoluteLift < 0) {
          rationale = `Treatment performs ${Math.abs(analysis.relativeLift * 100).toFixed(1)}% worse than control.`;
          learnings.push('Hypothesis was incorrect');
          learnings.push('Users prefer current experience');
        } else {
          rationale = 'No significant difference detected after sufficient sample size.';
          learnings.push('Change had no meaningful impact');
        }
        nextSteps = [
          'Rollback to control',
          'Analyze why hypothesis failed',
          'Consider alternative approaches',
          'Document learnings'
        ];
        break;

      case 'KEEP_RUNNING':
        decision = 'extend';
        rationale = `Need more data. Currently at ${analysis.sampleSize}/${config.targetSampleSize * config.variants.length} users.`;
        nextSteps = [
          `Continue running until ${config.targetSampleSize * config.variants.length} users`,
          'Check results in 1 week',
          'Monitor for issues'
        ];
        break;

      case 'INCONCLUSIVE':
        decision = 'iterate';
        rationale = analysis.warnings.join('. ');
        nextSteps = [
          'Review qualitative feedback',
          'Segment analysis by user type',
          'Consider testing a bigger change',
          'May need to redesign experiment'
        ];
        learnings.push('Results inconclusive - need different approach');
        break;
    }

    // Create decision record
    const record: DecisionRecord = {
      experimentId,
      decision,
      decidedAt: new Date(),
      decidedBy,
      rationale,
      analysis,
      nextSteps,
      learnings
    };

    // Store decision
    this.decisions.set(experimentId, record);

    // Update experiment status
    if (decision === 'ship' || decision === 'kill') {
      meta.status = decision === 'ship' ? 'completed' : 'killed';
      meta.completedAt = new Date();
    }

    return record;
  }

  /**
   * Gets decision history for an experiment
   */
  public getDecisionHistory(experimentId: string): DecisionRecord | undefined {
    return this.decisions.get(experimentId);
  }

  /**
   * Gets all decisions
   */
  public getAllDecisions(): DecisionRecord[] {
    return Array.from(this.decisions.values());
  }

  // ============================================================================
  // Recommendations
  // ============================================================================

  /**
   * Generates recommendations based on current state
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];

    // Check for too many running experiments
    const running = Array.from(this.metadata.values()).filter(
      m => m.status === 'running'
    );

    if (running.length > 3) {
      recommendations.push(
        `You have ${running.length} experiments running. Consider limiting to 2-3 to avoid conflicts.`
      );
    }

    // Check for conflicts
    const conflicts = this.checkConflicts();
    const errors = conflicts.filter(c => c.severity === 'error');

    if (errors.length > 0) {
      recommendations.push(
        `${errors.length} experiment conflict(s) detected. Review and pause conflicting experiments.`
      );
    }

    // Check for stale experiments
    const now = new Date();
    for (const meta of running) {
      if (meta.startedAt) {
        const daysRunning = (now.getTime() - meta.startedAt.getTime()) / (1000 * 60 * 60 * 24);
        if (daysRunning > 28) {
          recommendations.push(
            `Experiment "${meta.id}" has been running for ${Math.floor(daysRunning)} days. Consider making a decision.`
          );
        }
      }
    }

    // Check win rate
    const completed = Array.from(this.metadata.values()).filter(
      m => m.status === 'completed'
    );

    if (completed.length >= 5) {
      const shipped = Array.from(this.decisions.values()).filter(
        d => d.decision === 'ship'
      ).length;

      const winRate = shipped / completed.length;

      if (winRate < 0.2) {
        recommendations.push(
          `Low win rate (${(winRate * 100).toFixed(0)}%). Consider validating hypotheses before coding.`
        );
      } else if (winRate > 0.8) {
        recommendations.push(
          `High win rate (${(winRate * 100).toFixed(0)}%). Consider testing bigger, riskier changes.`
        );
      }
    }

    // Check for learnings not documented
    const noLearnings = Array.from(this.decisions.values()).filter(
      d => d.learnings.length === 0
    );

    if (noLearnings.length > 0) {
      recommendations.push(
        `${noLearnings.length} experiment(s) have no documented learnings. Add insights for future reference.`
      );
    }

    return recommendations;
  }

  // ============================================================================
  // Export/Import
  // ============================================================================

  /**
   * Exports all experiment data
   */
  public exportData(): {
    experiments: { id: string; data: any }[];
    metadata: ExperimentMetadata[];
    decisions: DecisionRecord[];
  } {
    const experiments = Array.from(this.experiments.entries()).map(
      ([id, exp]) => ({
        id,
        data: exp.exportData()
      })
    );

    const metadata = Array.from(this.metadata.values());
    const decisions = Array.from(this.decisions.values());

    return { experiments, metadata, decisions };
  }

  /**
   * Imports experiment data
   */
  public importData(data: {
    experiments: { id: string; data: any }[];
    metadata: ExperimentMetadata[];
    decisions: DecisionRecord[];
  }): void {
    // Import metadata
    for (const meta of data.metadata) {
      this.metadata.set(meta.id, meta);
    }

    // Import experiments
    for (const { id, data: expData } of data.experiments) {
      const config = expData.config;
      const experiment = new ABTest(config);
      experiment.importData(expData);
      this.experiments.set(id, experiment);
    }

    // Import decisions
    for (const decision of data.decisions) {
      this.decisions.set(decision.experimentId, decision);
    }
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  /**
   * Lists all experiments
   */
  public listExperiments(): string[] {
    return Array.from(this.metadata.keys());
  }

  /**
   * Gets experiment by ID
   */
  public getExperiment(experimentId: string): ABTest | undefined {
    return this.experiments.get(experimentId);
  }

  /**
   * Gets metadata by ID
   */
  public getMetadata(experimentId: string): ExperimentMetadata | undefined {
    return this.metadata.get(experimentId);
  }

  /**
   * Removes an experiment (use with caution)
   */
  public removeExperiment(experimentId: string): void {
    this.experiments.delete(experimentId);
    this.metadata.delete(experimentId);
    this.decisions.delete(experimentId);
  }

  /**
   * Gets experiments by status
   */
  public getExperimentsByStatus(
    status: ExperimentMetadata['status']
  ): string[] {
    return Array.from(this.metadata.entries())
      .filter(([_, meta]) => meta.status === status)
      .map(([id, _]) => id);
  }

  /**
   * Gets experiments by category
   */
  public getExperimentsByCategory(category: string): string[] {
    return Array.from(this.metadata.entries())
      .filter(([_, meta]) => meta.category === category)
      .map(([id, _]) => id);
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Formats decision record as human-readable text
 */
export function formatDecision(decision: DecisionRecord): string {
  const lines: string[] = [];

  lines.push(`Decision for ${decision.experimentId}`);
  lines.push(`Date: ${decision.decidedAt.toLocaleDateString()}`);
  lines.push(`Decided by: ${decision.decidedBy}`);
  lines.push(`Decision: ${decision.decision.toUpperCase()}`);
  lines.push('');
  lines.push(`Rationale: ${decision.rationale}`);
  lines.push('');

  if (decision.nextSteps.length > 0) {
    lines.push('Next Steps:');
    decision.nextSteps.forEach(step => lines.push(`  - ${step}`));
    lines.push('');
  }

  if (decision.learnings.length > 0) {
    lines.push('Learnings:');
    decision.learnings.forEach(learning => lines.push(`  - ${learning}`));
  }

  return lines.join('\n');
}

/**
 * Formats dashboard as human-readable text
 */
export function formatDashboard(dashboard: DashboardData): string {
  const lines: string[] = [];

  lines.push('=== Experiment Dashboard ===');
  lines.push('');
  lines.push('Summary:');
  lines.push(`  Total Experiments: ${dashboard.summary.total}`);
  lines.push(`  Running: ${dashboard.summary.running}`);
  lines.push(`  Completed: ${dashboard.summary.completed}`);
  lines.push(`  Killed: ${dashboard.summary.killed}`);
  lines.push(`  Avg Duration: ${dashboard.summary.avgDuration.toFixed(1)} days`);
  lines.push(`  Win Rate: ${(dashboard.summary.winRate * 100).toFixed(1)}%`);
  lines.push('');

  if (dashboard.conflicts.length > 0) {
    lines.push('Conflicts:');
    dashboard.conflicts.forEach(conflict => {
      lines.push(`  [${conflict.severity.toUpperCase()}] ${conflict.description}`);
    });
    lines.push('');
  }

  if (dashboard.recommendations.length > 0) {
    lines.push('Recommendations:');
    dashboard.recommendations.forEach(rec => {
      lines.push(`  - ${rec}`);
    });
    lines.push('');
  }

  lines.push('Active Experiments:');
  const running = dashboard.experiments.filter(e => e.status === 'running');
  running.forEach(exp => {
    lines.push(`  ${exp.name} (${exp.category})`);
    lines.push(`    Progress: ${exp.progress.toFixed(0)}% | Days: ${exp.daysRunning}`);
    if (exp.currentResults) {
      lines.push(`    Current: ${(exp.currentResults.conversionRate * 100).toFixed(2)}% conversion, ${(exp.currentResults.lift * 100).toFixed(1)}% lift`);
    }
    if (exp.alerts.length > 0) {
      exp.alerts.forEach(alert => lines.push(`    ⚠ ${alert}`));
    }
  });

  return lines.join('\n');
}

// ============================================================================
// Export
// ============================================================================

export default ExperimentTracker;
