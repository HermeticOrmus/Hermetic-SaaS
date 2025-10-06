/**
 * Continuous Improvement Dashboard
 *
 * Real-time visibility into framework health, template performance,
 * improvement opportunities, and community contributions.
 *
 * This dashboard is the pulse of the self-improving framework.
 */

import React, { useState, useEffect } from 'react';
import { FrameworkAnalytics, FrameworkHealth } from './framework-analytics';
import { TemplateRefiner, TemplateImprovement } from './template-refiner';

// ============================================================================
// Types
// ============================================================================

interface DashboardData {
  health: FrameworkHealth;
  improvements: TemplateImprovement[];
  recentLaunches: LaunchSummary[];
  trends: TrendData;
}

interface LaunchSummary {
  id: string;
  name: string;
  date: string;
  success: boolean;
  timeToLaunch: number;
  rating: number;
}

interface TrendData {
  velocity: DataPoint[];
  quality: DataPoint[];
  satisfaction: DataPoint[];
}

interface DataPoint {
  date: string;
  value: number;
}

// ============================================================================
// Main Dashboard Component
// ============================================================================

export const ContinuousImprovementDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month');

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [timeRange]);

  const loadDashboardData = async () => {
    try {
      const analytics = new FrameworkAnalytics();
      const refiner = new TemplateRefiner();

      const health = await analytics.calculateFrameworkHealth();
      const improvements = await refiner.generateImprovementReport();

      // Would fetch from API in production
      setData({
        health,
        improvements: [],
        recentLaunches: [],
        trends: {
          velocity: [],
          quality: [],
          satisfaction: [],
        },
      });
      setLoading(false);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (!data) {
    return <ErrorState />;
  }

  return (
    <div className="dashboard">
      <Header />
      <TimeRangeSelector value={timeRange} onChange={setTimeRange} />

      <div className="dashboard-grid">
        <OverviewSection health={data.health} />
        <VelocityMetrics health={data.health} trends={data.trends.velocity} />
        <QualityMetrics health={data.health} trends={data.trends.quality} />
        <TemplatePerformance templates={data.health.topTemplates} />
        <ImprovementOpportunities opportunities={data.health.topImprovementOpportunities} />
        <RecentLaunches launches={data.recentLaunches} />
        <CommunityContributions health={data.health} />
        <KnowledgeBaseGrowth health={data.health} />
      </div>

      <style jsx>{`
        .dashboard {
          padding: 2rem;
          background: #0a0a0a;
          color: #ffffff;
          min-height: 100vh;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 1.5rem;
          margin-top: 2rem;
        }

        @media (max-width: 768px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

// ============================================================================
// Header Component
// ============================================================================

const Header: React.FC = () => (
  <div className="header">
    <h1>Framework Health Dashboard</h1>
    <p className="subtitle">Real-time insights into HermeticSaaS evolution</p>

    <style jsx>{`
      .header {
        border-bottom: 1px solid #333;
        padding-bottom: 1.5rem;
      }

      h1 {
        font-size: 2rem;
        font-weight: 700;
        margin: 0 0 0.5rem 0;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .subtitle {
        color: #888;
        margin: 0;
      }
    `}</style>
  </div>
);

// ============================================================================
// Time Range Selector
// ============================================================================

const TimeRangeSelector: React.FC<{
  value: string;
  onChange: (value: any) => void;
}> = ({ value, onChange }) => (
  <div className="time-range">
    <button
      className={value === 'week' ? 'active' : ''}
      onClick={() => onChange('week')}
    >
      Week
    </button>
    <button
      className={value === 'month' ? 'active' : ''}
      onClick={() => onChange('month')}
    >
      Month
    </button>
    <button
      className={value === 'quarter' ? 'active' : ''}
      onClick={() => onChange('quarter')}
    >
      Quarter
    </button>

    <style jsx>{`
      .time-range {
        display: flex;
        gap: 0.5rem;
        margin-top: 1.5rem;
      }

      button {
        padding: 0.5rem 1rem;
        background: #1a1a1a;
        border: 1px solid #333;
        color: #888;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;
      }

      button:hover {
        border-color: #667eea;
        color: #ffffff;
      }

      button.active {
        background: #667eea;
        border-color: #667eea;
        color: #ffffff;
      }
    `}</style>
  </div>
);

// ============================================================================
// Overview Section
// ============================================================================

const OverviewSection: React.FC<{ health: FrameworkHealth }> = ({ health }) => (
  <div className="card overview">
    <h2>Framework Overview</h2>
    <div className="metrics">
      <MetricCard
        label="Success Rate"
        value={`${(health.successRate * 100).toFixed(1)}%`}
        trend={health.qualityTrend}
        target={85}
        current={health.successRate * 100}
      />
      <MetricCard
        label="Avg Time to Launch"
        value={`${health.averageTimeToLaunch.toFixed(1)}h`}
        trend={health.velocityTrend}
        target={144}
        current={health.averageTimeToLaunch}
        inverse
      />
      <MetricCard
        label="Total Launches"
        value={health.totalLaunches.toString()}
        trend="stable"
      />
    </div>

    <style jsx>{`
      .card {
        background: #1a1a1a;
        border: 1px solid #333;
        border-radius: 12px;
        padding: 1.5rem;
      }

      .overview {
        grid-column: 1 / -1;
      }

      h2 {
        margin: 0 0 1.5rem 0;
        font-size: 1.25rem;
      }

      .metrics {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5rem;
      }
    `}</style>
  </div>
);

// ============================================================================
// Metric Card
// ============================================================================

const MetricCard: React.FC<{
  label: string;
  value: string;
  trend?: 'improving' | 'stable' | 'declining';
  target?: number;
  current?: number;
  inverse?: boolean;
}> = ({ label, value, trend, target, current, inverse = false }) => {
  const getTrendColor = () => {
    if (!trend) return '#888';
    if (trend === 'stable') return '#888';
    if (trend === 'improving') return '#10b981';
    return '#ef4444';
  };

  const getTrendIcon = () => {
    if (!trend || trend === 'stable') return '→';
    if (trend === 'improving') return '↑';
    return '↓';
  };

  const getProgress = () => {
    if (!target || !current) return 0;
    if (inverse) {
      return Math.max(0, Math.min(100, ((target / current) * 100)));
    }
    return Math.max(0, Math.min(100, (current / target) * 100));
  };

  return (
    <div className="metric-card">
      <div className="label">{label}</div>
      <div className="value">{value}</div>
      {trend && (
        <div className="trend" style={{ color: getTrendColor() }}>
          {getTrendIcon()} {trend}
        </div>
      )}
      {target && current && (
        <div className="progress-bar">
          <div className="progress" style={{ width: `${getProgress()}%` }} />
        </div>
      )}

      <style jsx>{`
        .metric-card {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .label {
          color: #888;
          font-size: 0.875rem;
        }

        .value {
          font-size: 2rem;
          font-weight: 700;
          color: #ffffff;
        }

        .trend {
          font-size: 0.875rem;
        }

        .progress-bar {
          height: 4px;
          background: #333;
          border-radius: 2px;
          overflow: hidden;
        }

        .progress {
          height: 100%;
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          transition: width 0.3s ease;
        }
      `}</style>
    </div>
  );
};

// ============================================================================
// Velocity Metrics
// ============================================================================

const VelocityMetrics: React.FC<{
  health: FrameworkHealth;
  trends: DataPoint[];
}> = ({ health, trends }) => (
  <div className="card">
    <h2>Velocity Metrics</h2>
    <div className="metrics">
      <MetricCard
        label="Avg Time to Launch"
        value={`${health.averageTimeToLaunch.toFixed(1)}h`}
        trend={health.velocityTrend}
        target={144}
        current={health.averageTimeToLaunch}
        inverse
      />
      <MetricCard
        label="Blocker Resolution"
        value={`${health.averageBlockerResolutionTime.toFixed(1)}h`}
        target={2}
        current={health.averageBlockerResolutionTime}
        inverse
      />
    </div>
    {trends.length > 0 && <MiniChart data={trends} />}

    <style jsx>{`
      .card {
        background: #1a1a1a;
        border: 1px solid #333;
        border-radius: 12px;
        padding: 1.5rem;
      }

      h2 {
        margin: 0 0 1.5rem 0;
        font-size: 1.25rem;
      }

      .metrics {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        margin-bottom: 1.5rem;
      }
    `}</style>
  </div>
);

// ============================================================================
// Quality Metrics
// ============================================================================

const QualityMetrics: React.FC<{
  health: FrameworkHealth;
  trends: DataPoint[];
}> = ({ health, trends }) => (
  <div className="card">
    <h2>Quality Metrics</h2>
    <div className="metrics">
      <MetricCard
        label="Test Coverage"
        value={`${health.averageTestCoverage.toFixed(1)}%`}
        target={80}
        current={health.averageTestCoverage}
      />
      <MetricCard
        label="Performance Score"
        value={health.averagePerformanceScore.toFixed(0)}
        target={90}
        current={health.averagePerformanceScore}
      />
      <MetricCard
        label="Post-Launch Issues"
        value={health.averagePostLaunchIssues.toFixed(1)}
        target={3}
        current={health.averagePostLaunchIssues}
        inverse
      />
    </div>

    <style jsx>{`
      .card {
        background: #1a1a1a;
        border: 1px solid #333;
        border-radius: 12px;
        padding: 1.5rem;
      }

      h2 {
        margin: 0 0 1.5rem 0;
        font-size: 1.25rem;
      }

      .metrics {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }
    `}</style>
  </div>
);

// ============================================================================
// Template Performance
// ============================================================================

const TemplatePerformance: React.FC<{
  templates: any[];
}> = ({ templates }) => (
  <div className="card">
    <h2>Top Performing Templates</h2>
    <div className="template-list">
      {templates.slice(0, 5).map((template, i) => (
        <div key={i} className="template-item">
          <div className="template-info">
            <div className="name">{template.templateName}</div>
            <div className="stats">
              {template.totalUses} uses • {template.averageRating.toFixed(1)}/10
            </div>
          </div>
          <div className="rating">
            <RatingBar rating={template.averageRating} />
          </div>
        </div>
      ))}
    </div>

    <style jsx>{`
      .card {
        background: #1a1a1a;
        border: 1px solid #333;
        border-radius: 12px;
        padding: 1.5rem;
      }

      h2 {
        margin: 0 0 1.5rem 0;
        font-size: 1.25rem;
      }

      .template-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .template-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        background: #0a0a0a;
        border-radius: 8px;
      }

      .name {
        font-weight: 600;
        color: #ffffff;
      }

      .stats {
        font-size: 0.875rem;
        color: #888;
        margin-top: 0.25rem;
      }

      .rating {
        width: 100px;
      }
    `}</style>
  </div>
);

// ============================================================================
// Improvement Opportunities
// ============================================================================

const ImprovementOpportunities: React.FC<{
  opportunities: any[];
}> = ({ opportunities }) => (
  <div className="card">
    <h2>Top Improvement Opportunities</h2>
    <div className="opportunity-list">
      {opportunities.slice(0, 5).map((opp, i) => (
        <div key={i} className="opportunity-item">
          <div className="category">{opp.category}</div>
          <div className="description">{opp.description}</div>
          <div className="impact">
            Saves {opp.potentialTimeSavings.toFixed(1)}h • Affects{' '}
            {opp.affectedLaunches.toFixed(0)}% of launches
          </div>
        </div>
      ))}
    </div>

    <style jsx>{`
      .card {
        background: #1a1a1a;
        border: 1px solid #333;
        border-radius: 12px;
        padding: 1.5rem;
        grid-column: 1 / -1;
      }

      h2 {
        margin: 0 0 1.5rem 0;
        font-size: 1.25rem;
      }

      .opportunity-list {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1rem;
      }

      .opportunity-item {
        padding: 1rem;
        background: #0a0a0a;
        border-left: 3px solid #667eea;
        border-radius: 4px;
      }

      .category {
        color: #667eea;
        font-size: 0.75rem;
        text-transform: uppercase;
        font-weight: 600;
        margin-bottom: 0.5rem;
      }

      .description {
        color: #ffffff;
        margin-bottom: 0.5rem;
      }

      .impact {
        font-size: 0.875rem;
        color: #888;
      }
    `}</style>
  </div>
);

// ============================================================================
// Recent Launches
// ============================================================================

const RecentLaunches: React.FC<{ launches: LaunchSummary[] }> = ({ launches }) => (
  <div className="card">
    <h2>Recent Launches</h2>
    <div className="launch-list">
      {launches.map((launch) => (
        <div key={launch.id} className="launch-item">
          <div className="launch-info">
            <div className="name">{launch.name}</div>
            <div className="date">{new Date(launch.date).toLocaleDateString()}</div>
          </div>
          <div className="launch-status">
            <StatusBadge success={launch.success} />
            <div className="time">{launch.timeToLaunch}h</div>
          </div>
        </div>
      ))}
    </div>

    <style jsx>{`
      .card {
        background: #1a1a1a;
        border: 1px solid #333;
        border-radius: 12px;
        padding: 1.5rem;
      }

      h2 {
        margin: 0 0 1.5rem 0;
        font-size: 1.25rem;
      }

      .launch-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .launch-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem;
        background: #0a0a0a;
        border-radius: 6px;
      }

      .name {
        font-weight: 500;
        color: #ffffff;
      }

      .date {
        font-size: 0.875rem;
        color: #888;
      }

      .launch-status {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .time {
        color: #888;
        font-size: 0.875rem;
      }
    `}</style>
  </div>
);

// ============================================================================
// Community Contributions
// ============================================================================

const CommunityContributions: React.FC<{ health: FrameworkHealth }> = ({ health }) => (
  <div className="card">
    <h2>Community Activity</h2>
    <div className="metrics">
      <MetricCard
        label="Template Updates (This Month)"
        value={health.templateUpdatesThisMonth.toString()}
      />
      <MetricCard
        label="Community Contributions"
        value={health.communityContributions.toString()}
      />
      <MetricCard
        label="Knowledge Base Articles"
        value={health.knowledgeBaseGrowth.toString()}
      />
    </div>

    <style jsx>{`
      .card {
        background: #1a1a1a;
        border: 1px solid #333;
        border-radius: 12px;
        padding: 1.5rem;
      }

      h2 {
        margin: 0 0 1.5rem 0;
        font-size: 1.25rem;
      }

      .metrics {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }
    `}</style>
  </div>
);

// ============================================================================
// Knowledge Base Growth
// ============================================================================

const KnowledgeBaseGrowth: React.FC<{ health: FrameworkHealth }> = ({ health }) => (
  <div className="card">
    <h2>Knowledge Base</h2>
    <div className="kb-stats">
      <div className="stat">
        <div className="label">Total Articles</div>
        <div className="value">{health.knowledgeBaseGrowth}</div>
      </div>
      <div className="stat">
        <div className="label">Missing Templates</div>
        <div className="value">{health.missingTemplates.length}</div>
      </div>
    </div>

    <style jsx>{`
      .card {
        background: #1a1a1a;
        border: 1px solid #333;
        border-radius: 12px;
        padding: 1.5rem;
      }

      h2 {
        margin: 0 0 1.5rem 0;
        font-size: 1.25rem;
      }

      .kb-stats {
        display: flex;
        gap: 2rem;
      }

      .stat {
        flex: 1;
      }

      .label {
        color: #888;
        font-size: 0.875rem;
        margin-bottom: 0.5rem;
      }

      .value {
        font-size: 2rem;
        font-weight: 700;
        color: #ffffff;
      }
    `}</style>
  </div>
);

// ============================================================================
// Helper Components
// ============================================================================

const RatingBar: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="rating-bar">
    <div className="fill" style={{ width: `${(rating / 10) * 100}%` }} />
    <style jsx>{`
      .rating-bar {
        height: 6px;
        background: #333;
        border-radius: 3px;
        overflow: hidden;
      }

      .fill {
        height: 100%;
        background: linear-gradient(90deg, #10b981 0%, #059669 100%);
        transition: width 0.3s ease;
      }
    `}</style>
  </div>
);

const StatusBadge: React.FC<{ success: boolean }> = ({ success }) => (
  <div className={`badge ${success ? 'success' : 'failure'}`}>
    {success ? '✓ Success' : '✗ Failed'}
    <style jsx>{`
      .badge {
        padding: 0.25rem 0.75rem;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 600;
      }

      .success {
        background: rgba(16, 185, 129, 0.1);
        color: #10b981;
      }

      .failure {
        background: rgba(239, 68, 68, 0.1);
        color: #ef4444;
      }
    `}</style>
  </div>
);

const MiniChart: React.FC<{ data: DataPoint[] }> = ({ data }) => (
  <div className="mini-chart">
    {/* Simplified chart - would use a charting library in production */}
    <div className="placeholder">Trend visualization</div>
    <style jsx>{`
      .mini-chart {
        height: 60px;
        background: #0a0a0a;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .placeholder {
        color: #666;
        font-size: 0.875rem;
      }
    `}</style>
  </div>
);

const LoadingState: React.FC = () => (
  <div className="loading">
    <div className="spinner" />
    <div>Loading framework health...</div>
    <style jsx>{`
      .loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        color: #888;
        gap: 1rem;
      }

      .spinner {
        width: 40px;
        height: 40px;
        border: 3px solid #333;
        border-top-color: #667eea;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    `}</style>
  </div>
);

const ErrorState: React.FC = () => (
  <div className="error">
    Failed to load dashboard data
    <style jsx>{`
      .error {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100vh;
        color: #ef4444;
      }
    `}</style>
  </div>
);

export default ContinuousImprovementDashboard;
