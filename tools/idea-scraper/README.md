# Idea Scraper - Discovery Automation Tools

> **Agent: Janus - "Two faces see all opportunities"**

Automated tools for discovering MicroSaaS opportunities by scraping the internet for pain points and trends.

---

## 🛠️ Available Tools

### 1. Reddit Scraper (`reddit-scraper.py`)
Mines Reddit for user pain points across 12 target subreddits.

**What it does**:
- Searches for pain point keywords ("I wish there was", "frustrated with", etc.)
- Extracts user quotes and context
- Assesses pain severity (1-10 scale)
- Tracks engagement (upvotes, comments)
- Generates analysis and reports

**Usage**:
```bash
# Set up credentials
export REDDIT_CLIENT_ID="your_client_id"
export REDDIT_CLIENT_SECRET="your_client_secret"
export REDDIT_USER_AGENT="HermeticSaaS:v1.0"

# Run scraper
python reddit-scraper.py
```

**Output**:
- `pain_points_TIMESTAMP.json` - Raw pain points
- `analysis_TIMESTAMP.json` - Pattern analysis
- Console report with top findings

---

## 📋 Setup

### Install Dependencies
```bash
pip install -r requirements.txt
```

### Get Reddit API Credentials
1. Go to https://www.reddit.com/prefs/apps
2. Click "Create App" or "Create Another App"
3. Select "script" as app type
4. Note your `client_id` and `client_secret`

### Configure Environment
```bash
# Create .env file
cp .env.example .env

# Edit .env with your credentials
REDDIT_CLIENT_ID=your_id_here
REDDIT_CLIENT_SECRET=your_secret_here
REDDIT_USER_AGENT=HermeticSaaS:v1.0 (by /u/YourUsername)
```

---

## 🎯 How Discovery Works

### Step 1: Scrape
Tools automatically search multiple sources for pain points

### Step 2: Extract
Identify and extract relevant user frustrations and needs

### Step 3: Analyze
Assess severity, frequency, and engagement

### Step 4: Report
Generate structured data for Echo to synthesize

---

## 📊 Output Format

### Pain Point Schema
```json
{
  "text": "I wish there was a tool that...",
  "keyword": "I wish there was",
  "severity": 6,
  "source": "r/SaaS",
  "post_url": "https://reddit.com/...",
  "upvotes": 145,
  "comments": 23,
  "extracted_at": "2025-01-15T10:30:00"
}
```

### Analysis Schema
```json
{
  "total_pain_points": 347,
  "average_severity": 6.2,
  "by_keyword": {
    "frustrated with": 45,
    "I wish there was": 38
  },
  "top_sources": {
    "r/Entrepreneur": 89,
    "r/SaaS": 72
  },
  "high_severity_count": 42
}
```

---

## 🔄 Workflow Integration

### Manual Usage
```bash
# 1. Run scraper
python reddit-scraper.py

# 2. Review output/pain_points_*.json

# 3. Feed to Echo for synthesis
/invoke-agent echo synthesize findings from [file]
```

### Automated (Future)
```bash
# Single command discovery
/discover "AI productivity tools"
# Automatically runs all scrapers and synthesizes
```

---

## 🚀 Coming Soon

- **Product Hunt Scraper**: Analyze launches and user feedback
- **Twitter Monitor**: Track trending complaints and requests
- **Google Trends Analyzer**: Validate search demand
- **TikTok Tracker**: Identify viral pain points
- **Unified Dashboard**: View all sources in one place

---

## 📝 Notes

- Respect rate limits for each platform
- Data is for market research only
- Follow platform ToS and API guidelines
- Store credentials securely (use .env, never commit)

---

*Built by Hermetic Claude for HermeticSaaS Framework*
