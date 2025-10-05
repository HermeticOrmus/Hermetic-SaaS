# Phase 1: Discover - Finding Profitable MicroSaaS Opportunities

> **"The All is Mind - Every MicroSaaS begins with understanding the problem space"**

## 🎯 Overview

The Discovery phase is where profitable MicroSaaS opportunities are identified and validated. Using the Hermetic Agents (Janus, Echo, and Metis) along with automated tools, you'll systematically find real problems worth solving.

---

## 📂 Directory Structure

```
01-discover/
├── README.md                      # This file
├── scraping-automation/           # Web scraping tools
│   ├── reddit-scraper.py         # Reddit pain point miner
│   ├── producthunt-scraper.py    # Product Hunt analyzer
│   ├── twitter-monitor.py        # Twitter/X trend tracker
│   └── indiehackers-scraper.py   # Indie Hackers insights
├── trend-monitors/                # Trend analysis tools
│   ├── google-trends-analyzer.py # Google Trends integration
│   ├── tiktok-trends.py          # TikTok trend tracker
│   └── search-volume-checker.py  # SEMrush/Ahrefs integration
├── validation-playbooks/          # Validation frameworks
│   ├── opportunity-scorecard.md  # Scoring template
│   ├── user-survey-template.md   # Survey design
│   ├── competitor-matrix.md      # Competitive analysis
│   └── research-report-template.md
└── agent-playbooks/               # Agent-specific guides
    ├── janus-playbook.md         # Trend research guide
    ├── echo-playbook.md          # Feedback synthesis guide
    └── metis-playbook.md         # User validation guide
```

---

## 🚀 Quick Start

### Method 1: Automated Discovery
```bash
# Full automated discovery (coming soon)
/discover "[topic or domain]"

# Examples:
/discover "AI productivity tools"
/discover "developer pain points"
/discover "remote work challenges"
```

### Method 2: Manual Agent Invocation
```bash
# Step 1: Research trends
Janus, research trending MicroSaaS opportunities in [domain]

# Step 2: Synthesize feedback
Echo, analyze market demand for [specific idea from Janus]

# Step 3: Validate with users
Metis, validate user needs for [concept from Echo]

# Step 4: Evaluate competition
Prometheus, analyze competitors for [validated idea]

# Step 5: Score opportunity
Chronos, score this opportunity for viability
```

---

## 🔍 Discovery Process

### Phase 1.1: Trend Research (Agent: Janus)

**Objective**: Identify emerging trends and user pain points

**Data Sources**:
- Reddit (r/SaaS, r/Entrepreneur, r/startups, r/indiehackers)
- Product Hunt (new launches, comments, pain points)
- Twitter/X (viral complaints, trending topics)
- Indie Hackers (success stories, "what are you building")
- TikTok (creator problems, viral trends)

**Key Questions**:
- What are people complaining about?
- What problems appear repeatedly?
- What tools are people requesting?
- What gaps exist in current solutions?

**Deliverable**:
- Market research report
- 50+ pain points identified
- Trending topics list
- Market gaps documented

**Agent Playbook**: See `agent-playbooks/janus-playbook.md`

---

### Phase 1.2: Feedback Synthesis (Agent: Echo)

**Objective**: Analyze and synthesize user feedback to identify core problems

**Process**:
1. Take Janus's research data
2. Identify patterns across sources
3. Rank pain points by severity
4. Extract user language and terminology
5. Assess willingness-to-pay signals

**Key Questions**:
- What's the core problem behind complaints?
- How severe is the pain (1-10)?
- Are users willing to pay to solve it?
- What language do users use?

**Deliverable**:
- Synthesized problem statement
- Pain point severity ranking
- User quotes and language
- WTP (Willingness To Pay) indicators

**Agent Playbook**: See `agent-playbooks/echo-playbook.md`

---

### Phase 1.3: User Validation (Agent: Metis)

**Objective**: Validate needs through direct user research

**Methods**:
- User surveys (100+ responses ideal)
- User interviews (10+ interviews ideal)
- Persona creation (3-5 personas)
- Use case mapping
- Workflow analysis

**Key Questions**:
- Do real users confirm this problem?
- How do they currently solve it?
- What would they pay for a better solution?
- What features are must-haves?

**Deliverable**:
- User personas (3-5)
- Survey results and insights
- Interview transcripts and patterns
- Validated use cases
- Price sensitivity data

**Agent Playbook**: See `agent-playbooks/metis-playbook.md`

---

### Phase 1.4: Competitive Analysis (Agent: Prometheus)

**Objective**: Understand competitive landscape and find differentiation

**Analysis**:
1. Identify all competitors (direct + indirect)
2. Create feature matrix
3. Analyze pricing strategies
4. Evaluate strengths and weaknesses
5. Find gaps and opportunities

**Key Questions**:
- Who are the competitors?
- What do they do well?
- What do they miss?
- How can we differentiate?
- What's the pricing landscape?

**Deliverable**:
- Competitive matrix (10+ competitors)
- Feature gap analysis
- Pricing comparison
- Differentiation strategy
- Market positioning

**Template**: See `validation-playbooks/competitor-matrix.md`

---

### Phase 1.5: Opportunity Scoring (Agent: Chronos)

**Objective**: Score and prioritize opportunities

**Scoring Framework** (100 points total):

1. **Problem Severity** (20 points)
   - How painful is the problem?
   - How frequently does it occur?
   - How many people affected?

2. **Market Size** (20 points)
   - Total addressable market
   - Search volume for problem keywords
   - Revenue potential

3. **Competition Level** (15 points)
   - Number of competitors
   - Quality of existing solutions
   - Market saturation

4. **Differentiation Potential** (15 points)
   - Unique angle possible?
   - Technology advantage?
   - Underserved segment?

5. **Technical Feasibility** (15 points)
   - Can I build this?
   - Time to MVP?
   - Technology availability?

6. **Personal Fit** (15 points)
   - Do I understand the problem?
   - Am I passionate about it?
   - Can I sustain motivation?

**Decision Gate**: Score >70 → Build it | Score <70 → Pivot/Next idea

**Template**: See `validation-playbooks/opportunity-scorecard.md`

---

## 🛠️ Tools & Resources

### Scraping Tools (To Be Built)

**Reddit Scraper** (`scraping-automation/reddit-scraper.py`):
- Monitors specific subreddits
- Extracts pain point keywords
- Identifies trending discussions
- Outputs to JSON database

**Product Hunt Scraper** (`scraping-automation/producthunt-scraper.py`):
- Tracks new launches
- Analyzes user comments
- Identifies feature gaps
- Market opportunity detection

**Twitter Monitor** (`scraping-automation/twitter-monitor.py`):
- Tracks SaaS-related hashtags
- Monitors viral complaints
- Sentiment analysis
- Trend detection

### Trend Analysis Tools (To Be Built)

**Google Trends Analyzer** (`trend-monitors/google-trends-analyzer.py`):
- Keyword trend analysis
- Geographic interest mapping
- Related queries discovery
- Trend prediction

**TikTok Trend Tracker** (`trend-monitors/tiktok-trends.py`):
- Viral hashtag monitoring
- Creator pain point extraction
- Trend velocity tracking
- Content gap analysis

**Search Volume Checker** (`trend-monitors/search-volume-checker.py`):
- Ahrefs/SEMrush API integration
- Keyword volume reporting
- Competition difficulty scoring
- Traffic potential estimation

### Validation Resources

**Templates**:
- Opportunity Scorecard: `validation-playbooks/opportunity-scorecard.md`
- User Survey Template: `validation-playbooks/user-survey-template.md`
- Competitor Matrix: `validation-playbooks/competitor-matrix.md`
- Research Report: `validation-playbooks/research-report-template.md`

**External Tools**:
- [Google Trends](https://trends.google.com)
- [Ahrefs](https://ahrefs.com) - Keyword research
- [Typeform](https://typeform.com) - User surveys
- [Calendly](https://calendly.com) - Interview scheduling

---

## 📊 Success Metrics

### Quantitative Targets
- ✅ 50+ pain points identified
- ✅ 10+ competitors analyzed
- ✅ 10K+ monthly search volume for main keywords
- ✅ 100+ survey responses collected
- ✅ 10+ user interviews conducted
- ✅ Viability score >70

### Qualitative Targets
- ✅ Can explain problem in one sentence
- ✅ Using actual user language
- ✅ Clear differentiation strategy
- ✅ Confident in market demand
- ✅ Validated willingness-to-pay

---

## 🚧 Common Pitfalls

### 1. Confirmation Bias
**Problem**: Only seeking data that confirms your idea
**Solution**: Actively look for reasons it WON'T work
**Agent Help**: Echo provides unbiased synthesis

### 2. Analysis Paralysis
**Problem**: Researching forever, never building
**Solution**: 3-day discovery limit, use viability threshold
**Agent Help**: Chronos enforces decision-making

### 3. Falling in Love with Ideas
**Problem**: Building what YOU want, not what USERS need
**Solution**: Kill ideas ruthlessly based on data
**Agent Help**: Metis provides objective user research

### 4. Ignoring Competition
**Problem**: "No competition = no market" OR "Too much = impossible"
**Solution**: Some competition validates demand, find your niche
**Agent Help**: Prometheus evaluates competitive landscape

### 5. Vanity Metrics
**Problem**: Focusing on likes/upvotes instead of WTP
**Solution**: Track paying intent: email+CC, pre-orders, surveys
**Agent Help**: Echo identifies real signals vs noise

---

## 🎯 Discovery Workflows

### Workflow 1: Broad Market Scan
**When**: Exploring new domains
**Process**:
1. Janus scans broad market (e.g., "developer tools")
2. Identifies 20+ sub-niches
3. Echo ranks by opportunity
4. Metis validates top 3
5. Chronos selects winner

### Workflow 2: Specific Problem Validation
**When**: You have a problem in mind
**Process**:
1. Echo synthesizes existing feedback about problem
2. Metis validates with target users
3. Prometheus analyzes competitive solutions
4. Chronos scores for viability

### Workflow 3: Trend-Based Discovery
**When**: Capitalizing on emerging trends
**Process**:
1. Janus monitors trends (TikTok, Twitter, Google)
2. Identifies viral patterns
3. Echo finds underlying problems
4. Metis confirms user needs
5. Quick build decision (trend window is short)

---

## 📝 Discovery Checklist

### Pre-Discovery
- [ ] Discovery tools installed and configured
- [ ] Target market/domain identified (optional)
- [ ] Time allocated (2-3 days)

### During Discovery
- [ ] Janus research complete (50+ pain points)
- [ ] Echo synthesis complete (problems ranked)
- [ ] Metis validation complete (users confirmed)
- [ ] Prometheus analysis complete (competition mapped)
- [ ] Chronos scoring complete (decision made)

### Post-Discovery
- [ ] Opportunity scorecard filled
- [ ] Research report documented
- [ ] Clear problem statement defined
- [ ] User personas created
- [ ] Differentiation strategy set
- [ ] Go/No-go decision made

### Quality Gates
- [ ] Viability score >70
- [ ] Real user validation (not assumptions)
- [ ] Market size >$10M
- [ ] Search volume >10K/month
- [ ] Clear differentiation identified
- [ ] WTP validated (>$10/month)

---

## 🔄 Iteration & Learning

### After Each Discovery

**Capture**:
- What worked well?
- What data source was most valuable?
- Which agent was most effective?
- What surprised you?

**Improve**:
- Update scraping keywords
- Refine scoring criteria
- Improve agent prompts
- Optimize workflow

**Document**:
- Success patterns
- Failure patterns
- Tool effectiveness
- Time spent per activity

---

## 🌟 Discovery Best Practices

### 1. Start Broad, Then Narrow
- Begin with wide market scan
- Identify interesting sub-niches
- Deep dive into most promising
- Validate before committing

### 2. Trust the Data, Not Your Gut
- Users decide, not you
- Quantitative data trumps opinions
- Validate every assumption
- Be willing to pivot

### 3. Look for Pain, Not Features
- Users know what hurts, not what they need
- "I wish I could..." is more valuable than "Add this feature"
- Severity matters more than novelty
- Frequent pain > Occasional pain

### 4. Validate Willingness-to-Pay Early
- "Would you use this?" < "Would you pay for this?"
- Email signup < Credit card on file
- Free users ≠ Paying customers
- Pre-sales validate better than surveys

### 5. Competition is Validation
- No competitors often means no market
- Some competition = validated demand
- Too much competition = find niche angle
- Evaluate quality, not just quantity

---

## 📚 Further Reading

**In This Framework**:
- [Hermetic MicroSaaS Principles](../00-framework/HERMETIC_MICROSAAS_PRINCIPLES.md)
- [Phase 1 Template](../00-framework/phase-templates/PHASE_1_DISCOVER.md)
- [Full Pipeline Workflow](../.claude/workflows/full-pipeline.md)

**Agent Guides**:
- [Janus Playbook](agent-playbooks/janus-playbook.md)
- [Echo Playbook](agent-playbooks/echo-playbook.md)
- [Metis Playbook](agent-playbooks/metis-playbook.md)

**External Resources**:
- [Indie Hackers](https://indiehackers.com) - Founder stories
- [r/SaaS](https://reddit.com/r/SaaS) - SaaS community
- [Product Hunt](https://producthunt.com) - New products
- [Ahrefs Blog](https://ahrefs.com/blog) - SEO research

---

## 🚀 Next Steps

Once discovery is complete and you have a validated opportunity (score >70):

**Phase 2: LEARN**
```bash
/learn-stack "[your validated idea]"
```

This will invoke Prometheus to recommend the optimal tech stack and Saturn to compile learning resources.

---

**"Discovery is not about finding what you want to build. It's about finding what needs to be built."**

*Trust the process. Trust the agents. Trust the Hermetic principles.*

---

Last Updated: [Date]
Success Rate: [% of discoveries leading to profitable MicroSaaS]
