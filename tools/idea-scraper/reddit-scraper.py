#!/usr/bin/env python3
"""
Reddit Pain Point Scraper - Hermetic Agent: Janus
Mines Reddit for MicroSaaS opportunities by identifying user pain points
"""

import json
import re
from datetime import datetime
from collections import defaultdict
import praw
from typing import List, Dict, Optional
import os
from pathlib import Path

class RedditPainPointScraper:
    """Scrapes Reddit for pain points and MicroSaaS opportunities"""

    # Pain point keywords to search for
    PAIN_KEYWORDS = [
        "I wish there was",
        "I need a tool",
        "frustrated with",
        "looking for",
        "does anyone know",
        "is there a way to",
        "how do you deal with",
        "tired of",
        "hate using",
        "can't find",
        "wish I could",
        "annoying that",
        "problem with",
        "struggle with",
        "difficult to",
    ]

    # Relevant subreddits for SaaS/startup discovery
    TARGET_SUBREDDITS = [
        'SaaS',
        'Entrepreneur',
        'startups',
        'indiehackers',
        'webdev',
        'digitalnomad',
        'productivity',
        'smallbusiness',
        'marketing',
        'freelance',
        'sidehustle',
        'solopreneur',
    ]

    def __init__(self, client_id: str, client_secret: str, user_agent: str):
        """Initialize Reddit API connection"""
        self.reddit = praw.Reddit(
            client_id=client_id,
            client_secret=client_secret,
            user_agent=user_agent
        )
        self.pain_points = []

    def extract_pain_point(self, text: str) -> Optional[Dict]:
        """Extract pain point from text if it contains keywords"""
        text_lower = text.lower()

        for keyword in self.PAIN_KEYWORDS:
            if keyword in text_lower:
                # Extract sentence containing the keyword
                sentences = re.split(r'[.!?]', text)
                for sentence in sentences:
                    if keyword in sentence.lower():
                        return {
                            'text': sentence.strip(),
                            'keyword': keyword,
                            'severity': self._assess_severity(sentence),
                            'extracted_at': datetime.now().isoformat()
                        }
        return None

    def _assess_severity(self, text: str) -> int:
        """Assess pain severity based on emotional language (1-10 scale)"""
        severity_indicators = {
            'high': ['hate', 'terrible', 'awful', 'desperate', 'nightmare', 'impossible'],
            'medium': ['frustrated', 'annoying', 'difficult', 'struggle', 'problem'],
            'low': ['wish', 'would be nice', 'prefer', 'better if']
        }

        text_lower = text.lower()

        if any(word in text_lower for word in severity_indicators['high']):
            return 8
        elif any(word in text_lower for word in severity_indicators['medium']):
            return 6
        elif any(word in text_lower for word in severity_indicators['low']):
            return 4
        return 5

    def scrape_subreddit(self, subreddit_name: str, limit: int = 100, time_filter: str = 'month'):
        """Scrape a subreddit for pain points"""
        print(f"Scraping r/{subreddit_name}...")

        try:
            subreddit = self.reddit.subreddit(subreddit_name)

            # Search top posts
            for submission in subreddit.top(time_filter=time_filter, limit=limit):
                # Check submission title and body
                pain_point = self.extract_pain_point(submission.title)
                if pain_point:
                    pain_point.update({
                        'source': f'r/{subreddit_name}',
                        'post_url': f'https://reddit.com{submission.permalink}',
                        'upvotes': submission.score,
                        'comments': submission.num_comments,
                        'type': 'submission_title'
                    })
                    self.pain_points.append(pain_point)

                if submission.selftext:
                    pain_point = self.extract_pain_point(submission.selftext)
                    if pain_point:
                        pain_point.update({
                            'source': f'r/{subreddit_name}',
                            'post_url': f'https://reddit.com{submission.permalink}',
                            'upvotes': submission.score,
                            'comments': submission.num_comments,
                            'type': 'submission_body'
                        })
                        self.pain_points.append(pain_point)

                # Check comments
                submission.comments.replace_more(limit=0)
                for comment in submission.comments.list()[:20]:  # Top 20 comments
                    pain_point = self.extract_pain_point(comment.body)
                    if pain_point:
                        pain_point.update({
                            'source': f'r/{subreddit_name}',
                            'post_url': f'https://reddit.com{comment.permalink}',
                            'upvotes': comment.score,
                            'type': 'comment'
                        })
                        self.pain_points.append(pain_point)

        except Exception as e:
            print(f"Error scraping r/{subreddit_name}: {str(e)}")

    def scrape_all_subreddits(self, limit_per_sub: int = 50):
        """Scrape all target subreddits"""
        for subreddit in self.TARGET_SUBREDDITS:
            self.scrape_subreddit(subreddit, limit=limit_per_sub)

    def analyze_patterns(self) -> Dict:
        """Analyze pain points for patterns and insights"""
        if not self.pain_points:
            return {}

        # Group by keyword
        by_keyword = defaultdict(list)
        for point in self.pain_points:
            by_keyword[point['keyword']].append(point)

        # Calculate average severity
        avg_severity = sum(p['severity'] for p in self.pain_points) / len(self.pain_points)

        # Top sources
        sources = defaultdict(int)
        for point in self.pain_points:
            sources[point['source']] += 1

        # High severity pain points (8+)
        high_severity = [p for p in self.pain_points if p['severity'] >= 8]

        return {
            'total_pain_points': len(self.pain_points),
            'average_severity': round(avg_severity, 2),
            'by_keyword': {k: len(v) for k, v in by_keyword.items()},
            'top_sources': dict(sorted(sources.items(), key=lambda x: x[1], reverse=True)[:5]),
            'high_severity_count': len(high_severity),
            'top_high_severity': sorted(high_severity, key=lambda x: x.get('upvotes', 0), reverse=True)[:10]
        }

    def export_results(self, output_dir: str = "output"):
        """Export results to JSON"""
        Path(output_dir).mkdir(exist_ok=True)

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

        # Export raw pain points
        pain_points_file = f"{output_dir}/pain_points_{timestamp}.json"
        with open(pain_points_file, 'w', encoding='utf-8') as f:
            json.dump(self.pain_points, f, indent=2, ensure_ascii=False)

        # Export analysis
        analysis = self.analyze_patterns()
        analysis_file = f"{output_dir}/analysis_{timestamp}.json"
        with open(analysis_file, 'w', encoding='utf-8') as f:
            json.dump(analysis, f, indent=2, ensure_ascii=False)

        print(f"\n✅ Results exported:")
        print(f"   Pain Points: {pain_points_file}")
        print(f"   Analysis: {analysis_file}")

        return pain_points_file, analysis_file

    def generate_report(self) -> str:
        """Generate human-readable report"""
        analysis = self.analyze_patterns()

        report = f"""
# Reddit Pain Point Discovery Report
Generated: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}

## Summary
- **Total Pain Points Found**: {analysis.get('total_pain_points', 0)}
- **Average Severity**: {analysis.get('average_severity', 0)}/10
- **High Severity Issues**: {analysis.get('high_severity_count', 0)}

## Top Keywords
{self._format_dict(analysis.get('by_keyword', {}))}

## Most Active Subreddits
{self._format_dict(analysis.get('top_sources', {}))}

## High Severity Pain Points (Top 10)
{self._format_pain_points(analysis.get('top_high_severity', []))}

---
*Scraped by Hermetic Agent: Janus*
"""
        return report

    def _format_dict(self, d: Dict) -> str:
        """Format dictionary for report"""
        return '\n'.join([f"- {k}: {v}" for k, v in sorted(d.items(), key=lambda x: x[1], reverse=True)])

    def _format_pain_points(self, points: List[Dict]) -> str:
        """Format pain points for report"""
        if not points:
            return "None found"

        formatted = []
        for i, point in enumerate(points, 1):
            formatted.append(f"""
{i}. **Severity: {point['severity']}/10** | Upvotes: {point.get('upvotes', 0)}
   - "{point['text']}"
   - Source: {point['source']}
   - URL: {point.get('post_url', 'N/A')}
""")
        return '\n'.join(formatted)


def main():
    """Main execution"""
    # Load credentials from environment or config
    CLIENT_ID = os.getenv('REDDIT_CLIENT_ID', 'YOUR_CLIENT_ID')
    CLIENT_SECRET = os.getenv('REDDIT_CLIENT_SECRET', 'YOUR_CLIENT_SECRET')
    USER_AGENT = os.getenv('REDDIT_USER_AGENT', 'HermeticSaaS:v1.0 (by /u/YourUsername)')

    if CLIENT_ID == 'YOUR_CLIENT_ID':
        print("⚠️  Reddit API credentials not configured!")
        print("\nPlease set environment variables:")
        print("  REDDIT_CLIENT_ID")
        print("  REDDIT_CLIENT_SECRET")
        print("  REDDIT_USER_AGENT")
        print("\nOr edit this file to add your credentials.")
        print("\nGet credentials at: https://www.reddit.com/prefs/apps")
        return

    # Initialize scraper
    scraper = RedditPainPointScraper(CLIENT_ID, CLIENT_SECRET, USER_AGENT)

    # Scrape all subreddits
    print("🔍 Starting Reddit pain point discovery...")
    print(f"Target subreddits: {', '.join(scraper.TARGET_SUBREDDITS)}\n")

    scraper.scrape_all_subreddits(limit_per_sub=50)

    # Generate and print report
    report = scraper.generate_report()
    print(report)

    # Export results
    scraper.export_results()

    print("\n✨ Discovery complete! Data ready for Echo to synthesize.")


if __name__ == "__main__":
    main()
