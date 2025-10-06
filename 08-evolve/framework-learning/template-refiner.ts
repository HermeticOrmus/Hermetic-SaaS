/**
 * Template Refiner
 *
 * Automated system for analyzing successful launches and suggesting
 * template improvements based on patterns, customizations, and outcomes.
 *
 * This is the brain that evolves the framework templates.
 */

import fs from 'fs/promises';
import path from 'path';
import { FrameworkAnalytics, LaunchMetrics, TemplateAnalytics } from './framework-analytics';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface TemplateImprovement {
  templateName: string;
  templateVersion: string;
  improvementType: 'default_change' | 'new_feature' | 'bug_fix' | 'refactor' | 'deprecation';
  priority: 'critical' | 'high' | 'medium' | 'low';

  // What changed
  change: {
    description: string;
    motivation: string;
    evidenceSource: string[];
    impactEstimate: string;
  };

  // Implementation
  implementation: {
    filesAffected: string[];
    breakingChange: boolean;
    migrationRequired: boolean;
    estimatedEffort: 'low' | 'medium' | 'high';
  };

  // Validation
  validation: {
    testingStrategy: string;
    successCriteria: string[];
    rollbackPlan: string;
  };

  // Metadata
  suggestedBy: 'automated' | 'manual';
  suggestedDate: string;
  status: 'proposed' | 'approved' | 'implemented' | 'rejected';
  version?: string; // Version where this will be/was implemented
}

export interface TemplateVersion {
  version: string;
  releaseDate: string;
  changes: TemplateImprovement[];
  breakingChanges: boolean;
  migrationGuide?: string;
}

export interface PatternExtraction {
  patternName: string;
  description: string;
  occurrences: number;
  successRate: number;
  codeSnippets: CodeSnippet[];
  applicability: string[];
  shouldBeTemplate: boolean;
}

export interface CodeSnippet {
  language: string;
  code: string;
  context: string;
  source: string; // Launch ID where this was found
}

export interface ABTest {
  testId: string;
  templateName: string;
  variantA: string; // Current version
  variantB: string; // Proposed improvement
  hypothesis: string;
  metrics: string[];
  startDate: string;
  endDate?: string;
  results?: ABTestResults;
}

export interface ABTestResults {
  variantAPerformance: Record<string, number>;
  variantBPerformance: Record<string, number>;
  winner: 'A' | 'B' | 'inconclusive';
  confidence: number;
  recommendation: string;
}

// ============================================================================
// Template Refiner Engine
// ============================================================================

export class TemplateRefiner {
  private analytics: FrameworkAnalytics;
  private templateDir: string;
  private improvementsDir: string;

  constructor(
    templateDir: string = './templates',
    improvementsDir: string = './framework-data/improvements'
  ) {
    this.analytics = new FrameworkAnalytics();
    this.templateDir = templateDir;
    this.improvementsDir = improvementsDir;
  }

  /**
   * Initialize template refiner
   */
  async initialize(): Promise<void> {
    await fs.mkdir(this.improvementsDir, { recursive: true });
    await fs.mkdir(path.join(this.improvementsDir, 'proposed'), { recursive: true });
    await fs.mkdir(path.join(this.improvementsDir, 'approved'), { recursive: true });
    await fs.mkdir(path.join(this.improvementsDir, 'implemented'), { recursive: true });
  }

  /**
   * Analyze a template and suggest improvements
   */
  async analyzeTemplate(templateName: string): Promise<TemplateImprovement[]> {
    const templateAnalytics = await this.analytics.analyzeTemplate(templateName);
    const improvements: TemplateImprovement[] = [];

    // 1. Check for customizations that should become defaults
    improvements.push(...this.suggestDefaultChanges(templateAnalytics));

    // 2. Check for common issues that need fixing
    improvements.push(...this.suggestBugFixes(templateAnalytics));

    // 3. Check for declining performance
    improvements.push(...this.suggestRefactors(templateAnalytics));

    // 4. Check for low usage (potential deprecation)
    improvements.push(...this.suggestDeprecations(templateAnalytics));

    return improvements;
  }

  /**
   * Suggest making common customizations the default
   */
  private suggestDefaultChanges(analytics: TemplateAnalytics): TemplateImprovement[] {
    const improvements: TemplateImprovement[] = [];

    analytics.commonCustomizations
      .filter(c => c.shouldBeDefault)
      .forEach(customization => {
        improvements.push({
          templateName: analytics.templateName,
          templateVersion: analytics.version,
          improvementType: 'default_change',
          priority: this.calculatePriority(customization.percentageOfUses, 'default_change'),
          change: {
            description: `Make "${customization.description}" the default behavior`,
            motivation: `${customization.percentageOfUses.toFixed(1)}% of users customize this. Making it default will save time.`,
            evidenceSource: [`${customization.frequency} launches customized this`],
            impactEstimate: `Save ~${(analytics.averageTimeSpent * 0.05).toFixed(1)} hours per launch`,
          },
          implementation: {
            filesAffected: [`templates/${analytics.templateName}`],
            breakingChange: false,
            migrationRequired: false,
            estimatedEffort: 'low',
          },
          validation: {
            testingStrategy: 'Deploy to next 5 launches and compare satisfaction',
            successCriteria: [
              'No increase in customization rate',
              'No decrease in template rating',
              'Positive feedback from users',
            ],
            rollbackPlan: 'Revert to previous default, make new behavior opt-in',
          },
          suggestedBy: 'automated',
          suggestedDate: new Date().toISOString(),
          status: 'proposed',
        });
      });

    return improvements;
  }

  /**
   * Suggest bug fixes for common issues
   */
  private suggestBugFixes(analytics: TemplateAnalytics): TemplateImprovement[] {
    const improvements: TemplateImprovement[] = [];

    analytics.commonIssues
      .filter(issue => issue.severity === 'high' || issue.frequency >= 3)
      .forEach(issue => {
        improvements.push({
          templateName: analytics.templateName,
          templateVersion: analytics.version,
          improvementType: 'bug_fix',
          priority: issue.severity === 'high' ? 'critical' : 'high',
          change: {
            description: `Fix: ${issue.description}`,
            motivation: `This issue occurred ${issue.frequency} times with ${issue.severity} severity`,
            evidenceSource: [`Issue pattern analysis`],
            impactEstimate: `Prevent ~${issue.averageTimeLost.toFixed(1)} hours lost per affected launch`,
          },
          implementation: {
            filesAffected: [`templates/${analytics.templateName}`],
            breakingChange: false,
            migrationRequired: false,
            estimatedEffort: issue.severity === 'high' ? 'medium' : 'low',
          },
          validation: {
            testingStrategy: 'Add test case for this issue, verify fix in test environment',
            successCriteria: [
              'Issue does not occur in test launches',
              'No regression in other functionality',
            ],
            rollbackPlan: 'Revert commit if issue persists',
          },
          suggestedBy: 'automated',
          suggestedDate: new Date().toISOString(),
          status: 'proposed',
        });
      });

    return improvements;
  }

  /**
   * Suggest refactors for declining templates
   */
  private suggestRefactors(analytics: TemplateAnalytics): TemplateImprovement[] {
    const improvements: TemplateImprovement[] = [];

    if (analytics.trendDirection === 'declining' && analytics.averageRating < 7) {
      improvements.push({
        templateName: analytics.templateName,
        templateVersion: analytics.version,
        improvementType: 'refactor',
        priority: 'high',
        change: {
          description: `Comprehensive refactor of ${analytics.templateName}`,
          motivation: `Template rating declining (${analytics.averageRating.toFixed(1)}/10) with ${analytics.trendDirection} trend`,
          evidenceSource: [
            `Trend analysis`,
            `Common issues: ${analytics.commonIssues.slice(0, 3).map(i => i.description).join(', ')}`,
          ],
          impactEstimate: `Improve rating by 2+ points, reduce time spent by 20%`,
        },
        implementation: {
          filesAffected: [`templates/${analytics.templateName}`],
          breakingChange: true,
          migrationRequired: true,
          estimatedEffort: 'high',
        },
        validation: {
          testingStrategy: 'A/B test refactored version against current for 10 launches',
          successCriteria: [
            'Rating improvement > 1.5 points',
            'Time spent reduction > 15%',
            'Issue frequency reduction > 50%',
          ],
          rollbackPlan: 'Keep both versions, let users choose for 1 month',
        },
        suggestedBy: 'automated',
        suggestedDate: new Date().toISOString(),
        status: 'proposed',
      });
    }

    return improvements;
  }

  /**
   * Suggest deprecations for unused templates
   */
  private suggestDeprecations(analytics: TemplateAnalytics): TemplateImprovement[] {
    const improvements: TemplateImprovement[] = [];

    if (analytics.usageTrend === 'decreasing' && analytics.totalUses < 5) {
      improvements.push({
        templateName: analytics.templateName,
        templateVersion: analytics.version,
        improvementType: 'deprecation',
        priority: 'low',
        change: {
          description: `Deprecate ${analytics.templateName}`,
          motivation: `Low usage (${analytics.totalUses} total uses) with decreasing trend`,
          evidenceSource: ['Usage statistics'],
          impactEstimate: 'Reduce maintenance burden, focus on high-value templates',
        },
        implementation: {
          filesAffected: [`templates/${analytics.templateName}`],
          breakingChange: true,
          migrationRequired: true,
          estimatedEffort: 'low',
        },
        validation: {
          testingStrategy: 'Mark as deprecated for 1 quarter, remove if no complaints',
          successCriteria: [
            'No user requests for template',
            'Alternative templates available',
          ],
          rollbackPlan: 'Undeprecate if users request it',
        },
        suggestedBy: 'automated',
        suggestedDate: new Date().toISOString(),
        status: 'proposed',
      });
    }

    return improvements;
  }

  /**
   * Extract successful patterns that could become new templates
   */
  async extractPatterns(): Promise<PatternExtraction[]> {
    // This would analyze custom code from successful launches
    // and identify reusable patterns that appear multiple times

    const patterns: PatternExtraction[] = [];

    // Example pattern detection logic would go here
    // Would need to parse code from launch retrospectives
    // and identify common structures, integrations, etc.

    return patterns;
  }

  /**
   * Create A/B test for a proposed improvement
   */
  async createABTest(improvement: TemplateImprovement): Promise<ABTest> {
    const testId = `ab-${Date.now()}-${improvement.templateName}`;

    const test: ABTest = {
      testId,
      templateName: improvement.templateName,
      variantA: improvement.templateVersion,
      variantB: 'proposed',
      hypothesis: improvement.change.description,
      metrics: [
        'average_rating',
        'average_time_spent',
        'customization_frequency',
        'issue_frequency',
      ],
      startDate: new Date().toISOString(),
    };

    // Save test configuration
    const filepath = path.join(
      this.improvementsDir,
      'ab-tests',
      `${testId}.json`
    );
    await fs.mkdir(path.dirname(filepath), { recursive: true });
    await fs.writeFile(filepath, JSON.stringify(test, null, 2));

    return test;
  }

  /**
   * Check backward compatibility of an improvement
   */
  async checkBackwardCompatibility(
    improvement: TemplateImprovement
  ): Promise<{ compatible: boolean; issues: string[] }> {
    const issues: string[] = [];

    // Check if the change breaks existing APIs
    if (improvement.implementation.breakingChange) {
      issues.push('Breaking change detected');
    }

    // Check if migration path exists
    if (improvement.implementation.migrationRequired && !improvement.implementation.filesAffected.includes('migration')) {
      issues.push('Migration required but no migration guide provided');
    }

    // Would include more sophisticated checks:
    // - API signature changes
    // - Removed features
    // - Changed defaults that affect behavior
    // - Dependency version changes

    return {
      compatible: issues.length === 0,
      issues,
    };
  }

  /**
   * Generate migration guide for breaking changes
   */
  async generateMigrationGuide(improvement: TemplateImprovement): Promise<string> {
    let guide = `# Migration Guide: ${improvement.templateName} ${improvement.templateVersion} → ${improvement.version}\n\n`;

    guide += `## What Changed\n\n${improvement.change.description}\n\n`;
    guide += `## Why\n\n${improvement.change.motivation}\n\n`;

    if (improvement.implementation.breakingChange) {
      guide += `## Breaking Changes\n\n`;
      guide += `This update contains breaking changes. Please follow the migration steps carefully.\n\n`;
    }

    guide += `## Migration Steps\n\n`;
    guide += `1. Update your \`package.json\` to the latest version\n`;
    guide += `2. Run \`npm run migrate:${improvement.templateName}\`\n`;
    guide += `3. Review and test the changes\n`;
    guide += `4. Update your customizations if needed\n\n`;

    guide += `## Testing Your Migration\n\n`;
    improvement.validation.successCriteria.forEach((criteria, i) => {
      guide += `${i + 1}. ${criteria}\n`;
    });

    guide += `\n## Rollback Plan\n\n${improvement.validation.rollbackPlan}\n`;

    return guide;
  }

  /**
   * Approve an improvement for implementation
   */
  async approveImprovement(
    improvementId: string,
    approver: string
  ): Promise<void> {
    const proposedPath = path.join(
      this.improvementsDir,
      'proposed',
      `${improvementId}.json`
    );
    const approvedPath = path.join(
      this.improvementsDir,
      'approved',
      `${improvementId}.json`
    );

    const content = await fs.readFile(proposedPath, 'utf-8');
    const improvement: TemplateImprovement = JSON.parse(content);

    improvement.status = 'approved';
    (improvement as any).approvedBy = approver;
    (improvement as any).approvedDate = new Date().toISOString();

    await fs.writeFile(approvedPath, JSON.stringify(improvement, null, 2));
    await fs.unlink(proposedPath);
  }

  /**
   * Mark an improvement as implemented
   */
  async markImplemented(
    improvementId: string,
    version: string
  ): Promise<void> {
    const approvedPath = path.join(
      this.improvementsDir,
      'approved',
      `${improvementId}.json`
    );
    const implementedPath = path.join(
      this.improvementsDir,
      'implemented',
      `${improvementId}.json`
    );

    const content = await fs.readFile(approvedPath, 'utf-8');
    const improvement: TemplateImprovement = JSON.parse(content);

    improvement.status = 'implemented';
    improvement.version = version;
    (improvement as any).implementedDate = new Date().toISOString();

    await fs.writeFile(implementedPath, JSON.stringify(improvement, null, 2));
    await fs.unlink(approvedPath);
  }

  /**
   * Generate changelog from implemented improvements
   */
  async generateChangelog(version: string): Promise<string> {
    const implementedDir = path.join(this.improvementsDir, 'implemented');
    const files = await fs.readdir(implementedDir);

    const improvements: TemplateImprovement[] = [];
    for (const file of files) {
      const content = await fs.readFile(
        path.join(implementedDir, file),
        'utf-8'
      );
      const improvement: TemplateImprovement = JSON.parse(content);
      if (improvement.version === version) {
        improvements.push(improvement);
      }
    }

    let changelog = `# Version ${version}\n\n`;
    changelog += `**Release Date**: ${new Date().toISOString().split('T')[0]}\n\n`;

    const breaking = improvements.filter(i => i.implementation.breakingChange);
    const features = improvements.filter(i => i.improvementType === 'new_feature');
    const fixes = improvements.filter(i => i.improvementType === 'bug_fix');
    const defaults = improvements.filter(i => i.improvementType === 'default_change');
    const refactors = improvements.filter(i => i.improvementType === 'refactor');

    if (breaking.length > 0) {
      changelog += `## Breaking Changes\n\n`;
      breaking.forEach(imp => {
        changelog += `- **${imp.templateName}**: ${imp.change.description}\n`;
        changelog += `  - ${imp.change.motivation}\n`;
      });
      changelog += `\n`;
    }

    if (features.length > 0) {
      changelog += `## New Features\n\n`;
      features.forEach(imp => {
        changelog += `- **${imp.templateName}**: ${imp.change.description}\n`;
      });
      changelog += `\n`;
    }

    if (defaults.length > 0) {
      changelog += `## Default Changes\n\n`;
      defaults.forEach(imp => {
        changelog += `- **${imp.templateName}**: ${imp.change.description}\n`;
        changelog += `  - ${imp.change.motivation}\n`;
      });
      changelog += `\n`;
    }

    if (fixes.length > 0) {
      changelog += `## Bug Fixes\n\n`;
      fixes.forEach(imp => {
        changelog += `- **${imp.templateName}**: ${imp.change.description}\n`;
      });
      changelog += `\n`;
    }

    if (refactors.length > 0) {
      changelog += `## Refactoring\n\n`;
      refactors.forEach(imp => {
        changelog += `- **${imp.templateName}**: ${imp.change.description}\n`;
      });
      changelog += `\n`;
    }

    return changelog;
  }

  /**
   * Calculate priority for an improvement
   */
  private calculatePriority(
    percentageOfUses: number,
    type: TemplateImprovement['improvementType']
  ): 'critical' | 'high' | 'medium' | 'low' {
    if (type === 'bug_fix') {
      return percentageOfUses > 50 ? 'critical' : 'high';
    }

    if (percentageOfUses > 70) return 'high';
    if (percentageOfUses > 40) return 'medium';
    return 'low';
  }

  /**
   * Generate improvement report
   */
  async generateImprovementReport(): Promise<string> {
    const proposedDir = path.join(this.improvementsDir, 'proposed');
    const approvedDir = path.join(this.improvementsDir, 'approved');

    const proposed = await this.loadImprovements(proposedDir);
    const approved = await this.loadImprovements(approvedDir);

    let report = `# Template Improvement Report\n\n`;
    report += `**Generated**: ${new Date().toISOString()}\n\n`;

    report += `## Summary\n\n`;
    report += `- **Proposed**: ${proposed.length}\n`;
    report += `- **Approved**: ${approved.length}\n`;
    report += `- **Critical**: ${[...proposed, ...approved].filter(i => i.priority === 'critical').length}\n\n`;

    report += `## Proposed Improvements\n\n`;
    const groupedProposed = this.groupByTemplate(proposed);
    Object.entries(groupedProposed).forEach(([template, improvements]) => {
      report += `### ${template}\n\n`;
      improvements.forEach(imp => {
        report += `- [${imp.priority.toUpperCase()}] ${imp.change.description}\n`;
        report += `  - Impact: ${imp.change.impactEstimate}\n`;
      });
      report += `\n`;
    });

    report += `## Approved & In Progress\n\n`;
    const groupedApproved = this.groupByTemplate(approved);
    Object.entries(groupedApproved).forEach(([template, improvements]) => {
      report += `### ${template}\n\n`;
      improvements.forEach(imp => {
        report += `- [${imp.priority.toUpperCase()}] ${imp.change.description}\n`;
        report += `  - Effort: ${imp.implementation.estimatedEffort}\n`;
      });
      report += `\n`;
    });

    return report;
  }

  /**
   * Load improvements from directory
   */
  private async loadImprovements(dir: string): Promise<TemplateImprovement[]> {
    try {
      const files = await fs.readdir(dir);
      const improvements: TemplateImprovement[] = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          const content = await fs.readFile(path.join(dir, file), 'utf-8');
          improvements.push(JSON.parse(content));
        }
      }

      return improvements;
    } catch {
      return [];
    }
  }

  /**
   * Group improvements by template
   */
  private groupByTemplate(
    improvements: TemplateImprovement[]
  ): Record<string, TemplateImprovement[]> {
    return improvements.reduce((acc, imp) => {
      if (!acc[imp.templateName]) {
        acc[imp.templateName] = [];
      }
      acc[imp.templateName].push(imp);
      return acc;
    }, {} as Record<string, TemplateImprovement[]>);
  }
}

// ============================================================================
// CLI Interface
// ============================================================================

export async function runRefiner(command: string, args: string[] = []): Promise<void> {
  const refiner = new TemplateRefiner();

  switch (command) {
    case 'init':
      await refiner.initialize();
      console.log('Template refiner initialized');
      break;

    case 'analyze':
      if (!args[0]) {
        throw new Error('Template name required');
      }
      const improvements = await refiner.analyzeTemplate(args[0]);
      console.log(JSON.stringify(improvements, null, 2));
      break;

    case 'report':
      const report = await refiner.generateImprovementReport();
      console.log(report);
      break;

    case 'changelog':
      if (!args[0]) {
        throw new Error('Version required');
      }
      const changelog = await refiner.generateChangelog(args[0]);
      console.log(changelog);
      break;

    default:
      console.log('Available commands: init, analyze, report, changelog');
  }
}

// CLI entry point
if (require.main === module) {
  const [command, ...args] = process.argv.slice(2);
  runRefiner(command, args).catch(console.error);
}
