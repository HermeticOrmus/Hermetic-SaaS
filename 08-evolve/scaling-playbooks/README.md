# Scaling Playbooks: 0 to 100K+ Users

> "Premature scaling is the #1 killer of startups. But failing to scale when you need to is the #2 killer." - HermeticSaaS Principle

## When to Scale vs. Build

### The Scaling Decision Matrix

**Focus on BUILDING when:**
- Churn > 10% monthly (fix retention first)
- NPS < 30 (fix product-market fit first)
- <$10K MRR (too early to optimize)
- Core features incomplete
- No repeatable acquisition channel working

**Focus on SCALING when:**
- Churn < 5% monthly
- NPS > 40
- 2-3 acquisition channels validated
- Users asking for more capacity/features
- Support tickets about performance/limits
- Waitlist building up

### The Critical Rule

**You're ready to scale when you have a problem worth scaling.**

Signs you have a scalable problem:
- Servers struggling with traffic
- Support team overwhelmed
- Turning away enterprise customers
- Competitors moving faster
- Organic growth exceeding your capacity

---

## Growth Stage Framework

### Stage 1: 0 → 100 Users (Months 1-6)
**Focus: Product-Market Fit**

**Metrics that Matter:**
- Retention Week 1: >40%
- Retention Week 4: >20%
- Time to "aha moment": <5 minutes
- Qualitative feedback quality

**Resource Requirements:**
- 1 founder (maybe 2)
- Shared hosting ($20-50/mo)
- Basic analytics (Plausible/Fathom)
- Manual onboarding
- No paid ads needed

**Common Mistakes:**
- Building too many features
- Trying to automate too early
- Ignoring user feedback
- Scaling infrastructure prematurely

**Key Activities:**
- Do things that don't scale (manual onboarding)
- Talk to every single user
- Ship daily based on feedback
- Find one channel that works

---

### Stage 2: 100 → 1,000 Users (Months 6-12)
**Focus: Channel Validation**

**Metrics that Matter:**
- Monthly Growth Rate: >20%
- CAC < 1/3 LTV
- Organic/Referral %: >30%
- Support tickets per user: <0.1

**Resource Requirements:**
- 1-2 full-time (founder + developer/marketer)
- Dedicated server or managed service ($100-300/mo)
- Email automation (ConvertKit/Loops)
- Basic monitoring (BetterStack)
- Maybe 1 VA for support

**Infrastructure Evolution:**
- Database: PostgreSQL on managed service
- Caching: Redis for sessions/hot data
- CDN: Cloudflare for static assets
- Background jobs: Simple queue (BullMQ)
- Monitoring: Error tracking + uptime

**Common Mistakes:**
- Hiring too early
- Over-engineering infrastructure
- Chasing too many channels
- Neglecting existing users for new ones

**Key Activities:**
- Double down on working channel
- Automate repetitive tasks
- Build referral mechanisms
- Establish support processes

---

### Stage 3: 1K → 10K Users (Months 12-24)
**Focus: Operational Excellence**

**Metrics that Matter:**
- MRR Growth: >15% monthly
- Gross Churn: <3% monthly
- NPS: >50
- Support response time: <2 hours
- System uptime: >99.9%

**Resource Requirements:**
- 2-5 team members (eng, marketing, support)
- Scalable infrastructure ($500-2K/mo)
- Professional tools (Linear, Notion, Slack)
- Dedicated support person
- Marketing budget: 20-30% of MRR

**Infrastructure Evolution:**
- Database: Replicas for read scaling
- Caching: Multi-layer (CDN + Redis + app)
- Background jobs: Distributed queue system
- Search: Dedicated search engine (Meilisearch/Algolia)
- Monitoring: Full observability stack

**Common Mistakes:**
- Scaling team faster than revenue
- Technical debt accumulation
- Losing personal touch with users
- Feature bloat from requests

**Key Activities:**
- Systematize everything
- Build data pipelines
- Implement advanced analytics
- Create self-service resources
- Start content marketing seriously

---

### Stage 4: 10K → 100K Users (Months 24-48)
**Focus: Platform Maturity**

**Metrics that Matter:**
- ARR: >$1M
- Net Revenue Retention: >100%
- Enterprise customers: >10
- Team NPS: >40
- Profit margin: >20%

**Resource Requirements:**
- 10-20 team members (specialized roles)
- Enterprise-grade infrastructure ($5K-20K/mo)
- Full product/eng/marketing/support teams
- Leadership layer emerging
- Significant marketing budget (30-40% of revenue)

**Infrastructure Evolution:**
- Database: Sharding strategies, multi-region
- Caching: Distributed cache clusters
- CDN: Multi-region, edge computing
- Architecture: Microservices for critical paths
- Monitoring: Full SRE practices

**Common Mistakes:**
- Becoming bureaucratic
- Losing innovation speed
- Over-hiring support/ops
- Building enterprise features before validating

**Key Activities:**
- Platform partnerships
- Enterprise sales motion
- API and developer ecosystem
- International expansion
- Brand building at scale

---

## Resource Planning Framework

### The 40/30/30 Rule for Spending

**At every stage, allocate:**
- 40% Engineering & Infrastructure
- 30% Growth & Marketing
- 30% Operations & Support

**Adjust based on bottleneck:**
- Too many bugs? Shift to engineering
- Growth stalling? Shift to marketing
- Churn high? Shift to support/product

### Hiring Timeline

**First 5 Hires (in order):**
1. **Developer** (at $20K MRR) - Free founder for strategy
2. **Support/Success** (at $30K MRR) - Keep users happy
3. **Marketer** (at $50K MRR) - Accelerate growth
4. **Senior Eng** (at $100K MRR) - Technical leadership
5. **Product Manager** (at $150K MRR) - Strategic direction

**Contractor-first approach:**
- Start all roles as contractors
- Convert to full-time after 3 months
- Reduces risk, tests fit
- Faster hiring process

---

## Common Scaling Mistakes

### 1. Premature Team Scaling
**Symptom:** Revenue per employee <$100K

**Fix:**
- Automate before hiring
- Use AI/tools to amplify small team
- Contractors for variable work
- Focus on revenue-generating roles first

### 2. Technical Debt Explosion
**Symptom:** Feature velocity decreasing, bugs increasing

**Fix:**
- 20% time for refactoring every sprint
- Pay down debt before major features
- Automated testing coverage >70%
- Code review standards

### 3. Feature Bloat
**Symptom:** Usage decreasing, complexity increasing

**Fix:**
- Kill features ruthlessly (usage <5% of users)
- Focus on core workflow improvements
- Usage analytics on every feature
- User research before building

### 4. Ignoring Unit Economics
**Symptom:** Growth looks good, bank account doesn't

**Fix:**
- CAC < 1/3 LTV (minimum)
- Payback period <12 months
- Track cohort economics
- Model growth vs. burn

### 5. Losing Company Culture
**Symptom:** High turnover, declining output quality

**Fix:**
- Written values and principles
- Transparent decision-making
- Regular all-hands meetings
- Maintain high hiring bar

### 6. Geographic Scaling Too Early
**Symptom:** Spreading thin, nothing working well

**Fix:**
- Dominate one market first
- Expand to similar markets (language/culture)
- Localize properly or not at all
- Test with minimal investment first

### 7. Pursuing Vanity Metrics
**Symptom:** User count up, revenue flat

**Fix:**
- Focus on revenue and retention metrics
- Segment active vs. inactive users
- Track engagement depth, not breadth
- Conversion rate optimization

---

## The Hermetic Scaling Principles

### 1. Accurate Growth Models
- Reality-based forecasting
- Conservative assumptions
- Scenario planning (best/likely/worst)
- Monthly model updates

### 2. Functional Scale
- Every system component has clear purpose
- No premature optimization
- Scalable architecture from day one
- Monitoring before scaling

### 3. Elegant Complexity
- Simplicity as users grow
- Fewer, better features
- Clean abstractions
- Technical excellence

### 4. Sustainable Pace
- 50-100% YoY growth is exceptional
- 200%+ often unsustainable
- Controlled growth beats explosive
- Profitability over growth rate

---

## Scaling Readiness Checklist

### Technical Readiness
- [ ] Database indexed and optimized
- [ ] Caching layer implemented
- [ ] Background job processing
- [ ] Error tracking and monitoring
- [ ] Automated testing >70% coverage
- [ ] CI/CD pipeline reliable
- [ ] Security audit completed
- [ ] Backup/disaster recovery tested

### Business Readiness
- [ ] Unit economics validated (CAC < 1/3 LTV)
- [ ] 2+ acquisition channels working
- [ ] Churn <5% monthly
- [ ] NPS >40
- [ ] 6+ months runway
- [ ] Pricing validated at scale
- [ ] Support processes documented
- [ ] Financial model built

### Team Readiness
- [ ] Clear roles and responsibilities
- [ ] Decision-making framework
- [ ] Communication cadence established
- [ ] Hiring plan for next 12 months
- [ ] Culture/values documented
- [ ] Onboarding process defined
- [ ] Performance review system

### Product Readiness
- [ ] Core features rock-solid
- [ ] Self-service onboarding
- [ ] API documented (if applicable)
- [ ] Admin tools for support
- [ ] Usage analytics comprehensive
- [ ] Feature flagging system
- [ ] A/B testing capability

---

## Next Steps

1. **Assess your stage** - Where are you in the framework?
2. **Identify bottleneck** - What's limiting growth?
3. **Pick ONE playbook** - Don't try to do everything
4. **Execute ruthlessly** - Focus beats optimization
5. **Measure weekly** - Track leading indicators

### Recommended Reading Order

**For early stage (0-1K users):**
1. User Growth Strategies
2. Product Scaling Framework
3. Technical Scaling Guide

**For growth stage (1K-10K users):**
1. Revenue Scaling Strategies
2. Team Scaling Playbook
3. Technical Scaling Guide

**For scale stage (10K+ users):**
1. Team Scaling Playbook
2. Product Scaling Framework
3. All playbooks in rotation

---

## Using the Scaling Calculator

The interactive calculator (`scaling-calculator.tsx`) helps you:
- Model growth scenarios
- Calculate resource requirements
- Project costs at scale
- Plan hiring timeline
- Identify bottlenecks early

Input your current metrics, and it will show you what's needed at each growth milestone.

---

**Remember:** Scaling is about doing more of what works, not doing more things. Find your one working channel, make it excellent, then expand.

The goal isn't to scale fast. It's to scale right.
