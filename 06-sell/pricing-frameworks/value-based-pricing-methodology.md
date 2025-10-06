# Value-Based Pricing Methodology

**Core Principle:** Price based on the value you create for customers, not your costs or competitor prices.

## The Value Equation

```
Your Price = % of Value Created

Where "Value Created" =
  (Customer Revenue Increase OR Cost Savings) - (Implementation Cost + Switching Cost)
```

**Golden Rule:** Capture 10-30% of the value you create. Customer keeps 70-90%.

---

## Step-by-Step Value-Based Pricing

### Step 1: Identify Your Customer Segments

Different customers get different value from the same product.

**Example: Project Management Tool**

| Segment | Size | Problem | Value |
|---------|------|---------|-------|
| Freelancers | 1 person | Disorganized | Time saved |
| Small teams | 5-20 | Communication chaos | Project success |
| Agencies | 20-100 | Client management | Revenue/client |
| Enterprises | 100+ | Compliance, reporting | Risk reduction |

**Action:** Map your top 3 customer segments.

---

### Step 2: Quantify Value Created

#### For Revenue-Generating Products

**Questions to Ask:**
- How much revenue does this help create?
- How much faster do customers close deals?
- How many more customers can they serve?

**Example: Sales CRM**
```
Average customer:
- Closes 10 deals/month at $5K each = $50K/month
- Your CRM increases close rate 10% = +1 deal/month
- Additional revenue: $5K/month = $60K/year

Value created: $60K/year
Your price: 10-20% = $6K-12K/year ($500-1,000/mo)
```

#### For Cost-Saving Products

**Questions to Ask:**
- What does the current solution cost?
- How much time does it save?
- What's the cost of the problem it solves?

**Example: HR Automation Tool**
```
Average customer (50 employees):
- HR admin spends 20 hrs/week on manual tasks
- HR hourly cost: $50/hr
- Current cost: 20 × $50 × 52 = $52K/year
- Your tool saves 15 hrs/week = $39K/year saved

Value created: $39K/year
Your price: 10-25% = $3.9K-9.75K/year ($325-812/mo)
```

#### For Risk-Reduction Products

**Questions to Ask:**
- What's the cost of failure/downtime?
- What's the regulatory penalty for non-compliance?
- What's the reputation cost of incidents?

**Example: Security Monitoring**
```
Average customer:
- Revenue: $10M/year
- 1 hour downtime costs: $10M / (365×24) = $1,141/hr
- Average incident: 4 hours = $4,564
- Your tool prevents 3 incidents/year = $13,692 saved

Value created: $13K/year minimum
Your price: 20-40% = $2.7K-5.5K/year ($225-458/mo)
```

---

### Step 3: Research Willingness to Pay

**Methods:**

#### 1. Van Westendorp Price Sensitivity Meter

Ask 4 questions:
1. "At what price would this be too expensive?" (Too Expensive)
2. "At what price would this be expensive but worth it?" (Expensive)
3. "At what price would this be a bargain?" (Bargain)
4. "At what price would this be too cheap to trust?" (Too Cheap)

**Analysis:**
- Plot responses on a graph
- Optimal price = intersection of "Too Expensive" and "Bargain"
- Acceptable range = between "Too Cheap" and "Too Expensive"

#### 2. Conjoint Analysis (Feature Trade-offs)

Show customers packages and ask preferences:

```
Package A: $99/mo
- Feature X
- Feature Y
- Basic support

Package B: $149/mo
- Feature X
- Feature Y
- Feature Z
- Priority support

Which would you choose?
```

Iterate to find feature-price combinations they prefer.

#### 3. Direct Customer Interviews

**Script:**
```
1. "How much does [problem] cost you currently?" (quantify pain)
2. "What would solving this be worth to you?" (anchor high)
3. "If this solved it, what would be a fair price?" (test price)
4. "At what price would this be too expensive?" (upper bound)
5. "What price would make you question quality?" (lower bound)
```

**Sample Size Needed:**
- 10-20 interviews for initial pricing
- 50-100 survey responses for validation
- Segment by customer type

---

### Step 4: Calculate Economic Value

**Economic Value Estimation (EVE) Formula:**

```
Economic Value = (Differentiation Value) + (Reference Price)

Where:
- Reference Price = What they pay now (competitor, alternative, DIY)
- Differentiation Value = Additional value you provide vs. reference
```

**Example: Email Marketing Tool**

```
Reference: Mailchimp at $299/mo

Differentiation Value:
+ Better deliverability (5% more opens) → $500/mo extra revenue
+ Automation saves 10 hrs/mo → $500 value
+ Better segmentation (10% more conversions) → $1,000/mo revenue

Total differentiation: $2,000/mo
Reference price: $299/mo

Economic Value: $2,299/mo
Your price: $399-799/mo (capturing 10-30% of extra value)
```

---

### Step 5: Choose Your Pricing Metric

**Align pricing with value creation:**

| Value Driver | Best Metric | Example |
|--------------|-------------|---------|
| More revenue | % of revenue, per lead | Sales tools, marketing |
| Saves time | Per user, per hour saved | Productivity tools |
| Scales with growth | Per transaction, per GB | Infrastructure, platforms |
| Reduces risk | Flat fee, per incident prevented | Security, compliance |
| Team value | Per seat, per team | Collaboration tools |

**Good Pricing Metric Characteristics:**
1. ✅ Scales with customer value (not your costs)
2. ✅ Easy to understand and predict
3. ✅ Aligns your success with customer success
4. ✅ Difficult to game or abuse

**Examples:**

✅ **Good:**
- Stripe: % of transaction (scales with customer revenue)
- Slack: Per active user (scales with team value)
- Vercel: Per site/request (scales with customer growth)

❌ **Bad:**
- Storage-based for a collaboration tool (doesn't reflect value)
- API calls for a business tool (technical metric, not value)
- Per project for a tool that makes projects faster (misaligned)

---

### Step 6: Set Your Price

**Synthesis Formula:**

```
Your Price = MIN(
  Value Created × 0.1 to 0.3,
  Maximum Willingness to Pay,
  Economic Value
)

With constraints:
- Must be > Customer Acquisition Cost × 3
- Must support your business model
- Must be defensible in sales conversations
```

**Example Calculation:**

```
SaaS Product: Team Collaboration Tool (10-person team)

1. Value Created:
   - Saves 2 hrs/person/week × 10 people = 20 hrs/week
   - At $50/hr loaded cost = $1,000/week = $4,000/mo
   - Capture 15% = $600/mo

2. Willingness to Pay (from interviews):
   - "Too expensive" at $800/mo
   - "Bargain" at $400/mo
   - Optimal around $500-600/mo

3. Economic Value:
   - Reference (Slack): $500/mo for 10 users
   - Differentiation: Better async features worth $200/mo
   - Economic value: $700/mo

Final Price: $599/mo
- Above CAC × 3 (assuming $200 CAC)
- Within willingness to pay range
- Captures 15% of value created
- Positioned as premium vs. reference
```

---

## Value-Based Pricing by Business Model

### B2B SaaS (SMB)

**Value Drivers:**
- Time saved
- Error reduction
- Team efficiency

**Research Method:**
- 10-15 customer interviews
- Calculate time savings × hourly rate
- Price at 10-20% of value

**Example Pricing:**
- Value: $5K/month saved
- Price: $500-1,000/month

---

### B2B SaaS (Enterprise)

**Value Drivers:**
- Revenue increase
- Risk reduction
- Compliance costs

**Research Method:**
- Economic impact analysis
- ROI calculators with prospects
- Business case development

**Example Pricing:**
- Value: $500K/year impact
- Price: $50-150K/year

---

### B2C SaaS

**Value Drivers:**
- Emotional value
- Status/identity
- Problem solution

**Research Method:**
- Van Westendorp surveys (100+ responses)
- A/B test pricing on landing page
- Compare to similar purchases (Netflix, Spotify, gym)

**Example Pricing:**
- Value: Entertainment/productivity
- Price: $9-29/month (impulse-buy range)

---

### Developer Tools

**Value Drivers:**
- Time saved coding
- Infrastructure costs saved
- Faster shipping

**Research Method:**
- Engineer hourly rate × time saved
- Infrastructure cost comparison
- Time-to-market value

**Example Pricing:**
- Value: $2K/month dev time saved
- Price: $20-200/month (10% capture)

---

## Value Communication Framework

**Once you have value-based pricing, communicate it effectively:**

### 1. Lead with Outcome, Not Features

❌ **Feature-Based:**
"Get 50GB storage, 100 projects, API access"

✅ **Value-Based:**
"Ship projects 3× faster and stop losing deals to delays"

### 2. Show ROI Immediately

```
YOUR INVESTMENT: $499/month

YOUR RETURN:
→ Save 40 hours/month on manual work = $2,000
→ Close 2 more deals per month = $10,000
→ Reduce errors by 50% = $1,000 saved

ROI: $13,000 return on $499 investment = 26× ROI
Break-even: 1.5 days
```

### 3. Use Social Proof as Value Signal

"Teams using [product] increase close rates by 23% in first 3 months"

### 4. Risk Reversal

"30-day money-back guarantee. If you don't save 10× what you pay, we'll refund everything."

---

## Common Value-Based Pricing Mistakes

### Mistake 1: Pricing on Your Costs

❌ "Servers cost $X, so we charge $X + 30% margin"

✅ "Customers save $10K/mo, so we charge $1K/mo (10% of value)"

**Your costs are irrelevant to pricing.** Price on value created.

---

### Mistake 2: Racing to the Bottom

❌ "Competitor charges $99, so we'll charge $79"

✅ "We create 2× more value, so we charge $149"

**If you create more value, charge more.** Don't compete on price.

---

### Mistake 3: One Price for All Segments

❌ Everyone pays $99/month

✅
- Freelancers: $29/mo (save 5 hrs/week)
- Teams: $99/mo (save 20 hrs/week)
- Enterprise: $499/mo (save 100 hrs/week)

**Different segments get different value. Price accordingly.**

---

### Mistake 4: Not Quantifying Value

❌ "Our tool makes you more productive" (vague)

✅ "Save 10 hours per week = $2,000/month for your team"

**Quantify everything. Vague value = low prices.**

---

### Mistake 5: Underpricing Due to Impostor Syndrome

❌ "I'm just starting out, I should charge less"

✅ "I solve a $10K problem, I'll charge $1K regardless of my experience"

**Value to customer > your experience level.**

---

## Value-Based Pricing Checklist

Before launching your pricing:

- [ ] Identified top 3 customer segments
- [ ] Quantified value created for each segment (in $)
- [ ] Interviewed 10+ potential customers about willingness to pay
- [ ] Calculated economic value vs. alternatives
- [ ] Chosen pricing metric that aligns with value
- [ ] Set price at 10-30% of value created
- [ ] Validated price > CAC × 3
- [ ] Created value-based messaging for pricing page
- [ ] Built ROI calculator for prospects
- [ ] Prepared to raise prices as you add value

---

## Value Pricing Tools & Resources

### Customer Research
- **Surveys:** Typeform, SurveyMonkey, Google Forms
- **Interviews:** Calendly + Zoom + note-taking template
- **Van Westendorp:** Conjointly.com (free calculator)

### Value Calculation
- **ROI Calculators:** Outgrow, Calconic, custom spreadsheet
- **Economic Value:** Build spreadsheet with your formulas
- **Pricing Experimentation:** Price Intelligently, ProfitWell

### Communication
- **Landing Pages:** Highlight value, not features
- **Sales Decks:** Lead with customer ROI
- **Case Studies:** Show actual value created

---

## Real-World Examples

### Superhuman (Email Client)

**Value Calculation:**
- Target: Executives, VCs, founders
- Time saved: 3 hours/week on email
- Value of their time: $500-1,000/hr
- Monthly value: 12 hours × $750 = $9,000

**Pricing:** $30/month (0.3% of value created)

**Result:** Customers happily pay because ROI is 300×

---

### Slack (Team Communication)

**Value Calculation:**
- Replaces: Email, meetings, other tools
- Saves: 5 hours/person/week (meetings avoided)
- For 10-person team: 50 hours/week = $2,500/week saved

**Pricing:** $80/month for 10 users (1.3% of value)

**Result:** Obvious ROI, viral growth within companies

---

### Linear (Project Management)

**Value Calculation:**
- Developers ship 20% faster (less time in meetings/planning)
- 5-person dev team: $500K/year salary
- 20% faster = equivalent of 1 extra developer = $100K value/year

**Pricing:** $480/year for 5 users (0.5% of value)

**Result:** No-brainer purchase for engineering teams

---

## Template: Value-Based Pricing Worksheet

```markdown
PRODUCT: _______________

CUSTOMER SEGMENT: _______________

1. PROBLEM COST (what they pay now)
   Current solution: _______________
   Annual cost: $_______________

2. VALUE CREATED BY YOUR SOLUTION

   Revenue increase:
   - How: _______________
   - Amount: $_______________/year

   OR Cost savings:
   - What saves: _______________
   - Amount: $_______________/year

   OR Risk reduction:
   - Risk avoided: _______________
   - Cost if it happens: $_______________
   - Probability: ___%
   - Expected value: $_______________/year

3. DIFFERENTIATION VS. ALTERNATIVES
   Alternative: _______________
   Alternative cost: $_______________
   Extra value you provide: $_______________

4. WILLINGNESS TO PAY (from research)
   Too expensive: $_______________
   Expensive but fair: $_______________
   Bargain: $_______________
   Too cheap: $_______________

5. YOUR PRICE CALCULATION
   Total value created: $_______________/year
   Capture rate (10-30%): ___%

   YOUR PRICE: $_______________/year
   OR: $_______________/month

   Check: Is this > CAC × 3? (Y/N)
   Check: Can customer afford this? (Y/N)
   Check: Is ROI obvious? (Y/N)

6. VALUE MESSAGING
   One-line value prop:
   "_______________"

   ROI statement:
   "Invest $___, get $___ return = __× ROI"
```

---

**Remember:** Price is a product feature. It should communicate value, attract the right customers, and capture fair value from the problem you solve. Don't be afraid to charge what you're worth.
