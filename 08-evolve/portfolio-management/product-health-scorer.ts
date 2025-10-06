/**
 * Product Health Scorer
 *
 * Calculates comprehensive health scores for MicroSaaS products based on
 * multiple factors including revenue, growth, retention, efficiency, and technical health.
 * Provides automated recommendations and alerts.
 */

interface Product {
  id: string;
  name: string;
  mrr: number;
  mrrGrowthRate: number;
  customers: number;
  churn: number;
  cac: number;
  ltv: number;
  supportHoursPerWeek: number;
  techDebtScore: number;
  uptime: number;
  category: string;
  launchedDate: string;
}

interface HealthScore {
  overall: number;
  revenue: number;
  growth: number;
  retention: number;
  efficiency: number;
  technical: number;
}

interface HealthAlert {
  severity: 'critical' | 'warning' | 'info';
  category: string;
  message: string;
  actionable: string;
}

interface ProductRecommendation {
  strategy: 'INVEST' | 'OPTIMIZE' | 'MAINTAIN' | 'DECIDE';
  primaryAction: string;
  actions: string[];
  warnings: string[];
  timeframe: string;
}

/**
 * Calculate comprehensive health score for a product
 */
export function calculateProductHealth(product: Product): HealthScore {
  const revenueHealth = calculateRevenueHealth(product);
  const growthHealth = calculateGrowthHealth(product);
  const retentionHealth = calculateRetentionHealth(product);
  const efficiencyHealth = calculateEfficiencyHealth(product);
  const technicalHealth = calculateTechnicalHealth(product);

  // Weighted overall score
  const overall = (
    revenueHealth * 0.25 +
    growthHealth * 0.25 +
    retentionHealth * 0.20 +
    efficiencyHealth * 0.15 +
    technicalHealth * 0.15
  );

  return {
    overall: Number(overall.toFixed(2)),
    revenue: Number(revenueHealth.toFixed(2)),
    growth: Number(growthHealth.toFixed(2)),
    retention: Number(retentionHealth.toFixed(2)),
    efficiency: Number(efficiencyHealth.toFixed(2)),
    technical: Number(technicalHealth.toFixed(2))
  };
}

/**
 * Calculate revenue health (0-100)
 */
function calculateRevenueHealth(product: Product): number {
  let score = 0;

  // Base score from MRR amount
  if (product.mrr >= 10000) {
    score = 100;
  } else if (product.mrr >= 5000) {
    score = 80;
  } else if (product.mrr >= 2000) {
    score = 60;
  } else if (product.mrr >= 1000) {
    score = 40;
  } else if (product.mrr >= 500) {
    score = 25;
  } else {
    score = 15;
  }

  // Adjust for customer count (diversification bonus)
  const avgRevenuePerCustomer = product.mrr / product.customers;
  if (product.customers > 100 && avgRevenuePerCustomer < 200) {
    score += 10; // Bonus for diversified customer base
  } else if (product.customers < 20) {
    score -= 10; // Penalty for concentration risk
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate growth health (0-100)
 */
function calculateGrowthHealth(product: Product): number {
  const growthRate = product.mrrGrowthRate;

  let score: number;

  if (growthRate >= 20) {
    score = 100; // Exceptional growth
  } else if (growthRate >= 15) {
    score = 90; // Excellent growth
  } else if (growthRate >= 10) {
    score = 80; // Very good growth
  } else if (growthRate >= 5) {
    score = 65; // Good growth
  } else if (growthRate >= 2) {
    score = 50; // Modest growth
  } else if (growthRate >= 0) {
    score = 35; // Stagnant
  } else if (growthRate >= -5) {
    score = 20; // Declining
  } else {
    score = 5; // Serious decline
  }

  // Adjust for product age
  const ageMonths = (Date.now() - new Date(product.launchedDate).getTime()) / (1000 * 60 * 60 * 24 * 30);

  if (ageMonths < 6) {
    // Early stage: higher growth expected
    if (growthRate < 15) {
      score -= 15; // Penalty for slow early growth
    }
  } else if (ageMonths > 24) {
    // Mature: lower growth acceptable
    if (growthRate > 0) {
      score += 10; // Bonus for any positive growth in mature product
    }
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate retention health (0-100)
 */
function calculateRetentionHealth(product: Product): number {
  const churn = product.churn;

  let score: number;

  if (churn <= 2) {
    score = 100; // Excellent retention
  } else if (churn <= 3) {
    score = 90; // Very good retention
  } else if (churn <= 5) {
    score = 75; // Good retention
  } else if (churn <= 7) {
    score = 55; // Acceptable retention
  } else if (churn <= 10) {
    score = 35; // Poor retention
  } else if (churn <= 15) {
    score = 15; // Very poor retention
  } else {
    score = 5; // Critical retention problem
  }

  // Adjust for customer count (statistical significance)
  if (product.customers < 50) {
    // Small sample size makes churn less reliable
    score = score * 0.9;
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate efficiency health (0-100)
 */
function calculateEfficiencyHealth(product: Product): number {
  const ltvCacRatio = product.ltv / product.cac;

  let score: number;

  if (ltvCacRatio >= 5) {
    score = 100; // Exceptional efficiency
  } else if (ltvCacRatio >= 4) {
    score = 90; // Excellent efficiency
  } else if (ltvCacRatio >= 3) {
    score = 75; // Good efficiency
  } else if (ltvCacRatio >= 2) {
    score = 55; // Acceptable efficiency
  } else if (ltvCacRatio >= 1.5) {
    score = 35; // Poor efficiency
  } else if (ltvCacRatio >= 1) {
    score = 20; // Very poor efficiency
  } else {
    score = 5; // Unsustainable
  }

  // Adjust for support load
  const revenuePerSupportHour = product.mrr / (product.supportHoursPerWeek * 4.33); // 4.33 weeks/month

  if (revenuePerSupportHour > 1000) {
    score += 10; // Bonus for high efficiency
  } else if (revenuePerSupportHour < 200) {
    score -= 15; // Penalty for high support load
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate technical health (0-100)
 */
function calculateTechnicalHealth(product: Product): number {
  // Start with uptime score
  let score = (product.uptime / 100) * 100;

  // Adjust for tech debt
  const techDebtPenalty = product.techDebtScore / 2; // Max 50 point penalty
  score -= techDebtPenalty;

  // Bonus for excellent uptime
  if (product.uptime >= 99.9) {
    score += 10;
  }

  // Penalty for poor uptime
  if (product.uptime < 99) {
    score -= 20;
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Get health category from score
 */
export function getHealthCategory(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Poor';
}

/**
 * Generate health alerts
 */
export function generateHealthAlerts(product: Product): HealthAlert[] {
  const alerts: HealthAlert[] = [];
  const health = calculateProductHealth(product);

  // Critical alerts
  if (product.churn > 10) {
    alerts.push({
      severity: 'critical',
      category: 'Retention',
      message: `Churn rate of ${product.churn}% is critically high`,
      actionable: 'Immediately investigate why customers are leaving. Conduct exit interviews and fix core issues.'
    });
  }

  if (product.ltv / product.cac < 1.5) {
    alerts.push({
      severity: 'critical',
      category: 'Efficiency',
      message: `LTV:CAC ratio of ${(product.ltv / product.cac).toFixed(1)}:1 is unsustainable`,
      actionable: 'Reduce CAC by improving conversion rates or increase LTV by reducing churn and adding upsells.'
    });
  }

  if (product.uptime < 99) {
    alerts.push({
      severity: 'critical',
      category: 'Technical',
      message: `Uptime of ${product.uptime}% is below acceptable standards`,
      actionable: 'Investigate and fix stability issues immediately. Set up better monitoring and alerting.'
    });
  }

  if (product.mrrGrowthRate < -10) {
    alerts.push({
      severity: 'critical',
      category: 'Growth',
      message: `MRR declining ${Math.abs(product.mrrGrowthRate)}% monthly`,
      actionable: 'Product is in serious decline. Determine if product can be saved or should be sold/shut down.'
    });
  }

  // Warning alerts
  if (product.churn > 7 && product.churn <= 10) {
    alerts.push({
      severity: 'warning',
      category: 'Retention',
      message: `Churn rate of ${product.churn}% is high`,
      actionable: 'Focus on improving customer satisfaction and product value. Implement retention campaigns.'
    });
  }

  if (product.techDebtScore > 60) {
    alerts.push({
      severity: 'warning',
      category: 'Technical',
      message: `Tech debt score of ${product.techDebtScore} is high`,
      actionable: 'Allocate time for refactoring and addressing technical debt before it becomes critical.'
    });
  }

  if (product.supportHoursPerWeek > 15) {
    alerts.push({
      severity: 'warning',
      category: 'Efficiency',
      message: `Support load of ${product.supportHoursPerWeek}h/week is high`,
      actionable: 'Improve documentation, add self-service features, or consider hiring support help.'
    });
  }

  if (product.customers < 50 && product.mrr > 2000) {
    alerts.push({
      severity: 'warning',
      category: 'Revenue',
      message: `Only ${product.customers} customers with $${product.mrr} MRR - high concentration risk`,
      actionable: 'Diversify customer base to reduce dependency on few customers.'
    });
  }

  // Info alerts
  if (product.mrrGrowthRate > 20) {
    alerts.push({
      severity: 'info',
      category: 'Growth',
      message: `Exceptional growth of ${product.mrrGrowthRate}% monthly`,
      actionable: 'Consider increasing investment to capitalize on momentum. Ensure infrastructure can scale.'
    });
  }

  if (health.overall >= 80) {
    alerts.push({
      severity: 'info',
      category: 'Overall',
      message: 'Product is performing excellently across all metrics',
      actionable: 'Maintain current strategy and look for opportunities to scale further.'
    });
  }

  return alerts;
}

/**
 * Get strategic recommendation based on product state
 */
export function getRecommendation(product: Product): ProductRecommendation {
  const health = calculateProductHealth(product);
  const alerts = generateHealthAlerts(product);

  // Determine quadrant in growth/revenue matrix
  const highMRR = product.mrr > 5000;
  const highGrowth = product.mrrGrowthRate > 10;

  let strategy: 'INVEST' | 'OPTIMIZE' | 'MAINTAIN' | 'DECIDE';
  let primaryAction: string;
  const actions: string[] = [];
  const warnings: string[] = [];
  let timeframe: string;

  // OPTIMIZE: High MRR, High Growth
  if (highMRR && highGrowth) {
    strategy = 'OPTIMIZE';
    primaryAction = 'Scale operations and maximize growth potential';
    timeframe = 'Ongoing';

    actions.push('Increase marketing spend to capitalize on growth momentum');
    actions.push('Consider hiring specialized help (support, development)');
    actions.push('Invest in infrastructure to handle scaling');
    actions.push('Document processes for potential team expansion');
    actions.push('Explore partnerships or strategic opportunities');

    if (product.techDebtScore > 40) {
      warnings.push('Address tech debt before it impacts scaling ability');
    }
    if (product.supportHoursPerWeek > 10) {
      warnings.push('High support load may limit growth - invest in automation');
    }
  }
  // INVEST: Low MRR, High Growth
  else if (!highMRR && highGrowth) {
    strategy = 'INVEST';
    primaryAction = 'Increase time and resource investment to accelerate growth';
    timeframe = '6-12 months to reach optimization phase';

    actions.push('Dedicate more hours per week to this product');
    actions.push('Increase marketing budget to accelerate customer acquisition');
    actions.push('Focus on improving conversion funnel');
    actions.push('Build features that reduce churn and increase LTV');
    actions.push('Monitor metrics weekly to ensure growth continues');

    if (product.churn > 5) {
      warnings.push('Fix retention issues before scaling - high churn undermines growth');
    }
    if (product.ltv / product.cac < 3) {
      warnings.push('Improve unit economics before heavy investment');
    }
  }
  // MAINTAIN: High MRR, Low Growth
  else if (highMRR && !highGrowth) {
    strategy = 'MAINTAIN';
    primaryAction = 'Minimize time investment while maintaining quality and revenue';
    timeframe = 'Ongoing - harvest cash flow';

    actions.push('Reduce time to minimum viable maintenance level');
    actions.push('Automate repetitive tasks and processes');
    actions.push('Focus on retention over acquisition');
    actions.push('Consider selling if opportunity cost is high');
    actions.push('Use cash flow to fund higher-growth products');

    if (product.mrrGrowthRate < 0) {
      warnings.push('Negative growth - monitor closely for accelerating decline');
    }
    if (product.churn > 7) {
      warnings.push('High churn threatens long-term revenue - investigate causes');
    }
  }
  // DECIDE: Low MRR, Low Growth
  else {
    strategy = 'DECIDE';
    primaryAction = 'Make strategic decision: pivot, sell, or shut down';
    timeframe = 'Decision within 3 months';

    actions.push('Calculate opportunity cost vs alternatives');
    actions.push('Attempt one significant pivot or marketing push');
    actions.push('If no improvement in 90 days, list for sale');
    actions.push('Prepare exit documentation and handoff materials');
    actions.push('Set clear criteria for shut down vs persist decision');

    warnings.push('Product is not generating sufficient returns for time invested');

    if (product.mrrGrowthRate < -5) {
      warnings.push('Declining revenue suggests fundamental issues - likely not saveable');
    }
    if (health.overall < 40) {
      warnings.push('Poor overall health makes recovery unlikely');
    }
    if (product.mrr < 1000) {
      warnings.push('Revenue too low to attract buyers - may need to shut down');
    }
  }

  // Add specific actions based on alerts
  const criticalAlerts = alerts.filter(a => a.severity === 'critical');
  criticalAlerts.forEach(alert => {
    if (!actions.includes(alert.actionable)) {
      actions.push(alert.actionable);
    }
  });

  return {
    strategy,
    primaryAction,
    actions,
    warnings,
    timeframe
  };
}

/**
 * Calculate health trend (improving, stable, declining)
 */
export function calculateHealthTrend(
  currentProduct: Product,
  previousProduct: Product
): {
  trend: 'improving' | 'stable' | 'declining';
  changePercent: number;
  keyChanges: string[];
} {
  const currentHealth = calculateProductHealth(currentProduct);
  const previousHealth = calculateProductHealth(previousProduct);

  const changePercent = ((currentHealth.overall - previousHealth.overall) / previousHealth.overall) * 100;

  let trend: 'improving' | 'stable' | 'declining';
  if (changePercent > 5) {
    trend = 'improving';
  } else if (changePercent < -5) {
    trend = 'declining';
  } else {
    trend = 'stable';
  }

  const keyChanges: string[] = [];

  // Check significant changes in each category
  if (Math.abs(currentHealth.revenue - previousHealth.revenue) > 10) {
    keyChanges.push(`Revenue health ${currentHealth.revenue > previousHealth.revenue ? 'improved' : 'declined'} by ${Math.abs(currentHealth.revenue - previousHealth.revenue).toFixed(0)} points`);
  }

  if (Math.abs(currentHealth.growth - previousHealth.growth) > 10) {
    keyChanges.push(`Growth health ${currentHealth.growth > previousHealth.growth ? 'improved' : 'declined'} by ${Math.abs(currentHealth.growth - previousHealth.growth).toFixed(0)} points`);
  }

  if (Math.abs(currentHealth.retention - previousHealth.retention) > 10) {
    keyChanges.push(`Retention health ${currentHealth.retention > previousHealth.retention ? 'improved' : 'declined'} by ${Math.abs(currentHealth.retention - previousHealth.retention).toFixed(0)} points`);
  }

  return {
    trend,
    changePercent: Number(changePercent.toFixed(2)),
    keyChanges
  };
}

/**
 * Get threshold alerts (when metrics cross important thresholds)
 */
export function getThresholdAlerts(product: Product): Array<{
  metric: string;
  threshold: number;
  current: number;
  status: 'above' | 'below';
  severity: 'good' | 'warning' | 'critical';
}> {
  const alerts = [];

  // MRR thresholds
  if (product.mrr >= 10000) {
    alerts.push({
      metric: 'MRR',
      threshold: 10000,
      current: product.mrr,
      status: 'above' as const,
      severity: 'good' as const
    });
  } else if (product.mrr < 1000) {
    alerts.push({
      metric: 'MRR',
      threshold: 1000,
      current: product.mrr,
      status: 'below' as const,
      severity: 'warning' as const
    });
  }

  // Growth thresholds
  if (product.mrrGrowthRate < 0) {
    alerts.push({
      metric: 'Growth Rate',
      threshold: 0,
      current: product.mrrGrowthRate,
      status: 'below' as const,
      severity: 'critical' as const
    });
  }

  // Churn thresholds
  if (product.churn > 7) {
    alerts.push({
      metric: 'Churn',
      threshold: 7,
      current: product.churn,
      status: 'above' as const,
      severity: product.churn > 10 ? 'critical' as const : 'warning' as const
    });
  }

  // LTV:CAC thresholds
  const ltvCacRatio = product.ltv / product.cac;
  if (ltvCacRatio < 3) {
    alerts.push({
      metric: 'LTV:CAC',
      threshold: 3,
      current: ltvCacRatio,
      status: 'below' as const,
      severity: ltvCacRatio < 2 ? 'critical' as const : 'warning' as const
    });
  }

  // Uptime thresholds
  if (product.uptime < 99.5) {
    alerts.push({
      metric: 'Uptime',
      threshold: 99.5,
      current: product.uptime,
      status: 'below' as const,
      severity: product.uptime < 99 ? 'critical' as const : 'warning' as const
    });
  }

  return alerts;
}
