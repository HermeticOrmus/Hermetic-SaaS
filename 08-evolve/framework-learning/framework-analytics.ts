/**
 * Framework Analytics System
 *
 * Tracks meta-framework usage patterns, template effectiveness,
 * and identifies improvement opportunities through data analysis.
 *
 * This system is the eyes of the self-improving framework.
 */

import fs from 'fs/promises';
import path from 'path';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface LaunchMetrics {
  launchId: string;
  projectName: string;
  launchDate: string;
  frameworkVersion: string;
  totalDevelopmentTime: number; // hours

  // Phase timings
  phaseTimings: {
    ideation: number;
    architecture: number;
    development: number;
    testing: number;
    deployment: number;
    marketing: number;
  };

  // Template usage
  templatesUsed: TemplateUsage[];

  // Outcomes
  success: boolean;
  timeToFirstUser: number; // hours
  initialUsers: number;
  initialRevenue: number;

  // Quality metrics
  bugsInTesting: number;
  bugsInProduction: number;
  testCoverage: number;
  performanceScore: number;

  // Ratings
  ratings: {
    templateQuality: number;
    documentationClarity: number;
    integrationEase: number;
    customizationFlexibility: number;
    overallFrameworkValue: number;
  };

  // Blockers
  blockers: Blocker[];

  // Improvements suggested
  improvements: ImprovementSuggestion[];
}

export interface TemplateUsage {
  templateName: string;
  templateVersion: string;
  usagePercentage: number; // 0-100, how much of template was used
  customizationLevel: 'none' | 'minor' | 'major';
  timeSpent: number; // hours
  rating: number; // 1-10
  customizations: string[];
  issues: string[];
}

export interface Blocker {
  type: 'critical' | 'minor';
  description: string;
  timeLost: number; // hours
  rootCause: string;
  resolution: string;
  preventionStrategy?: string;
}

export interface ImprovementSuggestion {
  priority: 'high' | 'medium' | 'low';
  title: string;
  problem: string;
  proposedSolution: string;
  estimatedImpact: string;
  implementationEffort: 'low' | 'medium' | 'high';
  category: 'template' | 'documentation' | 'tooling' | 'process';
}

export interface TemplateAnalytics {
  templateName: string;
  version: string;

  // Usage stats
  totalUses: number;
  lastUsed: string;
  averageUsagePercentage: number;

  // Success metrics
  successRate: number; // % of launches using this that succeeded
  averageRating: number;
  averageTimeSpent: number;

  // Customization patterns
  customizationFrequency: {
    none: number;
    minor: number;
    major: number;
  };
  commonCustomizations: CustomizationPattern[];

  // Issues
  commonIssues: IssuePattern[];

  // Trends
  trendDirection: 'improving' | 'stable' | 'declining';
  usageTrend: 'increasing' | 'stable' | 'decreasing';
}

export interface CustomizationPattern {
  description: string;
  frequency: number; // number of times this customization was made
  percentageOfUses: number; // % of template uses that made this customization
  shouldBeDefault: boolean; // if > 70% true
}

export interface IssuePattern {
  description: string;
  frequency: number;
  severity: 'low' | 'medium' | 'high';
  averageTimeLost: number;
}

export interface FrameworkHealth {
  version: string;
  totalLaunches: number;
  successRate: number;

  // Velocity metrics
  averageTimeToLaunch: number;
  averageBlockerResolutionTime: number;
  velocityTrend: 'improving' | 'stable' | 'declining';

  // Quality metrics
  averageTestCoverage: number;
  averagePerformanceScore: number;
  averagePostLaunchIssues: number;
  qualityTrend: 'improving' | 'stable' | 'declining';

  // Evolution metrics
  templateUpdatesThisMonth: number;
  communityContributions: number;
  knowledgeBaseGrowth: number;

  // Template health
  topTemplates: TemplateAnalytics[];
  underperformingTemplates: TemplateAnalytics[];
  missingTemplates: MissingTemplatePattern[];

  // Improvement opportunities
  topImprovementOpportunities: ImprovementOpportunity[];
}

export interface MissingTemplatePattern {
  description: string;
  requestedCount: number;
  estimatedImpact: 'high' | 'medium' | 'low';
  complexity: 'low' | 'medium' | 'high';
  priority: number; // impact / complexity
}

export interface ImprovementOpportunity {
  category: string;
  description: string;
  potentialTimeSavings: number; // hours per launch
  affectedLaunches: number; // % of launches this would help
  priority: number; // calculated score
  suggestedAction: string;
}

// ============================================================================
// Framework Analytics Engine
// ============================================================================

export class FrameworkAnalytics {
  private dataDir: string;

  constructor(dataDir: string = './framework-data') {
    this.dataDir = dataDir;
  }

  /**
   * Initialize analytics data directory
   */
  async initialize(): Promise<void> {
    await fs.mkdir(this.dataDir, { recursive: true });
    await fs.mkdir(path.join(this.dataDir, 'launches'), { recursive: true });
    await fs.mkdir(path.join(this.dataDir, 'analytics'), { recursive: true });
  }

  /**
   * Record a launch retrospective
   */
  async recordLaunch(metrics: LaunchMetrics): Promise<void> {
    const filepath = path.join(
      this.dataDir,
      'launches',
      `${metrics.launchId}.json`
    );

    await fs.writeFile(filepath, JSON.stringify(metrics, null, 2));

    // Trigger analytics update
    await this.updateAnalytics();
  }

  /**
   * Load all launch data
   */
  private async loadAllLaunches(): Promise<LaunchMetrics[]> {
    const launchDir = path.join(this.dataDir, 'launches');
    const files = await fs.readdir(launchDir);

    const launches: LaunchMetrics[] = [];
    for (const file of files) {
      if (file.endsWith('.json')) {
        const content = await fs.readFile(
          path.join(launchDir, file),
          'utf-8'
        );
        launches.push(JSON.parse(content));
      }
    }

    return launches;
  }

  /**
   * Analyze template usage patterns
   */
  async analyzeTemplate(templateName: string): Promise<TemplateAnalytics> {
    const launches = await this.loadAllLaunches();

    const uses = launches.flatMap(launch =>
      launch.templatesUsed.filter(t => t.templateName === templateName)
    );

    if (uses.length === 0) {
      throw new Error(`No data found for template: ${templateName}`);
    }

    // Calculate metrics
    const totalUses = uses.length;
    const averageUsagePercentage =
      uses.reduce((sum, u) => sum + u.usagePercentage, 0) / totalUses;
    const averageRating =
      uses.reduce((sum, u) => sum + u.rating, 0) / totalUses;
    const averageTimeSpent =
      uses.reduce((sum, u) => sum + u.timeSpent, 0) / totalUses;

    // Customization frequency
    const customizationCounts = {
      none: uses.filter(u => u.customizationLevel === 'none').length,
      minor: uses.filter(u => u.customizationLevel === 'minor').length,
      major: uses.filter(u => u.customizationLevel === 'major').length,
    };

    // Common customizations
    const customizationMap = new Map<string, number>();
    uses.forEach(use => {
      use.customizations.forEach(customization => {
        customizationMap.set(
          customization,
          (customizationMap.get(customization) || 0) + 1
        );
      });
    });

    const commonCustomizations: CustomizationPattern[] = Array.from(
      customizationMap.entries()
    )
      .map(([description, frequency]) => ({
        description,
        frequency,
        percentageOfUses: (frequency / totalUses) * 100,
        shouldBeDefault: (frequency / totalUses) > 0.7,
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);

    // Common issues
    const issueMap = new Map<string, number>();
    uses.forEach(use => {
      use.issues.forEach(issue => {
        issueMap.set(issue, (issueMap.get(issue) || 0) + 1);
      });
    });

    const commonIssues: IssuePattern[] = Array.from(issueMap.entries())
      .map(([description, frequency]) => ({
        description,
        frequency,
        severity: this.classifyIssueSeverity(description, frequency, totalUses),
        averageTimeLost: 0, // Would need blocker data correlation
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);

    // Success rate for launches using this template
    const launchesUsingTemplate = launches.filter(launch =>
      launch.templatesUsed.some(t => t.templateName === templateName)
    );
    const successRate =
      launchesUsingTemplate.filter(l => l.success).length /
      launchesUsingTemplate.length;

    // Trends
    const recentUses = uses.slice(-10);
    const olderUses = uses.slice(0, -10);
    const trendDirection = this.calculateTrend(
      olderUses.reduce((sum, u) => sum + u.rating, 0) / (olderUses.length || 1),
      recentUses.reduce((sum, u) => sum + u.rating, 0) / recentUses.length
    );

    return {
      templateName,
      version: uses[uses.length - 1].templateVersion,
      totalUses,
      lastUsed: launchesUsingTemplate[launchesUsingTemplate.length - 1].launchDate,
      averageUsagePercentage,
      successRate,
      averageRating,
      averageTimeSpent,
      customizationFrequency: customizationCounts,
      commonCustomizations,
      commonIssues,
      trendDirection,
      usageTrend: 'stable', // Would need time-series analysis
    };
  }

  /**
   * Calculate overall framework health
   */
  async calculateFrameworkHealth(): Promise<FrameworkHealth> {
    const launches = await this.loadAllLaunches();

    if (launches.length === 0) {
      throw new Error('No launch data available');
    }

    const totalLaunches = launches.length;
    const successfulLaunches = launches.filter(l => l.success).length;
    const successRate = successfulLaunches / totalLaunches;

    // Velocity metrics
    const averageTimeToLaunch =
      launches.reduce((sum, l) => sum + l.totalDevelopmentTime, 0) / totalLaunches;

    const averageBlockerResolutionTime =
      launches.reduce((sum, l) => {
        const blockerTime = l.blockers.reduce((s, b) => s + b.timeLost, 0);
        return sum + (blockerTime / (l.blockers.length || 1));
      }, 0) / totalLaunches;

    // Quality metrics
    const averageTestCoverage =
      launches.reduce((sum, l) => sum + l.testCoverage, 0) / totalLaunches;
    const averagePerformanceScore =
      launches.reduce((sum, l) => sum + l.performanceScore, 0) / totalLaunches;
    const averagePostLaunchIssues =
      launches.reduce((sum, l) => sum + l.bugsInProduction, 0) / totalLaunches;

    // Trends
    const recentLaunches = launches.slice(-10);
    const olderLaunches = launches.slice(0, -10);

    const velocityTrend = this.calculateTrend(
      olderLaunches.reduce((s, l) => s + l.totalDevelopmentTime, 0) / (olderLaunches.length || 1),
      recentLaunches.reduce((s, l) => s + l.totalDevelopmentTime, 0) / recentLaunches.length
    );

    const qualityTrend = this.calculateTrend(
      olderLaunches.reduce((s, l) => s + l.ratings.overallFrameworkValue, 0) / (olderLaunches.length || 1),
      recentLaunches.reduce((s, l) => s + l.ratings.overallFrameworkValue, 0) / recentLaunches.length
    );

    // Template analysis
    const allTemplates = new Set<string>();
    launches.forEach(launch => {
      launch.templatesUsed.forEach(t => allTemplates.add(t.templateName));
    });

    const templateAnalytics = await Promise.all(
      Array.from(allTemplates).map(name => this.analyzeTemplate(name))
    );

    const topTemplates = templateAnalytics
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, 5);

    const underperformingTemplates = templateAnalytics
      .filter(t => t.averageRating < 6 || t.successRate < 0.7)
      .sort((a, b) => a.averageRating - b.averageRating);

    // Missing templates
    const missingTemplates = this.analyzeMissingTemplates(launches);

    // Improvement opportunities
    const improvements = this.identifyImprovementOpportunities(
      launches,
      templateAnalytics
    );

    return {
      version: launches[launches.length - 1].frameworkVersion,
      totalLaunches,
      successRate,
      averageTimeToLaunch,
      averageBlockerResolutionTime,
      velocityTrend,
      averageTestCoverage,
      averagePerformanceScore,
      averagePostLaunchIssues,
      qualityTrend,
      templateUpdatesThisMonth: 0, // Would track from git commits
      communityContributions: 0, // Would track from PRs
      knowledgeBaseGrowth: 0, // Would track from docs
      topTemplates,
      underperformingTemplates,
      missingTemplates,
      topImprovementOpportunities: improvements,
    };
  }

  /**
   * Identify missing template patterns
   */
  private analyzeMissingTemplates(launches: LaunchMetrics[]): MissingTemplatePattern[] {
    const missingMap = new Map<string, number>();

    launches.forEach(launch => {
      launch.improvements.forEach(improvement => {
        if (improvement.category === 'template') {
          const key = improvement.title;
          missingMap.set(key, (missingMap.get(key) || 0) + 1);
        }
      });
    });

    return Array.from(missingMap.entries())
      .map(([description, requestedCount]) => ({
        description,
        requestedCount,
        estimatedImpact: this.estimateImpact(requestedCount, launches.length),
        complexity: 'medium' as const, // Would need manual classification
        priority: requestedCount / launches.length,
      }))
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 10);
  }

  /**
   * Identify top improvement opportunities
   */
  private identifyImprovementOpportunities(
    launches: LaunchMetrics[],
    templates: TemplateAnalytics[]
  ): ImprovementOpportunity[] {
    const opportunities: ImprovementOpportunity[] = [];

    // 1. Templates that should be defaults based on customization frequency
    templates.forEach(template => {
      template.commonCustomizations.forEach(customization => {
        if (customization.shouldBeDefault) {
          opportunities.push({
            category: 'Template Default',
            description: `Make "${customization.description}" default in ${template.templateName}`,
            potentialTimeSavings: template.averageTimeSpent * 0.1, // Estimate 10% time savings
            affectedLaunches: customization.percentageOfUses,
            priority: customization.percentageOfUses * template.totalUses,
            suggestedAction: `Update ${template.templateName} template to include this by default`,
          });
        }
      });
    });

    // 2. Common blockers that could be automated
    const blockerMap = new Map<string, { count: number; totalTime: number }>();
    launches.forEach(launch => {
      launch.blockers.forEach(blocker => {
        const key = blocker.rootCause;
        const existing = blockerMap.get(key) || { count: 0, totalTime: 0 };
        blockerMap.set(key, {
          count: existing.count + 1,
          totalTime: existing.totalTime + blocker.timeLost,
        });
      });
    });

    blockerMap.forEach((data, rootCause) => {
      if (data.count >= 3) {
        opportunities.push({
          category: 'Blocker Prevention',
          description: `Prevent blocker: ${rootCause}`,
          potentialTimeSavings: data.totalTime / data.count,
          affectedLaunches: (data.count / launches.length) * 100,
          priority: data.totalTime,
          suggestedAction: `Add automated detection or prevention for this issue`,
        });
      }
    });

    // 3. Low-rated templates that need improvement
    templates
      .filter(t => t.averageRating < 7)
      .forEach(template => {
        opportunities.push({
          category: 'Template Quality',
          description: `Improve ${template.templateName} (rating: ${template.averageRating.toFixed(1)})`,
          potentialTimeSavings: template.averageTimeSpent * 0.2,
          affectedLaunches: (template.totalUses / launches.length) * 100,
          priority: template.totalUses * (10 - template.averageRating),
          suggestedAction: `Review and refactor based on common issues: ${template.commonIssues.map(i => i.description).join(', ')}`,
        });
      });

    return opportunities
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 10);
  }

  /**
   * Update analytics cache
   */
  private async updateAnalytics(): Promise<void> {
    const health = await this.calculateFrameworkHealth();

    const filepath = path.join(
      this.dataDir,
      'analytics',
      'framework-health.json'
    );

    await fs.writeFile(filepath, JSON.stringify(health, null, 2));
  }

  /**
   * Generate analytics report
   */
  async generateReport(): Promise<string> {
    const health = await this.calculateFrameworkHealth();

    let report = `# Framework Analytics Report\n\n`;
    report += `**Generated**: ${new Date().toISOString()}\n`;
    report += `**Framework Version**: ${health.version}\n`;
    report += `**Total Launches**: ${health.totalLaunches}\n\n`;

    report += `## Overall Health\n\n`;
    report += `- **Success Rate**: ${(health.successRate * 100).toFixed(1)}%\n`;
    report += `- **Average Time to Launch**: ${health.averageTimeToLaunch.toFixed(1)} hours\n`;
    report += `- **Velocity Trend**: ${health.velocityTrend}\n`;
    report += `- **Quality Trend**: ${health.qualityTrend}\n\n`;

    report += `## Top Performing Templates\n\n`;
    health.topTemplates.forEach((template, i) => {
      report += `${i + 1}. **${template.templateName}**\n`;
      report += `   - Rating: ${template.averageRating.toFixed(1)}/10\n`;
      report += `   - Success Rate: ${(template.successRate * 100).toFixed(1)}%\n`;
      report += `   - Uses: ${template.totalUses}\n\n`;
    });

    report += `## Top Improvement Opportunities\n\n`;
    health.topImprovementOpportunities.slice(0, 5).forEach((opp, i) => {
      report += `${i + 1}. **${opp.category}**: ${opp.description}\n`;
      report += `   - Potential Savings: ${opp.potentialTimeSavings.toFixed(1)} hours/launch\n`;
      report += `   - Affects: ${opp.affectedLaunches.toFixed(1)}% of launches\n`;
      report += `   - Action: ${opp.suggestedAction}\n\n`;
    });

    report += `## Missing Templates\n\n`;
    health.missingTemplates.slice(0, 5).forEach((missing, i) => {
      report += `${i + 1}. ${missing.description} (requested ${missing.requestedCount} times)\n`;
    });

    return report;
  }

  /**
   * Helper: Calculate trend direction
   */
  private calculateTrend(oldValue: number, newValue: number): 'improving' | 'stable' | 'declining' {
    const change = ((newValue - oldValue) / oldValue) * 100;
    if (change > 5) return 'improving';
    if (change < -5) return 'declining';
    return 'stable';
  }

  /**
   * Helper: Classify issue severity
   */
  private classifyIssueSeverity(
    description: string,
    frequency: number,
    totalUses: number
  ): 'low' | 'medium' | 'high' {
    const percentage = (frequency / totalUses) * 100;
    if (percentage > 30) return 'high';
    if (percentage > 10) return 'medium';
    return 'low';
  }

  /**
   * Helper: Estimate impact
   */
  private estimateImpact(
    requestCount: number,
    totalLaunches: number
  ): 'high' | 'medium' | 'low' {
    const percentage = (requestCount / totalLaunches) * 100;
    if (percentage > 20) return 'high';
    if (percentage > 5) return 'medium';
    return 'low';
  }
}

// ============================================================================
// CLI Interface
// ============================================================================

export async function runAnalytics(command: string, args: string[] = []): Promise<void> {
  const analytics = new FrameworkAnalytics();

  switch (command) {
    case 'init':
      await analytics.initialize();
      console.log('Framework analytics initialized');
      break;

    case 'template':
      if (!args[0]) {
        throw new Error('Template name required');
      }
      const templateAnalysis = await analytics.analyzeTemplate(args[0]);
      console.log(JSON.stringify(templateAnalysis, null, 2));
      break;

    case 'health':
      const health = await analytics.calculateFrameworkHealth();
      console.log(JSON.stringify(health, null, 2));
      break;

    case 'report':
      const report = await analytics.generateReport();
      console.log(report);
      break;

    default:
      console.log('Available commands: init, template, health, report');
  }
}

// CLI entry point
if (require.main === module) {
  const [command, ...args] = process.argv.slice(2);
  runAnalytics(command, args).catch(console.error);
}
