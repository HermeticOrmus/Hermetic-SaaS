/**
 * Portfolio Analytics Engine
 *
 * Calculates cross-product metrics, portfolio-level KPIs, opportunity cost analysis,
 * resource allocation optimization, and risk assessment for MicroSaaS portfolios.
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

interface PortfolioMetrics {
  totalMRR: number;
  totalARR: number;
  totalCustomers: number;
  averageChurn: number;
  weightedGrowthRate: number;
  portfolioHealthScore: number;
  diversificationScore: number;
  totalLTV: number;
  totalCAC: number;
  portfolioLTVCACRatio: number;
}

interface RiskAssessment {
  concentrationRisk: number; // 0-1, higher = more concentrated
  riskLevel: 'Low' | 'Medium' | 'High';
  topProductShare: number;
  recommendations: string[];
}

interface OpportunityCost {
  productId: string;
  currentROI: number;
  potentialROI: number;
  opportunityCost: number;
  recommendation: string;
}

interface ResourceAllocation {
  productId: string;
  currentHours: number;
  recommendedHours: number;
  expectedImpact: number;
  rationale: string;
}

/**
 * Calculate comprehensive portfolio-level metrics
 */
export function calculatePortfolioMetrics(products: Product[]): PortfolioMetrics {
  const totalMRR = products.reduce((sum, p) => sum + p.mrr, 0);
  const totalARR = totalMRR * 12;
  const totalCustomers = products.reduce((sum, p) => sum + p.customers, 0);

  // Weighted average churn (weighted by customer count)
  const averageChurn = products.reduce((sum, p) =>
    sum + (p.churn * p.customers), 0
  ) / totalCustomers;

  // Weighted growth rate (weighted by MRR)
  const weightedGrowthRate = products.reduce((sum, p) =>
    sum + (p.mrrGrowthRate * (p.mrr / totalMRR)), 0
  );

  // Portfolio health score (weighted by MRR)
  const portfolioHealthScore = products.reduce((sum, p) => {
    const healthScore = calculateSimpleHealthScore(p);
    return sum + (healthScore * (p.mrr / totalMRR));
  }, 0);

  // Diversification score (Herfindahl-Hirschman Index inverted)
  // HHI ranges from 1/n (perfectly diversified) to 1 (monopoly)
  // We convert to 0-1 scale where 1 is perfectly diversified
  const hhi = products.reduce((sum, p) => {
    const share = p.mrr / totalMRR;
    return sum + (share * share);
  }, 0);

  // Convert HHI to diversification score
  // If we have n products, perfect diversification = 1/n
  // We normalize so that perfect diversification = 1.0
  const perfectDiversification = 1 / products.length;
  const diversificationScore = Math.max(0, 1 - ((hhi - perfectDiversification) / (1 - perfectDiversification)));

  // Portfolio-level LTV and CAC (weighted averages)
  const totalLTV = products.reduce((sum, p) =>
    sum + (p.ltv * p.customers), 0
  ) / totalCustomers;

  const totalCAC = products.reduce((sum, p) =>
    sum + (p.cac * p.customers), 0
  ) / totalCustomers;

  return {
    totalMRR,
    totalARR,
    totalCustomers,
    averageChurn: Number(averageChurn.toFixed(2)),
    weightedGrowthRate: Number(weightedGrowthRate.toFixed(2)),
    portfolioHealthScore: Number(portfolioHealthScore.toFixed(2)),
    diversificationScore: Number(diversificationScore.toFixed(3)),
    totalLTV: Number(totalLTV.toFixed(2)),
    totalCAC: Number(totalCAC.toFixed(2)),
    portfolioLTVCACRatio: Number((totalLTV / totalCAC).toFixed(2))
  };
}

/**
 * Simple health score calculation for portfolio metrics
 */
function calculateSimpleHealthScore(product: Product): number {
  // Revenue score (0-100)
  const revenueScore = Math.min(100, (product.mrr / 10000) * 100);

  // Growth score (0-100)
  const growthScore = Math.min(100, Math.max(0, 50 + (product.mrrGrowthRate * 2)));

  // Retention score (0-100)
  const retentionScore = Math.max(0, 100 - (product.churn * 10));

  // Efficiency score (0-100)
  const ltvCacRatio = product.ltv / product.cac;
  const efficiencyScore = Math.min(100, (ltvCacRatio / 5) * 100);

  // Technical score (0-100)
  const uptimeScore = (product.uptime / 100) * 100;
  const techDebtPenalty = product.techDebtScore;
  const technicalScore = (uptimeScore - techDebtPenalty / 2);

  // Weighted average
  return (
    revenueScore * 0.25 +
    growthScore * 0.25 +
    retentionScore * 0.20 +
    efficiencyScore * 0.15 +
    technicalScore * 0.15
  );
}

/**
 * Assess portfolio risk and concentration
 */
export function assessRisk(products: Product[]): RiskAssessment {
  const totalMRR = products.reduce((sum, p) => sum + p.mrr, 0);

  // Calculate HHI for concentration risk
  const hhi = products.reduce((sum, p) => {
    const share = p.mrr / totalMRR;
    return sum + (share * share);
  }, 0);

  // Top product share
  const sortedByRevenue = [...products].sort((a, b) => b.mrr - a.mrr);
  const topProductShare = (sortedByRevenue[0].mrr / totalMRR) * 100;

  // Risk level determination
  let riskLevel: 'Low' | 'Medium' | 'High';
  if (hhi < 0.25) {
    riskLevel = 'Low';
  } else if (hhi < 0.50) {
    riskLevel = 'Medium';
  } else {
    riskLevel = 'High';
  }

  // Generate recommendations
  const recommendations: string[] = [];

  if (topProductShare > 60) {
    recommendations.push(
      `Top product accounts for ${topProductShare.toFixed(0)}% of revenue. Consider growing other products to reduce dependency.`
    );
  }

  if (hhi > 0.5) {
    recommendations.push(
      'High revenue concentration detected. Launch new products or invest more in smaller products.'
    );
  }

  if (products.length < 3) {
    recommendations.push(
      `Only ${products.length} product(s) in portfolio. Consider adding 1-2 more products for better diversification.`
    );
  }

  // Check for category concentration
  const categories = products.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + p.mrr;
    return acc;
  }, {} as Record<string, number>);

  const categorySorted = Object.entries(categories)
    .sort(([, a], [, b]) => b - a);

  if (categorySorted.length > 0 && categorySorted[0][1] / totalMRR > 0.7) {
    recommendations.push(
      `${categorySorted[0][0]} category dominates with ${((categorySorted[0][1] / totalMRR) * 100).toFixed(0)}%. Diversify into other categories.`
    );
  }

  // Check for negative growth products
  const decliningProducts = products.filter(p => p.mrrGrowthRate < 0);
  if (decliningProducts.length > 0) {
    recommendations.push(
      `${decliningProducts.length} product(s) showing negative growth. Review and decide: invest, maintain, or exit.`
    );
  }

  // Check for high churn
  const highChurnProducts = products.filter(p => p.churn > 7);
  if (highChurnProducts.length > 0) {
    recommendations.push(
      `${highChurnProducts.length} product(s) with >7% churn. Focus on retention to improve stability.`
    );
  }

  if (recommendations.length === 0) {
    recommendations.push('Portfolio is well-balanced. Continue monitoring key metrics.');
  }

  return {
    concentrationRisk: Number(hhi.toFixed(3)),
    riskLevel,
    topProductShare: Number(topProductShare.toFixed(2)),
    recommendations
  };
}

/**
 * Calculate opportunity cost for each product
 */
export function calculateOpportunityCost(
  product: Product,
  alternativeProducts: Product[]
): OpportunityCost {
  // Current ROI: MRR per hour spent
  const currentROI = product.mrr / (product.supportHoursPerWeek * 4.33); // 4.33 weeks/month avg

  // Find best alternative ROI
  const bestAlternative = alternativeProducts
    .map(p => ({
      product: p,
      roi: p.mrr / (p.supportHoursPerWeek * 4.33)
    }))
    .sort((a, b) => b.roi - a.roi)[0];

  const potentialROI = bestAlternative?.roi || 0;

  // Opportunity cost: what you're giving up by working on this product
  const opportunityCost = (potentialROI - currentROI) * product.supportHoursPerWeek * 4.33;

  // Generate recommendation
  let recommendation: string;

  if (opportunityCost > product.mrr * 0.3) {
    recommendation = `High opportunity cost detected (${Math.abs(opportunityCost).toFixed(0)}/month). Consider reallocating time to ${bestAlternative?.product.name || 'higher ROI products'}.`;
  } else if (opportunityCost > product.mrr * 0.1) {
    recommendation = `Moderate opportunity cost. Time allocation is acceptable but could be optimized.`;
  } else if (opportunityCost > 0) {
    recommendation = `Low opportunity cost. Time allocation is reasonable.`;
  } else {
    recommendation = `This is your highest ROI product. Continue prioritizing it.`;
  }

  return {
    productId: product.id,
    currentROI: Number(currentROI.toFixed(2)),
    potentialROI: Number(potentialROI.toFixed(2)),
    opportunityCost: Number(opportunityCost.toFixed(2)),
    recommendation
  };
}

/**
 * Optimize resource allocation across portfolio
 */
export function optimizeResourceAllocation(
  products: Product[],
  totalAvailableHours: number = 40
): {
  recommendations: Array<{
    product: string;
    currentHours: number;
    recommendedHours: number;
    change: number;
    rationale: string;
    expectedROI: number;
  }>;
  totalExpectedImpact: number;
} {
  // Calculate scores for each product
  const productScores = products.map(product => {
    // Growth potential score
    const growthScore = Math.max(0, product.mrrGrowthRate);

    // Revenue size score
    const revenueScore = product.mrr / 1000;

    // Efficiency score
    const efficiencyScore = (product.ltv / product.cac) / 5;

    // Health score (inverse of problems)
    const healthScore = (100 - product.techDebtScore - (product.churn * 5)) / 100;

    // Combined priority score
    const priorityScore = (
      growthScore * 0.35 +      // Growth potential is important
      revenueScore * 0.30 +      // Revenue size matters
      efficiencyScore * 0.20 +   // Efficiency is good
      healthScore * 0.15         // Health affects sustainability
    );

    return {
      product,
      priorityScore,
      currentROI: product.mrr / (product.supportHoursPerWeek * 4.33)
    };
  });

  // Sort by priority
  const sorted = productScores.sort((a, b) => b.priorityScore - a.priorityScore);

  // Allocate hours based on priority (with minimum thresholds)
  const currentTotalHours = products.reduce((sum, p) => sum + p.supportHoursPerWeek, 0);
  const totalPriority = sorted.reduce((sum, s) => sum + s.priorityScore, 0);

  const recommendations = sorted.map((score, index) => {
    const { product } = score;

    // Calculate recommended hours based on priority
    let recommendedHours: number;

    if (index === 0) {
      // Top product: 60-70% of time
      recommendedHours = Math.round(totalAvailableHours * 0.65);
    } else if (index === 1) {
      // Second product: 20-30% of time
      recommendedHours = Math.round(totalAvailableHours * 0.25);
    } else {
      // Other products: split remaining time
      const remainingHours = totalAvailableHours -
        (sorted[0] ? Math.round(totalAvailableHours * 0.65) : 0) -
        (sorted[1] ? Math.round(totalAvailableHours * 0.25) : 0);
      const remainingProducts = sorted.length - 2;
      recommendedHours = Math.max(2, Math.round(remainingHours / remainingProducts));
    }

    // Ensure minimum 2 hours/week for maintenance
    recommendedHours = Math.max(2, Math.min(recommendedHours, totalAvailableHours));

    const change = recommendedHours - product.supportHoursPerWeek;

    // Generate rationale
    let rationale: string;
    if (change > 5) {
      rationale = `High growth potential (${product.mrrGrowthRate}% MRR growth) justifies increased investment. Expected to accelerate growth.`;
    } else if (change > 0) {
      rationale = `Good performance metrics warrant moderate time increase to capitalize on momentum.`;
    } else if (change === 0) {
      rationale = `Current time allocation is optimal. Maintain current level of engagement.`;
    } else if (change > -5) {
      rationale = `Slight reduction allows focus on higher-priority products while maintaining quality.`;
    } else {
      if (product.mrrGrowthRate < 0) {
        rationale = `Negative growth suggests diminishing returns. Reduce to maintenance mode or consider exit.`;
      } else {
        rationale = `Stable but lower priority. Reduce time to focus on high-growth opportunities.`;
      }
    }

    // Calculate expected ROI from this allocation
    const expectedROI = (product.mrr + (product.mrr * (product.mrrGrowthRate / 100) * (recommendedHours / product.supportHoursPerWeek)));

    return {
      product: product.name,
      currentHours: product.supportHoursPerWeek,
      recommendedHours,
      change,
      rationale,
      expectedROI: Number(expectedROI.toFixed(0))
    };
  });

  const totalExpectedImpact = recommendations.reduce((sum, r) => sum + r.expectedROI, 0);

  return {
    recommendations,
    totalExpectedImpact
  };
}

/**
 * Calculate portfolio diversification metrics
 */
export function calculateDiversificationMetrics(products: Product[]): {
  herfindahlIndex: number;
  diversificationScore: number;
  effectiveNumberOfProducts: number;
  categoryDiversification: number;
  stageDiversification: number;
} {
  const totalMRR = products.reduce((sum, p) => sum + p.mrr, 0);

  // Herfindahl-Hirschman Index
  const hhi = products.reduce((sum, p) => {
    const share = p.mrr / totalMRR;
    return sum + (share * share);
  }, 0);

  // Effective number of products (reciprocal of HHI)
  const effectiveNumberOfProducts = 1 / hhi;

  // Diversification score (0-1, higher is better)
  const perfectDiversification = 1 / products.length;
  const diversificationScore = Math.max(0, 1 - ((hhi - perfectDiversification) / (1 - perfectDiversification)));

  // Category diversification
  const categories = new Set(products.map(p => p.category));
  const categoryHHI = Object.values(
    products.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + p.mrr;
      return acc;
    }, {} as Record<string, number>)
  ).reduce((sum, mrr) => {
    const share = mrr / totalMRR;
    return sum + (share * share);
  }, 0);
  const categoryDiversification = 1 - categoryHHI;

  // Stage diversification (based on age and growth)
  const stages = products.map(p => {
    const ageMonths = (Date.now() - new Date(p.launchedDate).getTime()) / (1000 * 60 * 60 * 24 * 30);
    if (ageMonths < 6 || p.mrrGrowthRate > 20) return 'early';
    if (p.mrrGrowthRate > 5) return 'growth';
    if (p.mrrGrowthRate > 0) return 'mature';
    return 'decline';
  });

  const stageHHI = Object.values(
    stages.reduce((acc, stage, idx) => {
      acc[stage] = (acc[stage] || 0) + products[idx].mrr;
      return acc;
    }, {} as Record<string, number>)
  ).reduce((sum, mrr) => {
    const share = mrr / totalMRR;
    return sum + (share * share);
  }, 0);
  const stageDiversification = 1 - stageHHI;

  return {
    herfindahlIndex: Number(hhi.toFixed(3)),
    diversificationScore: Number(diversificationScore.toFixed(3)),
    effectiveNumberOfProducts: Number(effectiveNumberOfProducts.toFixed(2)),
    categoryDiversification: Number(categoryDiversification.toFixed(3)),
    stageDiversification: Number(stageDiversification.toFixed(3))
  };
}

/**
 * Identify cross-selling opportunities
 */
export function identifyCrossSellOpportunities(products: Product[]): {
  opportunities: Array<{
    fromProduct: string;
    toProduct: string;
    potentialCustomers: number;
    estimatedRevenue: number;
    reasoning: string;
  }>;
} {
  const opportunities: Array<{
    fromProduct: string;
    toProduct: string;
    potentialCustomers: number;
    estimatedRevenue: number;
    reasoning: string;
  }> = [];

  // Check each product pair
  products.forEach(fromProduct => {
    products.forEach(toProduct => {
      if (fromProduct.id === toProduct.id) return;

      // Estimate cross-sell potential
      // Assumption: 10-20% of customers might be interested in complementary product
      const conversionRate = 0.15; // 15% conservative estimate
      const potentialCustomers = Math.floor(fromProduct.customers * conversionRate);
      const avgRevenuePerCustomer = toProduct.mrr / toProduct.customers;
      const estimatedRevenue = potentialCustomers * avgRevenuePerCustomer;

      // Only include if significant opportunity (>$500/month potential)
      if (estimatedRevenue > 500) {
        opportunities.push({
          fromProduct: fromProduct.name,
          toProduct: toProduct.name,
          potentialCustomers,
          estimatedRevenue: Number(estimatedRevenue.toFixed(0)),
          reasoning: `${fromProduct.name} users who need ${toProduct.category.toLowerCase()} functionality could benefit from ${toProduct.name}.`
        });
      }
    });
  });

  // Sort by estimated revenue
  opportunities.sort((a, b) => b.estimatedRevenue - a.estimatedRevenue);

  return { opportunities };
}

/**
 * Calculate portfolio velocity (rate of change)
 */
export function calculatePortfolioVelocity(products: Product[]): {
  overallVelocity: number;
  trendDirection: 'Accelerating' | 'Stable' | 'Decelerating';
  momentum: string;
} {
  const totalMRR = products.reduce((sum, p) => sum + p.mrr, 0);

  // Weighted velocity (growth rate weighted by MRR)
  const overallVelocity = products.reduce((sum, p) =>
    sum + (p.mrrGrowthRate * (p.mrr / totalMRR)), 0
  );

  // Determine trend
  let trendDirection: 'Accelerating' | 'Stable' | 'Decelerating';
  if (overallVelocity > 10) {
    trendDirection = 'Accelerating';
  } else if (overallVelocity > 0) {
    trendDirection = 'Stable';
  } else {
    trendDirection = 'Decelerating';
  }

  // Momentum description
  let momentum: string;
  if (overallVelocity > 15) {
    momentum = 'Strong positive momentum. Portfolio is in high growth phase.';
  } else if (overallVelocity > 5) {
    momentum = 'Moderate growth. Portfolio is expanding steadily.';
  } else if (overallVelocity > 0) {
    momentum = 'Slow growth. Consider investing in growth initiatives.';
  } else if (overallVelocity > -5) {
    momentum = 'Slight decline. Review product strategies and market fit.';
  } else {
    momentum = 'Significant decline. Urgent strategic review needed.';
  }

  return {
    overallVelocity: Number(overallVelocity.toFixed(2)),
    trendDirection,
    momentum
  };
}
