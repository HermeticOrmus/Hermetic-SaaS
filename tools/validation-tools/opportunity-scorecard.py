#!/usr/bin/env python3
"""
Opportunity Scorecard - Hermetic Agent: Chronos
Automated scoring of MicroSaaS opportunities using the Hermetic viability framework
"""

import json
from datetime import datetime
from typing import Dict, List, Optional
from pathlib import Path
from dataclasses import dataclass, asdict

@dataclass
class OpportunityScore:
    """Data class for opportunity scoring"""
    opportunity_name: str
    total_score: int
    max_score: int = 100

    # Individual scores
    problem_severity: int = 0
    market_size: int = 0
    competition_level: int = 0
    differentiation: int = 0
    technical_feasibility: int = 0
    personal_fit: int = 0

    # Metadata
    decision: str = "pending"
    recommendation: str = ""
    risks: List[str] = None
    next_steps: List[str] = None
    scored_at: str = ""

    def __post_init__(self):
        self.risks = self.risks or []
        self.next_steps = self.next_steps or []
        if not self.scored_at:
            self.scored_at = datetime.now().isoformat()


class OpportunityScorecardAutomation:
    """Automates the Hermetic opportunity scoring process"""

    # Scoring thresholds
    DECISION_THRESHOLD_BUILD = 70
    DECISION_THRESHOLD_MAYBE = 50

    def __init__(self):
        self.scores = []

    def score_problem_severity(self, pain_data: Dict) -> tuple[int, List[str]]:
        """
        Score problem severity (max 20 points)
        Based on: pain intensity, frequency, number affected
        """
        score = 0
        insights = []

        # Pain intensity (0-8 points)
        severity = pain_data.get('severity_score', 0)  # Assumed 1-10 scale
        if severity >= 8:
            score += 8
            insights.append(f"High pain severity ({severity}/10)")
        elif severity >= 6:
            score += 6
            insights.append(f"Moderate pain severity ({severity}/10)")
        elif severity >= 4:
            score += 4
            insights.append(f"Low-moderate pain severity ({severity}/10)")
        else:
            score += 2
            insights.append(f"Low pain severity ({severity}/10)")

        # Frequency (0-6 points)
        frequency = pain_data.get('frequency', 'unknown').lower()
        if frequency in ['daily', 'constant', 'continuous']:
            score += 6
            insights.append("Problem occurs daily/constantly")
        elif frequency in ['weekly', 'frequent']:
            score += 4
            insights.append("Problem occurs weekly/frequently")
        elif frequency in ['monthly', 'occasional']:
            score += 2
            insights.append("Problem occurs monthly/occasionally")

        # Number affected (0-6 points)
        people_affected = pain_data.get('people_affected', 0)
        if people_affected >= 100000:
            score += 6
            insights.append(f"Large audience affected ({people_affected:,})")
        elif people_affected >= 10000:
            score += 4
            insights.append(f"Medium audience affected ({people_affected:,})")
        elif people_affected >= 1000:
            score += 2
            insights.append(f"Small audience affected ({people_affected:,})")

        return min(score, 20), insights

    def score_market_size(self, market_data: Dict) -> tuple[int, List[str]]:
        """
        Score market size (max 20 points)
        Based on: TAM, search volume, growth potential
        """
        score = 0
        insights = []

        # TAM - Total Addressable Market (0-10 points)
        tam = market_data.get('tam_millions', 0)
        if tam >= 100:
            score += 10
            insights.append(f"Large TAM (${tam}M+)")
        elif tam >= 10:
            score += 7
            insights.append(f"Medium TAM (${tam}M)")
        elif tam >= 1:
            score += 4
            insights.append(f"Small TAM (${tam}M)")

        # Search volume (0-6 points)
        search_volume = market_data.get('monthly_searches', 0)
        if search_volume >= 50000:
            score += 6
            insights.append(f"High search volume ({search_volume:,}/mo)")
        elif search_volume >= 10000:
            score += 4
            insights.append(f"Medium search volume ({search_volume:,}/mo)")
        elif search_volume >= 1000:
            score += 2
            insights.append(f"Low search volume ({search_volume:,}/mo)")

        # Growth rate (0-4 points)
        growth_rate = market_data.get('growth_rate_percent', 0)
        if growth_rate >= 50:
            score += 4
            insights.append(f"High growth ({growth_rate}%)")
        elif growth_rate >= 20:
            score += 3
            insights.append(f"Good growth ({growth_rate}%)")
        elif growth_rate >= 0:
            score += 1
            insights.append(f"Stable/slow growth ({growth_rate}%)")

        return min(score, 20), insights

    def score_competition(self, competitor_data: Dict) -> tuple[int, List[str]]:
        """
        Score competition level (max 15 points)
        Based on: number of competitors, quality, saturation
        """
        score = 0
        insights = []

        # Number of competitors (0-6 points, inverse scoring)
        num_competitors = competitor_data.get('num_competitors', 0)
        if num_competitors == 0:
            score += 2  # No competition might mean no market
            insights.append("No direct competitors (validate market exists)")
        elif num_competitors <= 3:
            score += 6
            insights.append(f"Low competition ({num_competitors} competitors)")
        elif num_competitors <= 10:
            score += 4
            insights.append(f"Moderate competition ({num_competitors} competitors)")
        else:
            score += 2
            insights.append(f"High competition ({num_competitors}+ competitors)")

        # Quality of solutions (0-5 points, inverse scoring)
        solution_quality = competitor_data.get('avg_quality_score', 5)  # 1-10 scale
        if solution_quality <= 5:
            score += 5
            insights.append(f"Poor existing solutions (avg quality: {solution_quality}/10)")
        elif solution_quality <= 7:
            score += 3
            insights.append(f"Moderate existing solutions (avg quality: {solution_quality}/10)")
        else:
            score += 1
            insights.append(f"High-quality existing solutions (avg quality: {solution_quality}/10)")

        # Market saturation (0-4 points, inverse scoring)
        saturation = competitor_data.get('saturation_level', 'medium').lower()
        if saturation == 'low':
            score += 4
            insights.append("Low market saturation - room to grow")
        elif saturation == 'medium':
            score += 2
            insights.append("Medium saturation - need differentiation")
        else:
            score += 1
            insights.append("High saturation - difficult to enter")

        return min(score, 15), insights

    def score_differentiation(self, diff_data: Dict) -> tuple[int, List[str]]:
        """
        Score differentiation potential (max 15 points)
        Based on: unique angle, tech advantage, positioning
        """
        score = 0
        insights = []

        # Unique angle (0-7 points)
        has_unique_angle = diff_data.get('has_unique_angle', False)
        angle_strength = diff_data.get('angle_strength', 'weak').lower()

        if has_unique_angle:
            if angle_strength == 'strong':
                score += 7
                insights.append("Strong unique value proposition")
            elif angle_strength == 'moderate':
                score += 5
                insights.append("Moderate differentiation angle")
            else:
                score += 3
                insights.append("Weak differentiation angle")
        else:
            insights.append("No clear differentiation - high risk")

        # Technology advantage (0-5 points)
        tech_advantage = diff_data.get('tech_advantage', False)
        if tech_advantage:
            score += 5
            insights.append("Technology/innovation advantage exists")

        # Market positioning (0-3 points)
        positioning = diff_data.get('positioning_clarity', 'unclear').lower()
        if positioning == 'clear':
            score += 3
            insights.append("Clear market positioning")
        elif positioning == 'moderate':
            score += 2
            insights.append("Moderate positioning clarity")

        return min(score, 15), insights

    def score_technical_feasibility(self, tech_data: Dict) -> tuple[int, List[str]]:
        """
        Score technical feasibility (max 15 points)
        Based on: complexity, time to MVP, technology availability
        """
        score = 0
        insights = []

        # Build complexity (0-7 points, inverse)
        complexity = tech_data.get('complexity', 'medium').lower()
        if complexity == 'low':
            score += 7
            insights.append("Low technical complexity - quick to build")
        elif complexity == 'medium':
            score += 4
            insights.append("Medium complexity - reasonable timeline")
        else:
            score += 1
            insights.append("High complexity - long development time")

        # Time to MVP (0-5 points)
        time_to_mvp = tech_data.get('estimated_sprint_count', 999)
        if time_to_mvp <= 2:
            score += 5
            insights.append(f"Quick MVP possible ({time_to_mvp} sprints)")
        elif time_to_mvp <= 4:
            score += 3
            insights.append(f"Moderate MVP timeline ({time_to_mvp} sprints)")
        else:
            score += 1
            insights.append(f"Long MVP timeline ({time_to_mvp}+ sprints)")

        # Tech availability (0-3 points)
        tech_available = tech_data.get('required_tech_available', False)
        if tech_available:
            score += 3
            insights.append("Required technology/APIs available")
        else:
            insights.append("Missing required technology - needs R&D")

        return min(score, 15), insights

    def score_personal_fit(self, fit_data: Dict) -> tuple[int, List[str]]:
        """
        Score personal fit (max 15 points)
        Based on: domain understanding, passion, sustainability
        """
        score = 0
        insights = []

        # Domain understanding (0-7 points)
        understanding = fit_data.get('domain_understanding', 'low').lower()
        if understanding == 'high':
            score += 7
            insights.append("Strong domain expertise")
        elif understanding == 'medium':
            score += 4
            insights.append("Moderate domain knowledge")
        else:
            score += 1
            insights.append("Limited domain expertise")

        # Passion/interest (0-5 points)
        passion_level = fit_data.get('passion_level', 'medium').lower()
        if passion_level == 'high':
            score += 5
            insights.append("High passion for this problem space")
        elif passion_level == 'medium':
            score += 3
            insights.append("Moderate interest in problem space")
        else:
            score += 1
            insights.append("Low interest - may affect sustainability")

        # Sustainable motivation (0-3 points)
        sustainable = fit_data.get('sustainable_motivation', False)
        if sustainable:
            score += 3
            insights.append("Long-term motivation sustainable")
        else:
            insights.append("Motivation sustainability unclear")

        return min(score, 15), insights

    def calculate_comprehensive_score(self, opportunity_data: Dict) -> OpportunityScore:
        """Calculate comprehensive opportunity score"""

        name = opportunity_data.get('name', 'Unnamed Opportunity')

        # Score each dimension
        problem_score, problem_insights = self.score_problem_severity(
            opportunity_data.get('problem', {})
        )

        market_score, market_insights = self.score_market_size(
            opportunity_data.get('market', {})
        )

        competition_score, comp_insights = self.score_competition(
            opportunity_data.get('competition', {})
        )

        diff_score, diff_insights = self.score_differentiation(
            opportunity_data.get('differentiation', {})
        )

        tech_score, tech_insights = self.score_technical_feasibility(
            opportunity_data.get('technical', {})
        )

        fit_score, fit_insights = self.score_personal_fit(
            opportunity_data.get('personal_fit', {})
        )

        # Total score
        total = (problem_score + market_score + competition_score +
                diff_score + tech_score + fit_score)

        # Make decision
        if total >= self.DECISION_THRESHOLD_BUILD:
            decision = "BUILD IT"
            recommendation = f"✅ Strong opportunity (score: {total}/100). Proceed to build phase."
        elif total >= self.DECISION_THRESHOLD_MAYBE:
            decision = "MAYBE - INVESTIGATE"
            recommendation = f"⚠️  Moderate opportunity (score: {total}/100). Needs deeper validation before committing."
        else:
            decision = "PASS - PIVOT"
            recommendation = f"❌ Weak opportunity (score: {total}/100). Consider pivoting or finding new idea."

        # Compile all insights as risks/considerations
        all_insights = (problem_insights + market_insights + comp_insights +
                       diff_insights + tech_insights + fit_insights)

        # Generate next steps
        next_steps = self._generate_next_steps(decision, total, opportunity_data)

        return OpportunityScore(
            opportunity_name=name,
            total_score=total,
            problem_severity=problem_score,
            market_size=market_score,
            competition_level=competition_score,
            differentiation=diff_score,
            technical_feasibility=tech_score,
            personal_fit=fit_score,
            decision=decision,
            recommendation=recommendation,
            risks=all_insights,
            next_steps=next_steps
        )

    def _generate_next_steps(self, decision: str, score: int, data: Dict) -> List[str]:
        """Generate recommended next steps based on score"""
        steps = []

        if "BUILD IT" in decision:
            steps.append("✅ Proceed to Phase 2: Learning - Research optimal tech stack")
            steps.append("✅ Invoke /learn-stack to get technology recommendations")
            steps.append("✅ Begin architecture design with Sol")
            steps.append("✅ Create detailed product requirements")

        elif "MAYBE" in decision:
            steps.append("🔍 Conduct deeper user validation (10+ interviews)")
            steps.append("🔍 Run competitive analysis on top 5 competitors")
            steps.append("🔍 Test willingness-to-pay with landing page + email capture")
            steps.append("🔍 Re-score after gathering more data")

        else:  # PASS
            steps.append("🔄 Pivot to a different angle or niche")
            steps.append("🔄 Return to discovery phase with broader scope")
            steps.append("🔄 Consider adjacent opportunities from research")
            steps.append("🔄 Invoke /discover with new domain")

        return steps

    def export_scorecard(self, score: OpportunityScore, output_dir: str = "output"):
        """Export scorecard to JSON"""
        Path(output_dir).mkdir(exist_ok=True)

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{output_dir}/scorecard_{score.opportunity_name.replace(' ', '_')}_{timestamp}.json"

        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(asdict(score), f, indent=2)

        print(f"✅ Scorecard exported: {filename}")
        return filename

    def generate_report(self, score: OpportunityScore) -> str:
        """Generate human-readable scorecard report"""

        report = f"""
# Hermetic Opportunity Scorecard

## {score.opportunity_name}

### DECISION: {score.decision}
**Total Score**: {score.total_score}/100

{score.recommendation}

---

## Score Breakdown

| Dimension | Score | Max | Performance |
|-----------|-------|-----|-------------|
| Problem Severity | {score.problem_severity} | 20 | {'🟢' if score.problem_severity >= 15 else '🟡' if score.problem_severity >= 10 else '🔴'} |
| Market Size | {score.market_size} | 20 | {'🟢' if score.market_size >= 15 else '🟡' if score.market_size >= 10 else '🔴'} |
| Competition Level | {score.competition_level} | 15 | {'🟢' if score.competition_level >= 11 else '🟡' if score.competition_level >= 7 else '🔴'} |
| Differentiation | {score.differentiation} | 15 | {'🟢' if score.differentiation >= 11 else '🟡' if score.differentiation >= 7 else '🔴'} |
| Technical Feasibility | {score.technical_feasibility} | 15 | {'🟢' if score.technical_feasibility >= 11 else '🟡' if score.technical_feasibility >= 7 else '🔴'} |
| Personal Fit | {score.personal_fit} | 15 | {'🟢' if score.personal_fit >= 11 else '🟡' if score.personal_fit >= 7 else '🔴'} |

---

## Key Insights & Risks
{self._format_list(score.risks)}

---

## Recommended Next Steps
{self._format_list(score.next_steps)}

---

*Scored by: Hermetic Agent - Chronos*
*Framework: Hermetic Viability Scoring v1.0*
*Scored at: {score.scored_at}*
"""
        return report

    def _format_list(self, items: List[str]) -> str:
        """Format list for markdown"""
        if not items:
            return "None"
        return '\n'.join([f"- {item}" for item in items])


def main():
    """Main execution"""

    # Example opportunity data
    example_opportunity = {
        'name': 'AI Phone Practice App for Introverts',
        'problem': {
            'severity_score': 8,
            'frequency': 'daily',
            'people_affected': 50000
        },
        'market': {
            'tam_millions': 15,
            'monthly_searches': 12000,
            'growth_rate_percent': 35
        },
        'competition': {
            'num_competitors': 3,
            'avg_quality_score': 6,
            'saturation_level': 'low'
        },
        'differentiation': {
            'has_unique_angle': True,
            'angle_strength': 'strong',
            'tech_advantage': True,
            'positioning_clarity': 'clear'
        },
        'technical': {
            'complexity': 'medium',
            'estimated_sprint_count': 3,
            'required_tech_available': True
        },
        'personal_fit': {
            'domain_understanding': 'high',
            'passion_level': 'high',
            'sustainable_motivation': True
        }
    }

    print("🎯 Hermetic Opportunity Scorecard")
    print("=" * 60)

    scorer = OpportunityScorecardAutomation()

    # Calculate score
    score = scorer.calculate_comprehensive_score(example_opportunity)

    # Generate report
    report = scorer.generate_report(score)
    print(report)

    # Export
    scorer.export_scorecard(score)

    print("\n✨ Scoring complete!")


if __name__ == "__main__":
    main()
