#!/usr/bin/env python3
"""
Google Trends Analyzer - Hermetic Agent: Janus
Validates market demand by analyzing Google search trends
"""

import json
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from pathlib import Path
from pytrends.request import TrendReq
import pandas as pd
import time

class GoogleTrendsAnalyzer:
    """Analyzes Google Trends data for MicroSaaS opportunity validation"""

    def __init__(self, language='en-US', timezone=360):
        """Initialize Google Trends connection"""
        self.pytrends = TrendReq(hl=language, tz=timezone)
        self.results = {}

    def analyze_keyword(self, keyword: str, timeframe='today 12-m', geo='') -> Dict:
        """Analyze a single keyword's trend data"""
        print(f"Analyzing: {keyword}")

        try:
            # Build payload
            self.pytrends.build_payload([keyword], timeframe=timeframe, geo=geo)

            # Get interest over time
            interest_over_time = self.pytrends.interest_over_time()

            if interest_over_time.empty:
                return {
                    'keyword': keyword,
                    'status': 'no_data',
                    'message': 'Insufficient search volume'
                }

            # Calculate metrics
            data_series = interest_over_time[keyword]
            current_interest = int(data_series.iloc[-1])
            avg_interest = int(data_series.mean())
            max_interest = int(data_series.max())
            min_interest = int(data_series.min())

            # Trend direction (last 3 months vs previous 3 months)
            if len(data_series) >= 24:  # weekly data for 6 months
                recent = data_series[-12:].mean()
                previous = data_series[-24:-12].mean()
                trend_direction = 'rising' if recent > previous else 'declining' if recent < previous else 'stable'
                trend_change = ((recent - previous) / previous * 100) if previous > 0 else 0
            else:
                trend_direction = 'insufficient_data'
                trend_change = 0

            # Get related queries
            time.sleep(1)  # Rate limiting
            related_queries = self.pytrends.related_queries()

            top_queries = []
            rising_queries = []

            if keyword in related_queries and related_queries[keyword]['top'] is not None:
                top_queries = related_queries[keyword]['top'].head(10).to_dict('records')

            if keyword in related_queries and related_queries[keyword]['rising'] is not None:
                rising_queries = related_queries[keyword]['rising'].head(10).to_dict('records')

            # Get regional interest
            time.sleep(1)
            try:
                regional_interest = self.pytrends.interest_by_region()
                top_regions = regional_interest.nlargest(5, keyword).to_dict()[keyword] if not regional_interest.empty else {}
            except:
                top_regions = {}

            return {
                'keyword': keyword,
                'status': 'success',
                'metrics': {
                    'current_interest': current_interest,
                    'average_interest': avg_interest,
                    'max_interest': max_interest,
                    'min_interest': min_interest,
                    'trend_direction': trend_direction,
                    'trend_change_percent': round(trend_change, 2),
                },
                'related_queries': {
                    'top': top_queries,
                    'rising': rising_queries
                },
                'regional_interest': top_regions,
                'timeframe': timeframe,
                'analyzed_at': datetime.now().isoformat()
            }

        except Exception as e:
            return {
                'keyword': keyword,
                'status': 'error',
                'error': str(e)
            }

    def compare_keywords(self, keywords: List[str], timeframe='today 12-m', geo='') -> Dict:
        """Compare multiple keywords"""
        print(f"Comparing keywords: {', '.join(keywords)}")

        if len(keywords) > 5:
            print("⚠️  Google Trends API limits to 5 keywords per comparison")
            keywords = keywords[:5]

        try:
            self.pytrends.build_payload(keywords, timeframe=timeframe, geo=geo)

            # Get comparative interest
            interest_over_time = self.pytrends.interest_over_time()

            if interest_over_time.empty:
                return {'status': 'no_data', 'message': 'Insufficient data for comparison'}

            # Calculate relative popularity
            comparison = {}
            for keyword in keywords:
                if keyword in interest_over_time.columns:
                    comparison[keyword] = {
                        'average_interest': int(interest_over_time[keyword].mean()),
                        'current_interest': int(interest_over_time[keyword].iloc[-1]),
                        'max_interest': int(interest_over_time[keyword].max())
                    }

            # Rank by average interest
            ranked = sorted(comparison.items(), key=lambda x: x[1]['average_interest'], reverse=True)

            return {
                'status': 'success',
                'keywords': keywords,
                'comparison': comparison,
                'ranked': [{'keyword': k, **v} for k, v in ranked],
                'timeframe': timeframe,
                'compared_at': datetime.now().isoformat()
            }

        except Exception as e:
            return {'status': 'error', 'error': str(e)}

    def validate_opportunity(self, primary_keyword: str, related_keywords: List[str] = None) -> Dict:
        """Complete validation analysis for a MicroSaaS opportunity"""
        print(f"\n🔍 Validating opportunity: {primary_keyword}")

        validation = {
            'primary_keyword': primary_keyword,
            'validation_date': datetime.now().isoformat(),
            'status': 'pending'
        }

        # Analyze primary keyword
        primary_analysis = self.analyze_keyword(primary_keyword)
        validation['primary_analysis'] = primary_analysis

        if primary_analysis['status'] != 'success':
            validation['status'] = 'failed'
            validation['recommendation'] = 'Insufficient search volume - consider different keywords'
            return validation

        # Score the opportunity
        metrics = primary_analysis['metrics']
        score = 0
        max_score = 100

        # Interest level (0-40 points)
        if metrics['average_interest'] >= 75:
            score += 40
        elif metrics['average_interest'] >= 50:
            score += 30
        elif metrics['average_interest'] >= 25:
            score += 20
        elif metrics['average_interest'] >= 10:
            score += 10

        # Trend direction (0-30 points)
        if metrics['trend_direction'] == 'rising':
            score += 30
        elif metrics['trend_direction'] == 'stable':
            score += 20
        elif metrics['trend_direction'] == 'declining':
            score += 5

        # Growth rate (0-20 points)
        if metrics['trend_change_percent'] > 50:
            score += 20
        elif metrics['trend_change_percent'] > 20:
            score += 15
        elif metrics['trend_change_percent'] > 0:
            score += 10
        elif metrics['trend_change_percent'] > -20:
            score += 5

        # Related queries (0-10 points)
        rising_count = len(primary_analysis['related_queries']['rising'])
        if rising_count >= 10:
            score += 10
        elif rising_count >= 5:
            score += 7
        elif rising_count >= 3:
            score += 5

        validation['opportunity_score'] = score

        # Recommendation
        if score >= 70:
            validation['status'] = 'strong'
            validation['recommendation'] = '✅ Strong opportunity - High demand and positive trends'
        elif score >= 50:
            validation['status'] = 'moderate'
            validation['recommendation'] = '⚠️  Moderate opportunity - Decent demand but watch trends'
        elif score >= 30:
            validation['status'] = 'weak'
            validation['recommendation'] = '❌ Weak opportunity - Low demand or declining trends'
        else:
            validation['status'] = 'poor'
            validation['recommendation'] = '❌ Poor opportunity - Insufficient demand'

        # Compare with related keywords if provided
        if related_keywords:
            time.sleep(2)  # Rate limiting
            all_keywords = [primary_keyword] + related_keywords
            comparison = self.compare_keywords(all_keywords)
            validation['keyword_comparison'] = comparison

        return validation

    def export_results(self, data: Dict, output_dir: str = "output"):
        """Export analysis results"""
        Path(output_dir).mkdir(exist_ok=True)

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{output_dir}/trends_analysis_{timestamp}.json"

        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

        print(f"\n✅ Results exported to: {filename}")
        return filename

    def generate_report(self, validation: Dict) -> str:
        """Generate human-readable validation report"""

        primary = validation.get('primary_analysis', {})
        metrics = primary.get('metrics', {})

        report = f"""
# Google Trends Validation Report
Generated: {validation.get('validation_date', 'N/A')}

## Opportunity: {validation.get('primary_keyword', 'N/A')}

### Overall Score: {validation.get('opportunity_score', 0)}/100
**Status**: {validation.get('status', 'unknown').upper()}
**Recommendation**: {validation.get('recommendation', 'N/A')}

---

## Search Interest Metrics
- **Current Interest**: {metrics.get('current_interest', 0)}/100
- **Average Interest** (12 months): {metrics.get('average_interest', 0)}/100
- **Peak Interest**: {metrics.get('max_interest', 0)}/100
- **Trend Direction**: {metrics.get('trend_direction', 'unknown').upper()}
- **Trend Change**: {metrics.get('trend_change_percent', 0)}%

---

## Related Rising Queries
{self._format_queries(primary.get('related_queries', {}).get('rising', []))}

## Top Related Queries
{self._format_queries(primary.get('related_queries', {}).get('top', []))}

---

## Geographic Interest (Top 5)
{self._format_regions(primary.get('regional_interest', {}))}

---

*Analyzed by Hermetic Agent: Janus*
*Validation Framework: Google Trends*
"""
        return report

    def _format_queries(self, queries: List[Dict]) -> str:
        """Format related queries for report"""
        if not queries:
            return "None found"

        formatted = []
        for q in queries[:10]:
            query_text = q.get('query', 'N/A')
            value = q.get('value', 'N/A')
            formatted.append(f"- {query_text} ({value})")

        return '\n'.join(formatted)

    def _format_regions(self, regions: Dict) -> str:
        """Format regional interest for report"""
        if not regions:
            return "No regional data"

        formatted = []
        for region, interest in sorted(regions.items(), key=lambda x: x[1], reverse=True):
            formatted.append(f"- {region}: {interest}/100")

        return '\n'.join(formatted)


def main():
    """Main execution"""
    analyzer = GoogleTrendsAnalyzer()

    # Example: Validate a MicroSaaS opportunity
    print("🔍 Google Trends Validation")
    print("=" * 50)

    # Get keyword from user or use example
    keyword = input("\nEnter keyword to validate (or press Enter for example): ").strip()

    if not keyword:
        keyword = "AI productivity tools"
        print(f"Using example: {keyword}")

    # Validate the opportunity
    validation = analyzer.validate_opportunity(
        primary_keyword=keyword,
        related_keywords=None  # Can add related keywords here
    )

    # Generate and print report
    report = analyzer.generate_report(validation)
    print(report)

    # Export results
    analyzer.export_results(validation)

    print("\n✨ Validation complete! Data ready for Chronos to score.")


if __name__ == "__main__":
    main()
