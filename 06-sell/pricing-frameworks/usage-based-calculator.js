/**
 * Usage-Based Pricing Calculator
 *
 * Interactive calculator for SaaS products with usage-based pricing.
 * Helps customers estimate their monthly costs based on usage patterns.
 *
 * Usage: Import and customize for your product's pricing model
 */

// ============================================================================
// CONFIGURATION - Customize this section for your product
// ============================================================================

const pricingConfig = {
  product: 'Your SaaS Product',

  // Base subscription tiers (optional - remove if pure usage-based)
  tiers: [
    {
      name: 'Hobby',
      basePrice: 0,
      included: {
        requests: 100000,
        bandwidth: 1, // GB
        storage: 1 // GB
      }
    },
    {
      name: 'Pro',
      basePrice: 20,
      included: {
        requests: 10000000,
        bandwidth: 100,
        storage: 50
      },
      popular: true
    },
    {
      name: 'Enterprise',
      basePrice: 500,
      included: {
        requests: 100000000,
        bandwidth: 1000,
        storage: 500
      }
    }
  ],

  // Usage-based pricing (what customers pay beyond included amounts)
  usagePricing: {
    requests: {
      unit: 'per 1M requests',
      price: 2, // $2 per 1M requests
      displayMultiplier: 1000000
    },
    bandwidth: {
      unit: 'per GB',
      price: 0.10,
      displayMultiplier: 1
    },
    storage: {
      unit: 'per GB/month',
      price: 0.20,
      displayMultiplier: 1
    }
  },

  // Volume discounts (optional)
  volumeDiscounts: {
    requests: [
      { threshold: 100000000, discount: 0.10 }, // 10% off above 100M
      { threshold: 1000000000, discount: 0.25 } // 25% off above 1B
    ]
  }
}

// ============================================================================
// CALCULATOR LOGIC
// ============================================================================

class UsagePricingCalculator {
  constructor(config) {
    this.config = config
  }

  /**
   * Calculate total cost for given usage
   * @param {Object} usage - User's expected usage
   * @param {string} tierName - Selected tier (optional)
   * @returns {Object} Cost breakdown
   */
  calculateCost(usage, tierName = null) {
    const tier = tierName ?
      this.config.tiers.find(t => t.name === tierName) :
      this.config.tiers[0]

    let baseCost = tier ? tier.basePrice : 0
    let overageCosts = {}
    let totalOverage = 0

    // Calculate overage for each metric
    for (const [metric, amount] of Object.entries(usage)) {
      const included = tier?.included?.[metric] || 0
      const overage = Math.max(0, amount - included)

      if (overage > 0 && this.config.usagePricing[metric]) {
        const pricing = this.config.usagePricing[metric]
        const units = overage / pricing.displayMultiplier
        let cost = units * pricing.price

        // Apply volume discounts
        if (this.config.volumeDiscounts?.[metric]) {
          cost = this.applyVolumeDiscount(cost, overage, metric)
        }

        overageCosts[metric] = {
          amount: overage,
          cost: cost,
          unit: pricing.unit
        }
        totalOverage += cost
      }
    }

    return {
      tier: tier?.name || 'Custom',
      baseCost,
      overageCosts,
      totalOverage,
      totalCost: baseCost + totalOverage,
      breakdown: this.generateBreakdown(baseCost, overageCosts, totalOverage)
    }
  }

  /**
   * Apply volume discounts to usage cost
   */
  applyVolumeDiscount(cost, usage, metric) {
    const discounts = this.config.volumeDiscounts[metric] || []

    for (const { threshold, discount } of discounts.sort((a, b) => b.threshold - a.threshold)) {
      if (usage >= threshold) {
        return cost * (1 - discount)
      }
    }

    return cost
  }

  /**
   * Find optimal tier for given usage
   */
  findOptimalTier(usage) {
    let bestOption = null
    let lowestCost = Infinity

    for (const tier of this.config.tiers) {
      const result = this.calculateCost(usage, tier.name)

      if (result.totalCost < lowestCost) {
        lowestCost = result.totalCost
        bestOption = {
          tier: tier.name,
          cost: result.totalCost,
          breakdown: result
        }
      }
    }

    return bestOption
  }

  /**
   * Generate human-readable breakdown
   */
  generateBreakdown(baseCost, overageCosts, totalOverage) {
    const lines = []

    if (baseCost > 0) {
      lines.push(`Base subscription: $${baseCost.toFixed(2)}`)
    }

    for (const [metric, data] of Object.entries(overageCosts)) {
      const formatted = this.formatNumber(data.amount)
      lines.push(`${metric} overage (${formatted} ${data.unit}): $${data.cost.toFixed(2)}`)
    }

    if (totalOverage > 0) {
      lines.push(`Total overage: $${totalOverage.toFixed(2)}`)
    }

    return lines.join('\n')
  }

  /**
   * Format large numbers for display
   */
  formatNumber(num) {
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  /**
   * Generate comparison table
   */
  compareAllTiers(usage) {
    const comparison = []

    for (const tier of this.config.tiers) {
      const result = this.calculateCost(usage, tier.name)
      comparison.push({
        tier: tier.name,
        baseCost: result.baseCost,
        overageCost: result.totalOverage,
        totalCost: result.totalCost,
        popular: tier.popular || false
      })
    }

    return comparison.sort((a, b) => a.totalCost - b.totalCost)
  }
}

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

// Initialize calculator
const calculator = new UsagePricingCalculator(pricingConfig)

// Example 1: Calculate cost for specific usage
const usage1 = {
  requests: 50000000,    // 50M requests
  bandwidth: 200,        // 200 GB
  storage: 100          // 100 GB
}

console.log('Example 1: Specific tier calculation')
console.log('=====================================')
const result1 = calculator.calculateCost(usage1, 'Pro')
console.log(`Tier: ${result1.tier}`)
console.log(`Total Cost: $${result1.totalCost.toFixed(2)}/month`)
console.log('\nBreakdown:')
console.log(result1.breakdown)
console.log('\n')

// Example 2: Find optimal tier
console.log('Example 2: Find optimal tier')
console.log('============================')
const optimal = calculator.findOptimalTier(usage1)
console.log(`Best tier: ${optimal.tier}`)
console.log(`Cost: $${optimal.cost.toFixed(2)}/month`)
console.log('\n')

// Example 3: Compare all tiers
console.log('Example 3: Compare all tiers')
console.log('============================')
const comparison = calculator.compareAllTiers(usage1)
comparison.forEach(item => {
  const popular = item.popular ? ' ⭐ RECOMMENDED' : ''
  console.log(`${item.tier}: $${item.totalCost.toFixed(2)}/month${popular}`)
  console.log(`  Base: $${item.baseCost.toFixed(2)} + Overage: $${item.overageCost.toFixed(2)}`)
})

// ============================================================================
// REACT COMPONENT EXAMPLE
// ============================================================================

/**
 * Interactive pricing calculator React component
 *
 * Usage:
 * import { PricingCalculator } from './usage-based-calculator'
 * <PricingCalculator config={pricingConfig} />
 */

const PricingCalculatorReact = `
import React, { useState, useEffect } from 'react'
import { UsagePricingCalculator } from './usage-based-calculator'

export function PricingCalculator({ config }) {
  const [usage, setUsage] = useState({
    requests: 1000000,
    bandwidth: 10,
    storage: 10
  })
  const [selectedTier, setSelectedTier] = useState(config.tiers[1]?.name)
  const [result, setResult] = useState(null)

  const calculator = new UsagePricingCalculator(config)

  useEffect(() => {
    const calc = calculator.calculateCost(usage, selectedTier)
    setResult(calc)
  }, [usage, selectedTier])

  const updateUsage = (metric, value) => {
    setUsage(prev => ({ ...prev, [metric]: parseFloat(value) || 0 }))
  }

  return (
    <div className="pricing-calculator">
      <h2>Estimate Your Costs</h2>

      {/* Tier Selection */}
      <div className="tier-selector">
        {config.tiers.map(tier => (
          <button
            key={tier.name}
            onClick={() => setSelectedTier(tier.name)}
            className={selectedTier === tier.name ? 'active' : ''}
          >
            {tier.name}
            {tier.popular && <span className="badge">Popular</span>}
          </button>
        ))}
      </div>

      {/* Usage Inputs */}
      <div className="usage-inputs">
        <h3>Expected Monthly Usage</h3>

        <div className="input-group">
          <label>Requests</label>
          <input
            type="number"
            value={usage.requests}
            onChange={(e) => updateUsage('requests', e.target.value)}
          />
          <span className="help">requests per month</span>
        </div>

        <div className="input-group">
          <label>Bandwidth</label>
          <input
            type="number"
            value={usage.bandwidth}
            onChange={(e) => updateUsage('bandwidth', e.target.value)}
          />
          <span className="help">GB per month</span>
        </div>

        <div className="input-group">
          <label>Storage</label>
          <input
            type="number"
            value={usage.storage}
            onChange={(e) => updateUsage('storage', e.target.value)}
          />
          <span className="help">GB total</span>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="results">
          <div className="total-cost">
            <h3>Estimated Cost</h3>
            <div className="price">
              <span className="currency">$</span>
              <span className="amount">{result.totalCost.toFixed(2)}</span>
              <span className="period">/month</span>
            </div>
          </div>

          <div className="breakdown">
            <h4>Cost Breakdown</h4>
            <ul>
              <li>
                <span>Base ({result.tier} plan)</span>
                <span>\${result.baseCost.toFixed(2)}</span>
              </li>
              {Object.entries(result.overageCosts).map(([metric, data]) => (
                <li key={metric}>
                  <span>{metric} overage</span>
                  <span>\${data.cost.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recommendations */}
          {(() => {
            const optimal = calculator.findOptimalTier(usage)
            if (optimal.tier !== selectedTier) {
              return (
                <div className="recommendation">
                  💡 You could save \${(result.totalCost - optimal.cost).toFixed(2)}/month
                  by switching to {optimal.tier}
                </div>
              )
            }
          })()}
        </div>
      )}
    </div>
  )
}
`

// ============================================================================
// HTML/VANILLA JS EXAMPLE
// ============================================================================

const htmlExample = `
<!DOCTYPE html>
<html>
<head>
  <title>Pricing Calculator</title>
  <style>
    .calculator {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      font-family: system-ui, -apple-system, sans-serif;
    }

    .tier-buttons {
      display: flex;
      gap: 10px;
      margin-bottom: 30px;
    }

    .tier-button {
      flex: 1;
      padding: 15px;
      border: 2px solid #e0e0e0;
      background: white;
      cursor: pointer;
      border-radius: 8px;
      transition: all 0.2s;
    }

    .tier-button.active {
      border-color: #0066ff;
      background: #f0f7ff;
    }

    .input-group {
      margin-bottom: 20px;
    }

    .input-group label {
      display: block;
      font-weight: 600;
      margin-bottom: 5px;
    }

    .input-group input {
      width: 100%;
      padding: 10px;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      font-size: 16px;
    }

    .results {
      margin-top: 30px;
      padding: 20px;
      background: #f9f9f9;
      border-radius: 8px;
    }

    .total-cost {
      font-size: 32px;
      font-weight: bold;
      color: #0066ff;
      margin-bottom: 20px;
    }

    .breakdown {
      font-size: 14px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="calculator">
    <h1>Calculate Your Monthly Cost</h1>

    <div class="tier-buttons">
      <button class="tier-button active" data-tier="Hobby">
        Hobby<br>$0/mo
      </button>
      <button class="tier-button" data-tier="Pro">
        Pro<br>$20/mo
      </button>
      <button class="tier-button" data-tier="Enterprise">
        Enterprise<br>$500/mo
      </button>
    </div>

    <div class="input-group">
      <label>Monthly Requests</label>
      <input type="number" id="requests" value="1000000">
    </div>

    <div class="input-group">
      <label>Bandwidth (GB)</label>
      <input type="number" id="bandwidth" value="10">
    </div>

    <div class="input-group">
      <label>Storage (GB)</label>
      <input type="number" id="storage" value="10">
    </div>

    <div class="results">
      <div class="total-cost" id="totalCost">$0.00/month</div>
      <div class="breakdown" id="breakdown"></div>
    </div>
  </div>

  <script src="usage-based-calculator.js"></script>
  <script>
    const calculator = new UsagePricingCalculator(pricingConfig)
    let selectedTier = 'Hobby'

    function updateCalculation() {
      const usage = {
        requests: parseInt(document.getElementById('requests').value) || 0,
        bandwidth: parseInt(document.getElementById('bandwidth').value) || 0,
        storage: parseInt(document.getElementById('storage').value) || 0
      }

      const result = calculator.calculateCost(usage, selectedTier)

      document.getElementById('totalCost').textContent =
        \`$\${result.totalCost.toFixed(2)}/month\`

      document.getElementById('breakdown').innerHTML =
        result.breakdown.replace(/\\n/g, '<br>')
    }

    // Tier selection
    document.querySelectorAll('.tier-button').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.tier-button').forEach(b =>
          b.classList.remove('active'))
        e.target.classList.add('active')
        selectedTier = e.target.dataset.tier
        updateCalculation()
      })
    })

    // Input changes
    document.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', updateCalculation)
    })

    // Initial calculation
    updateCalculation()
  </script>
</body>
</html>
`

// ============================================================================
// EXPORTS
// ============================================================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    UsagePricingCalculator,
    pricingConfig,
    PricingCalculatorReact,
    htmlExample
  }
}

// ============================================================================
// CUSTOMIZATION GUIDE
// ============================================================================

/*

CUSTOMIZATION GUIDE
===================

1. Update pricingConfig at the top of this file
   - Set your product name
   - Define your tiers and base prices
   - Set your usage pricing (per unit costs)
   - Add volume discounts if applicable

2. Usage Metrics
   - Add/remove metrics based on your product
   - Common metrics: requests, bandwidth, storage, users, compute hours
   - Set appropriate display multipliers (1M, 1K, etc)

3. Integration Options

   a) Node.js/Express:
   ```
   const { UsagePricingCalculator } = require('./usage-based-calculator')

   app.post('/api/calculate-pricing', (req, res) => {
     const calculator = new UsagePricingCalculator(pricingConfig)
     const result = calculator.calculateCost(req.body.usage, req.body.tier)
     res.json(result)
   })
   ```

   b) Next.js API Route:
   ```
   import { UsagePricingCalculator, pricingConfig } from '@/lib/pricing'

   export default function handler(req, res) {
     const calculator = new UsagePricingCalculator(pricingConfig)
     const result = calculator.calculateCost(req.body.usage, req.body.tier)
     res.json(result)
   }
   ```

   c) Client-side only:
   - Copy the calculator class
   - Import in your component
   - Calculate in real-time as users adjust sliders

4. Advanced Features to Add
   - Slider inputs instead of text fields
   - Visual charts showing cost breakdown
   - Year-over-year cost projections
   - Comparison with competitors
   - Export estimate as PDF
   - Save/share calculator results

5. Analytics to Track
   - What usage levels do users enter?
   - Which tier do they select most?
   - Do they adjust usage after seeing price?
   - Conversion rate after using calculator

*/
