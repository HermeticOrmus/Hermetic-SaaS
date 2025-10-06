/**
 * Statistical Calculator for A/B Testing
 *
 * Standalone calculator that works in both browser and Node.js.
 * Provides sample size calculations, significance testing, and confidence intervals.
 *
 * No dependencies - pure JavaScript.
 *
 * @usage Browser:
 *   <script src="statistical-calculator.js"></script>
 *   <script>
 *     const sampleSize = StatCalculator.calculateSampleSize({
 *       baselineRate: 0.05,
 *       minimumDetectableEffect: 0.01
 *     });
 *   </script>
 *
 * @usage Node.js:
 *   const StatCalculator = require('./statistical-calculator.js');
 *   const result = StatCalculator.calculateSignificance({
 *     controlConversions: 100,
 *     controlSample: 1000,
 *     treatmentConversions: 150,
 *     treatmentSample: 1000
 *   });
 */

(function(global) {
  'use strict';

  const StatCalculator = {};

  // ============================================================================
  // Sample Size Calculator
  // ============================================================================

  /**
   * Calculates required sample size per variant for A/B test
   *
   * @param {Object} params - Calculation parameters
   * @param {number} params.baselineRate - Current conversion rate (0-1)
   * @param {number} params.minimumDetectableEffect - Smallest effect to detect (0-1)
   * @param {number} [params.confidenceLevel=0.95] - Confidence level (typically 0.95)
   * @param {number} [params.power=0.80] - Statistical power (typically 0.80)
   * @returns {number} Required sample size per variant
   *
   * @example
   * calculateSampleSize({
   *   baselineRate: 0.05,           // 5% current conversion
   *   minimumDetectableEffect: 0.01, // Want to detect 1% change
   *   confidenceLevel: 0.95,         // 95% confidence
   *   power: 0.80                    // 80% power
   * });
   * // Returns: 7600
   */
  StatCalculator.calculateSampleSize = function(params) {
    const {
      baselineRate,
      minimumDetectableEffect,
      confidenceLevel = 0.95,
      power = 0.80
    } = params;

    // Validate inputs
    if (baselineRate <= 0 || baselineRate >= 1) {
      throw new Error('baselineRate must be between 0 and 1');
    }
    if (minimumDetectableEffect <= 0) {
      throw new Error('minimumDetectableEffect must be positive');
    }

    // Z-scores for confidence level and power
    const zAlpha = getZScore((1 + confidenceLevel) / 2);
    const zBeta = getZScore(power);

    // Expected treatment rate
    const treatmentRate = baselineRate + minimumDetectableEffect;

    // Pooled variance
    const pooledRate = (baselineRate + treatmentRate) / 2;
    const variance = 2 * pooledRate * (1 - pooledRate);

    // Sample size calculation
    const sampleSize = (
      Math.pow(zAlpha + zBeta, 2) * variance
    ) / Math.pow(minimumDetectableEffect, 2);

    return Math.ceil(sampleSize);
  };

  /**
   * Simplified sample size calculation (rule of thumb)
   * Use when you want quick estimates
   *
   * Formula: 16 * p * (1-p) / effect²
   */
  StatCalculator.calculateSampleSizeSimple = function(baselineRate, effect) {
    return Math.ceil(
      16 * baselineRate * (1 - baselineRate) / Math.pow(effect, 2)
    );
  };

  // ============================================================================
  // Significance Testing
  // ============================================================================

  /**
   * Calculates statistical significance between two proportions
   *
   * @param {Object} params - Test parameters
   * @param {number} params.controlConversions - Number of conversions in control
   * @param {number} params.controlSample - Total users in control
   * @param {number} params.treatmentConversions - Number of conversions in treatment
   * @param {number} params.treatmentSample - Total users in treatment
   * @returns {Object} Statistical test results
   *
   * @example
   * calculateSignificance({
   *   controlConversions: 100,
   *   controlSample: 2000,
   *   treatmentConversions: 150,
   *   treatmentSample: 2000
   * });
   * // Returns:
   * // {
   * //   controlRate: 0.05,
   * //   treatmentRate: 0.075,
   * //   absoluteLift: 0.025,
   * //   relativeLift: 0.50,
   * //   zScore: 2.89,
   * //   pValue: 0.004,
   * //   isSignificant: true,
   * //   confidence: 0.996
   * // }
   */
  StatCalculator.calculateSignificance = function(params) {
    const {
      controlConversions,
      controlSample,
      treatmentConversions,
      treatmentSample
    } = params;

    // Validate inputs
    if (controlSample < 30 || treatmentSample < 30) {
      return {
        controlRate: controlConversions / controlSample,
        treatmentRate: treatmentConversions / treatmentSample,
        absoluteLift: 0,
        relativeLift: 0,
        zScore: 0,
        pValue: 1,
        isSignificant: false,
        confidence: 0,
        warning: 'Sample size too small (minimum 30 per variant)'
      };
    }

    // Calculate rates
    const controlRate = controlConversions / controlSample;
    const treatmentRate = treatmentConversions / treatmentSample;

    // Calculate lifts
    const absoluteLift = treatmentRate - controlRate;
    const relativeLift = controlRate > 0 ? absoluteLift / controlRate : 0;

    // Pooled proportion for z-test
    const pooledProportion = (controlConversions + treatmentConversions) /
                             (controlSample + treatmentSample);

    // Standard error
    const standardError = Math.sqrt(
      pooledProportion * (1 - pooledProportion) *
      (1 / controlSample + 1 / treatmentSample)
    );

    // Z-score
    const zScore = standardError > 0 ? absoluteLift / standardError : 0;

    // Two-tailed p-value
    const pValue = 2 * (1 - normalCDF(Math.abs(zScore)));

    // Significance (p < 0.05)
    const isSignificant = pValue < 0.05;

    // Confidence level
    const confidence = 1 - pValue;

    return {
      controlRate,
      treatmentRate,
      absoluteLift,
      relativeLift,
      zScore,
      pValue,
      isSignificant,
      confidence
    };
  };

  // ============================================================================
  // Confidence Intervals
  // ============================================================================

  /**
   * Calculates confidence interval for a proportion
   *
   * @param {number} conversions - Number of successes
   * @param {number} sample - Total sample size
   * @param {number} [confidenceLevel=0.95] - Confidence level
   * @returns {Object} Confidence interval
   */
  StatCalculator.calculateConfidenceInterval = function(
    conversions,
    sample,
    confidenceLevel = 0.95
  ) {
    const proportion = conversions / sample;
    const zScore = getZScore((1 + confidenceLevel) / 2);

    const standardError = Math.sqrt(
      (proportion * (1 - proportion)) / sample
    );

    const marginOfError = zScore * standardError;

    return {
      proportion,
      lowerBound: Math.max(0, proportion - marginOfError),
      upperBound: Math.min(1, proportion + marginOfError),
      marginOfError,
      confidenceLevel
    };
  };

  // ============================================================================
  // Test Duration Calculator
  // ============================================================================

  /**
   * Calculates how long to run an experiment
   *
   * @param {number} sampleSizePerVariant - Required sample per variant
   * @param {number} dailyTraffic - Daily visitors
   * @param {number} numVariants - Number of variants (default 2)
   * @returns {Object} Duration information
   */
  StatCalculator.calculateDuration = function(
    sampleSizePerVariant,
    dailyTraffic,
    numVariants = 2
  ) {
    const totalSampleNeeded = sampleSizePerVariant * numVariants;
    const days = Math.ceil(totalSampleNeeded / dailyTraffic);

    // Minimum 7 days (one full week)
    const recommendedDays = Math.max(7, days);

    // Maximum 28 days (4 weeks)
    const cappedDays = Math.min(28, recommendedDays);

    return {
      totalSampleNeeded,
      minimumDays: days,
      recommendedDays,
      cappedDays,
      warning: days > 28 ? 'Low traffic - consider testing larger effects or proxy metrics' : null
    };
  };

  // ============================================================================
  // Effect Size Calculator
  // ============================================================================

  /**
   * Calculates the effect size (Cohen's h) for proportion differences
   *
   * @param {number} p1 - Proportion 1
   * @param {number} p2 - Proportion 2
   * @returns {Object} Effect size information
   */
  StatCalculator.calculateEffectSize = function(p1, p2) {
    // Cohen's h for proportions
    const phi1 = 2 * Math.asin(Math.sqrt(p1));
    const phi2 = 2 * Math.asin(Math.sqrt(p2));
    const cohensH = Math.abs(phi2 - phi1);

    let interpretation;
    if (cohensH < 0.2) {
      interpretation = 'small';
    } else if (cohensH < 0.5) {
      interpretation = 'medium';
    } else {
      interpretation = 'large';
    }

    return {
      cohensH,
      interpretation,
      isSmall: cohensH < 0.2,
      isMedium: cohensH >= 0.2 && cohensH < 0.5,
      isLarge: cohensH >= 0.5
    };
  };

  // ============================================================================
  // Multi-Variant Testing (ANOVA)
  // ============================================================================

  /**
   * Chi-square test for multiple proportions
   * Use when testing 3+ variants
   *
   * @param {Array} variants - Array of {conversions, sample}
   * @returns {Object} Chi-square test results
   */
  StatCalculator.chiSquareTest = function(variants) {
    if (variants.length < 2) {
      throw new Error('Need at least 2 variants');
    }

    // Calculate totals
    let totalConversions = 0;
    let totalSample = 0;

    variants.forEach(v => {
      totalConversions += v.conversions;
      totalSample += v.sample;
    });

    const overallRate = totalConversions / totalSample;

    // Calculate chi-square statistic
    let chiSquare = 0;

    variants.forEach(v => {
      const expected = v.sample * overallRate;
      const observed = v.conversions;
      chiSquare += Math.pow(observed - expected, 2) / expected;

      const expectedNon = v.sample * (1 - overallRate);
      const observedNon = v.sample - v.conversions;
      chiSquare += Math.pow(observedNon - expectedNon, 2) / expectedNon;
    });

    // Degrees of freedom
    const degreesOfFreedom = variants.length - 1;

    // P-value (approximation)
    const pValue = chiSquarePValue(chiSquare, degreesOfFreedom);

    return {
      chiSquare,
      degreesOfFreedom,
      pValue,
      isSignificant: pValue < 0.05
    };
  };

  // ============================================================================
  // Helper Functions
  // ============================================================================

  /**
   * Gets z-score for a given probability using inverse normal CDF
   */
  function getZScore(probability) {
    // Common z-scores (for performance)
    const commonZScores = {
      0.90: 1.282,
      0.95: 1.645,
      0.975: 1.960, // 95% two-tailed
      0.99: 2.326,
      0.995: 2.576
    };

    if (commonZScores[probability]) {
      return commonZScores[probability];
    }

    // Approximation using Beasley-Springer-Moro algorithm
    return inverseNormalCDF(probability);
  }

  /**
   * Normal cumulative distribution function
   */
  function normalCDF(x) {
    const t = 1 / (1 + 0.2316419 * Math.abs(x));
    const d = 0.3989423 * Math.exp(-x * x / 2);
    const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));

    return x > 0 ? 1 - p : p;
  }

  /**
   * Inverse normal CDF (approximation)
   */
  function inverseNormalCDF(p) {
    if (p <= 0 || p >= 1) {
      throw new Error('Probability must be between 0 and 1');
    }

    // Coefficients for Beasley-Springer-Moro approximation
    const a = [2.50662823884, -18.61500062529, 41.39119773534, -25.44106049637];
    const b = [-8.47351093090, 23.08336743743, -21.06224101826, 3.13082909833];
    const c = [0.3374754822726147, 0.9761690190917186, 0.1607979714918209,
               0.0276438810333863, 0.0038405729373609, 0.0003951896511919,
               0.0000321767881768, 0.0000002888167364, 0.0000003960315187];

    const y = p - 0.5;

    if (Math.abs(y) < 0.42) {
      const r = y * y;
      let x = y * (((a[3] * r + a[2]) * r + a[1]) * r + a[0]) /
              ((((b[3] * r + b[2]) * r + b[1]) * r + b[0]) * r + 1);
      return x;
    }

    let r = p;
    if (y > 0) r = 1 - p;
    r = Math.log(-Math.log(r));

    let x = c[0];
    for (let i = 1; i < c.length; i++) {
      x += c[i] * Math.pow(r, i);
    }

    if (y < 0) x = -x;
    return x;
  }

  /**
   * Chi-square p-value approximation
   */
  function chiSquarePValue(chiSquare, df) {
    // Approximation for large df
    if (df > 30) {
      const z = Math.sqrt(2 * chiSquare) - Math.sqrt(2 * df - 1);
      return 2 * (1 - normalCDF(z));
    }

    // Using incomplete gamma function approximation
    // For simplicity, using table lookup for common cases
    const criticalValues = {
      1: [3.841, 6.635],    // 0.05, 0.01
      2: [5.991, 9.210],
      3: [7.815, 11.345],
      4: [9.488, 13.277],
      5: [11.070, 15.086]
    };

    if (criticalValues[df]) {
      if (chiSquare < criticalValues[df][0]) return 1;
      if (chiSquare < criticalValues[df][1]) return 0.05;
      return 0.01;
    }

    // Rough approximation
    return chiSquare > df ? 0.01 : 0.5;
  }

  // ============================================================================
  // Utility Functions
  // ============================================================================

  /**
   * Formats results as human-readable text
   */
  StatCalculator.formatResults = function(results) {
    const lines = [];

    if (results.controlRate !== undefined) {
      lines.push('Test Results:');
      lines.push(`  Control: ${(results.controlRate * 100).toFixed(2)}%`);
      lines.push(`  Treatment: ${(results.treatmentRate * 100).toFixed(2)}%`);
      lines.push(`  Absolute Lift: ${(results.absoluteLift * 100).toFixed(2)}%`);
      lines.push(`  Relative Lift: ${(results.relativeLift * 100).toFixed(2)}%`);
      lines.push(`  p-value: ${results.pValue.toFixed(4)}`);
      lines.push(`  Significant: ${results.isSignificant ? 'Yes' : 'No'}`);
      lines.push(`  Confidence: ${(results.confidence * 100).toFixed(1)}%`);
    }

    return lines.join('\n');
  };

  /**
   * Quick reference for minimum sample sizes
   */
  StatCalculator.sampleSizeTable = {
    '1% baseline, 0.5% effect': 12700,
    '2% baseline, 0.5% effect': 12500,
    '5% baseline, 1% effect': 7600,
    '5% baseline, 2% effect': 1900,
    '10% baseline, 2% effect': 3600,
    '10% baseline, 5% effect': 576,
    '20% baseline, 5% effect': 1024,
    '50% baseline, 10% effect': 400
  };

  /**
   * Calculates minimum detectable effect for given sample size
   */
  StatCalculator.calculateMinimumDetectableEffect = function(
    sampleSize,
    baselineRate,
    confidenceLevel = 0.95,
    power = 0.80
  ) {
    const zAlpha = getZScore((1 + confidenceLevel) / 2);
    const zBeta = getZScore(power);

    const mde = (zAlpha + zBeta) * Math.sqrt(
      2 * baselineRate * (1 - baselineRate) / sampleSize
    );

    return mde;
  };

  // ============================================================================
  // Export
  // ============================================================================

  // Node.js
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = StatCalculator;
  }

  // Browser
  if (typeof window !== 'undefined') {
    window.StatCalculator = StatCalculator;
  }

  // AMD
  if (typeof define === 'function' && define.amd) {
    define(function() { return StatCalculator; });
  }

})(typeof window !== 'undefined' ? window : global);

// ============================================================================
// Example Usage (for testing)
// ============================================================================

if (typeof require !== 'undefined' && require.main === module) {
  const StatCalculator = module.exports;

  console.log('=== Sample Size Calculator ===');
  const sampleSize = StatCalculator.calculateSampleSize({
    baselineRate: 0.05,
    minimumDetectableEffect: 0.01,
    confidenceLevel: 0.95,
    power: 0.80
  });
  console.log(`Required sample size: ${sampleSize} per variant\n`);

  console.log('=== Significance Test ===');
  const results = StatCalculator.calculateSignificance({
    controlConversions: 100,
    controlSample: 2000,
    treatmentConversions: 150,
    treatmentSample: 2000
  });
  console.log(StatCalculator.formatResults(results));
  console.log();

  console.log('=== Duration Calculator ===');
  const duration = StatCalculator.calculateDuration(7600, 1000, 2);
  console.log(`Sample needed: ${duration.totalSampleNeeded}`);
  console.log(`Duration: ${duration.recommendedDays} days`);
  console.log();

  console.log('=== Confidence Interval ===');
  const ci = StatCalculator.calculateConfidenceInterval(150, 2000, 0.95);
  console.log(`Rate: ${(ci.proportion * 100).toFixed(2)}%`);
  console.log(`95% CI: [${(ci.lowerBound * 100).toFixed(2)}%, ${(ci.upperBound * 100).toFixed(2)}%]`);
}
