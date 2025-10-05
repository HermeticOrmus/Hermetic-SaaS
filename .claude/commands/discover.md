Execute the complete HermeticSaaS Discovery Pipeline to find and validate MicroSaaS opportunities.

**PHASE 1: TREND RESEARCH (Agent: Janus)**

Janus, research the following topic for MicroSaaS opportunities: "{{args}}"

Provide:
1. Market trends and size estimation
2. Competitive landscape analysis (minimum 10 competitors)
3. User pain points extracted from multiple sources (minimum 50 pain points from Reddit, forums, Product Hunt, Twitter/X, TikTok)
4. Emerging opportunities and market gaps
5. Technology trends enabling solutions

Sources to consult: Reddit (r/SaaS, r/Entrepreneur, r/startups, r/indiehackers), Product Hunt, Indie Hackers, Twitter/X (#buildinpublic, #indiehackers, #SaaS), TikTok trends, Google Trends, Hacker News

Output format: Structured research report with pain points categorized by severity, user quotes captured verbatim, and sources linked for verification.

---

**PHASE 2: FEEDBACK SYNTHESIS (Agent: Echo)**

Echo, analyze Janus's research and synthesize findings:

1. Identify core user problems and rank by severity (1-10 scale)
2. Extract willingness-to-pay indicators and monetary signals
3. Document user language and terminology (use their exact words)
4. Identify patterns across multiple sources
5. Validate market demand with quantitative evidence

Focus on: Real user voice (not assumptions), actual pain severity (emotional language), and concrete monetary signals (pre-orders, stated WTP, competitor pricing acceptance).

Output format: Problem severity ranking with supporting evidence, user quote database, WTP analysis with confidence levels.

---

**PHASE 3: USER VALIDATION (Agent: Metis)**

Metis, validate user needs for the top opportunities identified by Echo:

1. Create 3-5 user personas based on research data
2. Define job stories and core use cases
3. Design user survey to validate findings (100+ target responses)
4. Create interview protocol (10+ interviews target)
5. Map user workflows and pain point journey

Validation goal: Confirm Echo's findings with direct user research. Validate price points and feature priorities.

Output format: Detailed user personas, survey design ready for distribution, interview guide, validated use cases with priority rankings.

---

**PHASE 4: COMPETITIVE ANALYSIS (Agent: Prometheus)**

Prometheus, analyze the competitive landscape for the validated opportunities:

1. Create comprehensive competitor matrix (minimum 10 competitors)
2. Analyze pricing strategies and monetization models
3. Evaluate strengths and weaknesses of each competitor
4. Map market positioning and identify white space
5. Define clear differentiation opportunities
6. Infer technology stacks being used

Goal: Find defensible market position and unique value proposition.

Output format: Competitive matrix with feature comparison, pricing analysis, gap identification, differentiation strategy recommendations.

---

**PHASE 5: OPPORTUNITY SCORING (Agent: Chronos)**

Chronos, score the top opportunities using the Hermetic viability framework:

Scoring criteria (100 points total):
1. **Problem Severity** (20 points): Pain intensity, frequency, user impact
2. **Market Size** (20 points): TAM, search volume, growth potential
3. **Competition Level** (15 points): Saturation, quality of solutions, barriers
4. **Differentiation Potential** (15 points): Unique angle, technology advantage, positioning
5. **Technical Feasibility** (15 points): Build complexity, time to MVP, available tech
6. **Personal Fit** (15 points): Domain understanding, passion, sustainable motivation

**Decision Gate**: Score >70 = BUILD IT | Score <70 = PIVOT or NEXT IDEA

Output format: Opportunity scorecard with detailed scoring breakdown, go/no-go recommendation, risk assessment, and next steps.

---

**FINAL DELIVERABLE**:

Provide a comprehensive Discovery Report including:
- Executive summary (1 paragraph)
- Top 3 validated opportunities with viability scores
- Detailed research for the highest-scoring opportunity
- Clear go/no-go decision with reasoning
- If GO: Recommended next steps (invoke /learn-stack or proceed to build phase)
- If NO-GO: Alternative pivots or new research directions

Follow the Hermetic Principles throughout:
- **Accurate**: Every claim backed by data
- **Divine**: Focus on genuine value creation
- **Functional**: Ensure validated demand exists
- **Elegant**: Present findings with clarity
- **Formless**: Adapt to discovered insights
- **No Schemes**: Honest assessment, no confirmation bias
