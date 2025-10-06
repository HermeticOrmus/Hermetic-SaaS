# Portfolio Management & Analytics

A comprehensive system for managing, monitoring, and optimizing a portfolio of MicroSaaS products. This module enables data-driven decisions about resource allocation, investment priorities, and strategic exits.

## Why Manage MicroSaaS as a Portfolio

### The Portfolio Approach

**Single Product vs Portfolio:**
- **Single Focus**: Deep expertise, simpler operations, higher concentration risk
- **Portfolio**: Diversified risk, multiple revenue streams, higher operational complexity

**Benefits of Portfolio Management:**
1. **Revenue Diversification** - Reduce dependency on any single product
2. **Risk Mitigation** - Market changes affect products differently
3. **Cross-Selling Opportunities** - Leverage customer base across products
4. **Economies of Scale** - Shared infrastructure, code, and knowledge
5. **Learning Acceleration** - Insights from one product improve others
6. **Exit Optionality** - Sell individual products while maintaining others

**When Portfolio Makes Sense:**
- First product is profitable and sustainable (>$5K MRR)
- Operations are systematized (not firefighting)
- You have validated processes for customer acquisition
- Market opportunities exist in adjacent spaces
- You enjoy building more than optimizing

## Key Metrics to Track Across Products

### Product-Level Metrics

**Revenue Metrics:**
```
MRR (Monthly Recurring Revenue)
- Current MRR
- MRR growth rate (month-over-month)
- MRR per customer
- Revenue concentration (top 10 customers)

ARR (Annual Recurring Revenue)
- ARR = MRR × 12
- ARR growth rate (year-over-year)
```

**Customer Metrics:**
```
Total Customers
- Active customers
- New customers (monthly)
- Churned customers (monthly)
- Customer growth rate

Churn Rate
- Customer churn: (lost customers / total customers) × 100
- Revenue churn: (lost MRR / total MRR) × 100
- Net revenue retention (includes upgrades)
```

**Efficiency Metrics:**
```
CAC (Customer Acquisition Cost)
- Total marketing + sales spend / new customers

LTV (Lifetime Value)
- Average revenue per customer / churn rate
- Or: ARPU × average customer lifespan

LTV:CAC Ratio
- Target: > 3:1
- Warning: < 2:1
```

**Operational Metrics:**
```
Support Load
- Tickets per customer per month
- Average resolution time
- Support cost per customer

Technical Health
- Uptime percentage
- Error rates
- Tech debt score (estimated)
- Time spent on maintenance vs features
```

### Portfolio-Level Metrics

**Aggregate Financial:**
```
Total Portfolio MRR
- Sum of all product MRRs
- Weighted growth rate
- Portfolio-level profitability

Revenue Concentration
- Herfindahl Index: Σ(product_revenue_share²)
- 1.0 = all revenue from one product (high risk)
- 0.2 = evenly distributed across 5 products (low risk)
- Target: < 0.5
```

**Resource Allocation:**
```
Time Distribution
- Hours per product per week
- ROI per hour spent
- Opportunity cost analysis

Capital Allocation
- Marketing spend per product
- Infrastructure costs
- Expected ROI on investments
```

**Portfolio Health:**
```
Diversification Score (0-100)
- Based on revenue distribution
- Market correlation
- Customer overlap

Overall Portfolio Health (0-100)
- Weighted average of product health scores
- Adjusted for concentration risk
```

## Decision Frameworks

### The Four Strategies Matrix

```
                    High Growth Potential
                            |
                    INVEST  |  MAINTAIN
                            |
    Low MRR  ---------------+--------------- High MRR
                            |
                   DECIDE   |  OPTIMIZE
                            |
                    Low Growth Potential
```

**1. INVEST (Low MRR, High Growth)**
- Product shows strong growth trajectory
- Market opportunity is significant
- Product-market fit is improving
- **Action**: Increase time and marketing spend
- **Timeline**: 6-12 months to reach Optimize quadrant

**2. OPTIMIZE (High MRR, High Growth)**
- Product is successful and growing
- Strong product-market fit
- Market still expanding
- **Action**: Scale operations, hire help, maximize growth
- **Timeline**: Ride the wave as long as possible

**3. MAINTAIN (High MRR, Low Growth)**
- Product generates good revenue
- Market is mature or saturated
- Defensive position needed
- **Action**: Minimize time investment, maintain quality
- **Timeline**: Harvest cash flow, watch for decline

**4. DECIDE (Low MRR, Low Growth)**
- Product isn't growing
- Revenue doesn't justify time
- Opportunity cost is high
- **Action**: Pivot, sell, or shut down
- **Timeline**: Decision within 3 months

### Decision Framework: Invest vs Exit

**When to INVEST More:**
- [ ] MRR growth > 10% month-over-month for 3+ months
- [ ] Churn rate < 5% monthly
- [ ] LTV:CAC ratio > 3:1
- [ ] Clear path to $10K+ MRR
- [ ] You still find the product exciting
- [ ] Customer feedback is positive
- [ ] Market is growing or underserved

**When to MAINTAIN (Autopilot):**
- [ ] MRR > $5K but growth < 5% monthly
- [ ] Product is profitable and stable
- [ ] Support load is manageable (< 5 hours/week)
- [ ] Technical infrastructure is solid
- [ ] Churn is low and predictable
- [ ] No major competitors emerging

**When to SELL:**
- [ ] MRR > $3K (makes product attractive to buyers)
- [ ] Product is profitable (EBITDA positive)
- [ ] Clean code and documentation
- [ ] Growth has plateaued but product is stable
- [ ] You've lost interest or motivation
- [ ] Better opportunities exist
- [ ] Valuation is favorable (4-5x ARR)

**When to SHUT DOWN:**
- [ ] MRR < $1K for 6+ months
- [ ] High churn (> 10% monthly)
- [ ] Unsustainable support load
- [ ] Mounting technical debt
- [ ] Market is declining
- [ ] Product won't sell (tried for 3+ months)
- [ ] Opportunity cost is too high

### Opportunity Cost Analysis

**Formula:**
```
Opportunity Cost = (Potential Revenue from Alternative - Current Revenue) × Probability
```

**Example:**
```
Current Product A:
- Generates $2K MRR
- Requires 20 hours/week
- ROI: $100/hour

Potential Product B:
- Could generate $5K MRR (70% confidence)
- Would require 20 hours/week
- Expected ROI: $175/hour

Opportunity Cost of keeping Product A:
- ($5K × 0.7 - $2K) = $1,500/month
- Decision: Consider selling Product A and building Product B
```

## Portfolio Diversification Strategies

### 1. Market Diversification

**Serve Different Markets:**
```
Example Portfolio:
- Product A: E-commerce tools (Shopify apps)
- Product B: Content creators (Notion templates)
- Product C: Developers (API monitoring)

Benefit: Market downturns affect products differently
Risk: Less deep expertise in any one market
```

### 2. Customer Size Diversification

**Mix Customer Segments:**
```
- Product A: SMBs ($29-99/month)
- Product B: Enterprise ($500-2000/month)
- Product C: Prosumers ($9-19/month)

Benefit: Different economic sensitivities
Risk: Different support needs and expectations
```

### 3. Revenue Model Diversification

**Multiple Monetization Types:**
```
- Subscription MRR (recurring, predictable)
- One-time sales (spiky, but no churn)
- Usage-based (scales with customer success)
- Marketplace commissions (passive income)

Benefit: Multiple revenue streams
Risk: Different optimization strategies needed
```

### 4. Technology Stack Diversification

**Avoid Single Platform Risk:**
```
- Product A: Shopify App (platform risk)
- Product B: Standalone SaaS (independent)
- Product C: WordPress Plugin (different platform)

Benefit: Platform changes don't kill portfolio
Risk: Must maintain multiple tech stacks
```

### 5. Stage Diversification

**Products at Different Lifecycle Stages:**
```
- Mature: Generating $10K MRR, slow growth, low time
- Growth: Generating $3K MRR, fast growth, high time
- New: Generating $500 MRR, validation phase

Benefit: Balanced cash flow and growth
Risk: Pulled in multiple directions
```

### Optimal Portfolio Size

**For Solo Founders:**
- **1 Product**: Maximum focus, concentration risk
- **2-3 Products**: Sweet spot for diversification without overwhelm
- **4-5 Products**: Requires strong systems and automation
- **6+ Products**: Generally unsustainable without team

**The 70-20-10 Rule:**
- 70% of time on top-performing product
- 20% of time on second product
- 10% of time on experiments or optimization

## Portfolio Health Monitoring

### Weekly Review Checklist

**Product Performance:**
- [ ] Review MRR changes for each product
- [ ] Check churn events and reasons
- [ ] Identify support spikes or issues
- [ ] Review key customer feedback
- [ ] Note technical incidents

**Resource Allocation:**
- [ ] Log hours spent per product
- [ ] Assess if allocation matches strategy
- [ ] Identify time sinks or inefficiencies
- [ ] Review opportunity costs

**Strategic Decisions:**
- [ ] Any products need strategy change?
- [ ] Any products ready to sell?
- [ ] Any experiments ready to kill?
- [ ] Cross-selling opportunities?

### Monthly Deep Dive

**Financial Analysis:**
- Calculate all key metrics per product
- Update portfolio health dashboard
- Review profitability by product
- Analyze growth trajectories
- Calculate portfolio concentration risk

**Strategic Planning:**
- Assess product position in Four Strategies Matrix
- Make invest/maintain/exit decisions
- Plan next month's time allocation
- Set goals for each product
- Identify automation opportunities

### Quarterly Strategic Review

**Portfolio Optimization:**
- Comprehensive health score review
- Consider acquisitions or exits
- Review technology stack efficiency
- Assess market position changes
- Plan next quarter's focus areas

**Personal Assessment:**
- Energy and motivation levels
- Skill gaps or learning needs
- Work-life balance check
- Long-term vision alignment

## Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
1. Set up portfolio dashboard
2. Implement health scoring for all products
3. Establish weekly review routine
4. Document current state of each product

### Phase 2: Optimization (Week 3-4)
1. Identify products in each strategy quadrant
2. Implement time tracking per product
3. Calculate opportunity costs
4. Make first strategic decisions

### Phase 3: Automation (Month 2)
1. Automate metric collection
2. Set up alerts for health score changes
3. Implement cross-product analytics
4. Build resource allocation optimizer

### Phase 4: Growth (Month 3+)
1. Execute on investment decisions
2. List products for sale if decided
3. Launch new products if capacity exists
4. Optimize portfolio for target outcomes

## Tools and Resources

**Portfolio Management:**
- This dashboard (portfolio-dashboard.tsx)
- Google Sheets for manual tracking
- Notion for product documentation
- Time tracking: Toggl, RescueTime

**Analytics:**
- Stripe for revenue data
- Google Analytics for usage
- Mixpanel for product analytics
- Custom analytics engine (portfolio-analytics.ts)

**Exit Preparation:**
- MicroAcquire (marketplace for selling)
- Acquire.com (curated deals)
- Flippa (broader marketplace)
- Due diligence checklist (acquisition-exit-guide.md)

## Success Stories

**Portfolio Examples:**

**Pieter Levels (@levelsio):**
- Nomad List ($50K+ MRR)
- Remote OK ($30K+ MRR)
- Photo AI ($100K+ MRR)
- Multiple smaller products
- Strategy: Build in public, minimal time per product

**Tyler Tringas:**
- Built multiple SaaS products
- Sold Storemapper to focus on Earnest Capital
- Strategy: Sell to fund new ventures

**Rob Walling:**
- Built and sold multiple products
- Drip (sold to Leadpages)
- Now focuses on TinySeed fund
- Strategy: Exit to level up

## Next Steps

1. **Review** this README completely
2. **Set up** portfolio-dashboard.tsx in your app
3. **Score** each product using product-health-scorer.ts
4. **Decide** which quadrant each product falls into
5. **Allocate** time based on strategy matrix
6. **Monitor** weekly and adjust monthly
7. **Execute** on strategic decisions with discipline

Remember: The goal isn't to build the most products—it's to build the most valuable portfolio that aligns with your life goals and capabilities.
