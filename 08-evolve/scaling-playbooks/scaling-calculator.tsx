import React, { useState, useMemo } from 'react';

/**
 * HermeticSaaS Scaling Calculator
 *
 * Interactive tool to model growth scenarios, calculate resource requirements,
 * project costs at scale, and plan hiring timelines.
 *
 * Hermetic Principles: Accurate, Functional, Elegant
 */

// Types
interface Metrics {
  currentUsers: number;
  currentMRR: number;
  monthlyGrowthRate: number;
  churnRate: number;
  arpu: number;
}

interface Projections {
  month: number;
  users: number;
  mrr: number;
  costs: number;
  profit: number;
  teamSize: number;
  runway: number;
}

interface Milestone {
  name: string;
  users: number;
  mrr: number;
  monthsAway: number;
  requiredTeamSize: number;
  monthlyCost: number;
  recommendations: string[];
}

// Constants
const COST_PER_USER_TIERS = [
  { maxUsers: 1000, costPerUser: 2.0 },
  { maxUsers: 10000, costPerUser: 1.0 },
  { maxUsers: 100000, costPerUser: 0.5 },
  { maxUsers: Infinity, costPerUser: 0.25 },
];

const TEAM_SIZE_BY_MRR = [
  { maxMRR: 10000, teamSize: 1 },
  { maxMRR: 30000, teamSize: 2 },
  { maxMRR: 50000, teamSize: 3 },
  { maxMRR: 100000, teamSize: 5 },
  { maxMRR: 250000, teamSize: 10 },
  { maxMRR: 500000, teamSize: 15 },
  { maxMRR: Infinity, teamSize: 20 },
];

const HIRING_ROADMAP = [
  { mrr: 15000, role: 'Developer', salary: 70000 },
  { mrr: 30000, role: 'Customer Success', salary: 50000 },
  { mrr: 50000, role: 'Marketer/Growth', salary: 70000 },
  { mrr: 100000, role: 'Senior Engineer', salary: 130000 },
  { mrr: 150000, role: 'Product Manager', salary: 110000 },
];

// Utility functions
const calculateInfrastructureCost = (users: number): number => {
  const tier = COST_PER_USER_TIERS.find(t => users <= t.maxUsers);
  return users * (tier?.costPerUser || 0.25);
};

const calculateTeamSize = (mrr: number): number => {
  const tier = TEAM_SIZE_BY_MRR.find(t => mrr <= t.maxMRR);
  return tier?.teamSize || 1;
};

const calculateTeamCost = (teamSize: number, mrr: number): number => {
  // Average salary per person scales with company size
  const avgSalary = mrr < 50000 ? 50000 : mrr < 150000 ? 70000 : 90000;
  return (teamSize * avgSalary) / 12; // Monthly cost
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Main component
export default function ScalingCalculator() {
  const [metrics, setMetrics] = useState<Metrics>({
    currentUsers: 100,
    currentMRR: 5000,
    monthlyGrowthRate: 15,
    churnRate: 5,
    arpu: 50,
  });

  const [projectionMonths, setProjectionMonths] = useState(12);

  // Calculate projections
  const projections = useMemo(() => {
    const results: Projections[] = [];
    let users = metrics.currentUsers;
    let mrr = metrics.currentMRR;

    for (let month = 0; month <= projectionMonths; month++) {
      // Calculate users (growth - churn)
      if (month > 0) {
        const newUsers = users * (metrics.monthlyGrowthRate / 100);
        const churnedUsers = users * (metrics.churnRate / 100);
        users = users + newUsers - churnedUsers;
      }

      // Calculate MRR
      mrr = users * metrics.arpu;

      // Calculate costs
      const infraCost = calculateInfrastructureCost(users);
      const teamSize = calculateTeamSize(mrr);
      const teamCost = calculateTeamCost(teamSize, mrr);
      const totalCosts = infraCost + teamCost;

      // Calculate profit and runway
      const profit = mrr - totalCosts;
      const runway = profit > 0 ? 999 : mrr / totalCosts;

      results.push({
        month,
        users: Math.round(users),
        mrr: Math.round(mrr),
        costs: Math.round(totalCosts),
        profit: Math.round(profit),
        teamSize,
        runway: Math.round(runway),
      });
    }

    return results;
  }, [metrics, projectionMonths]);

  // Calculate milestones
  const milestones = useMemo(() => {
    const targetUsers = [1000, 10000, 100000];
    const targetMRR = [10000, 50000, 100000, 500000, 1000000];

    const results: Milestone[] = [];

    // User milestones
    targetUsers.forEach(target => {
      const projection = projections.find(p => p.users >= target);
      if (projection && projection.users < metrics.currentUsers + target * 2) {
        results.push({
          name: `${formatNumber(target)} Users`,
          users: projection.users,
          mrr: projection.mrr,
          monthsAway: projection.month,
          requiredTeamSize: projection.teamSize,
          monthlyCost: projection.costs,
          recommendations: getMilestoneRecommendations(target, projection.mrr),
        });
      }
    });

    // MRR milestones
    targetMRR.forEach(target => {
      if (target > metrics.currentMRR) {
        const projection = projections.find(p => p.mrr >= target);
        if (projection && projection.month <= projectionMonths) {
          const existingMilestone = results.find(m => m.monthsAway === projection.month);
          if (!existingMilestone) {
            results.push({
              name: `${formatCurrency(target)} MRR`,
              users: projection.users,
              mrr: projection.mrr,
              monthsAway: projection.month,
              requiredTeamSize: projection.teamSize,
              monthlyCost: projection.costs,
              recommendations: getMilestoneRecommendations(projection.users, target),
            });
          }
        }
      }
    });

    return results.sort((a, b) => a.monthsAway - b.monthsAway);
  }, [projections, metrics.currentMRR, projectionMonths]);

  // Get recommendations for milestone
  const getMilestoneRecommendations = (users: number, mrr: number): string[] => {
    const recommendations: string[] = [];

    if (users >= 1000 && users < 10000) {
      recommendations.push('Focus on one acquisition channel');
      recommendations.push('Implement automated onboarding');
      recommendations.push('Set up analytics and monitoring');
    } else if (users >= 10000 && users < 100000) {
      recommendations.push('Build dedicated support team');
      recommendations.push('Implement advanced caching');
      recommendations.push('Consider database read replicas');
    } else if (users >= 100000) {
      recommendations.push('Multi-region infrastructure');
      recommendations.push('Dedicated DevOps engineer');
      recommendations.push('Enterprise sales motion');
    }

    if (mrr >= 10000 && mrr < 50000) {
      recommendations.push('Make first technical hire');
      recommendations.push('Implement revenue analytics');
    } else if (mrr >= 50000 && mrr < 100000) {
      recommendations.push('Hire customer success manager');
      recommendations.push('Add annual billing options');
    } else if (mrr >= 100000 && mrr < 500000) {
      recommendations.push('Build engineering team (3-5 people)');
      recommendations.push('Introduce enterprise tier');
    } else if (mrr >= 500000) {
      recommendations.push('Hire senior leadership');
      recommendations.push('Focus on operational excellence');
    }

    return recommendations;
  };

  // Get next hire recommendation
  const nextHire = useMemo(() => {
    const currentMRR = projections[0].mrr;
    return HIRING_ROADMAP.find(h => currentMRR < h.mrr);
  }, [projections]);

  // Handle input changes
  const updateMetric = (key: keyof Metrics, value: number) => {
    setMetrics(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="scaling-calculator">
      <style>{`
        .scaling-calculator {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          color: #1a1a1a;
        }

        .header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .header h1 {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: #0066cc;
        }

        .header p {
          font-size: 1.1rem;
          color: #666;
        }

        .input-section {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 2rem;
          margin-bottom: 2rem;
        }

        .input-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .input-group {
          display: flex;
          flex-direction: column;
        }

        .input-group label {
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #333;
        }

        .input-group input {
          padding: 0.75rem;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.2s;
        }

        .input-group input:focus {
          outline: none;
          border-color: #0066cc;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .metric-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .metric-label {
          font-size: 0.875rem;
          color: #666;
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .metric-value {
          font-size: 2rem;
          font-weight: 700;
          color: #0066cc;
        }

        .metric-change {
          font-size: 0.875rem;
          margin-top: 0.5rem;
          color: #28a745;
        }

        .metric-change.negative {
          color: #dc3545;
        }

        .chart-section {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .chart-section h2 {
          margin-bottom: 1.5rem;
          color: #333;
        }

        .projection-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9rem;
        }

        .projection-table th {
          background: #f8f9fa;
          padding: 0.75rem;
          text-align: left;
          font-weight: 600;
          border-bottom: 2px solid #e0e0e0;
        }

        .projection-table td {
          padding: 0.75rem;
          border-bottom: 1px solid #e0e0e0;
        }

        .projection-table tr:hover {
          background: #f8f9fa;
        }

        .milestones-section {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .milestone-card {
          background: #f8f9fa;
          border-left: 4px solid #0066cc;
          padding: 1.5rem;
          margin-bottom: 1rem;
          border-radius: 8px;
        }

        .milestone-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .milestone-name {
          font-size: 1.25rem;
          font-weight: 700;
          color: #0066cc;
        }

        .milestone-timeline {
          background: #0066cc;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-weight: 600;
        }

        .milestone-metrics {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .milestone-metric {
          display: flex;
          flex-direction: column;
        }

        .milestone-metric-label {
          font-size: 0.75rem;
          color: #666;
          text-transform: uppercase;
        }

        .milestone-metric-value {
          font-size: 1.1rem;
          font-weight: 600;
          color: #333;
        }

        .recommendations {
          margin-top: 1rem;
        }

        .recommendations h4 {
          font-size: 0.875rem;
          color: #666;
          margin-bottom: 0.5rem;
          text-transform: uppercase;
        }

        .recommendations ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .recommendations li {
          padding: 0.5rem 0;
          padding-left: 1.5rem;
          position: relative;
        }

        .recommendations li:before {
          content: "→";
          position: absolute;
          left: 0;
          color: #0066cc;
          font-weight: 700;
        }

        .hiring-section {
          background: #e8f4f8;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .hiring-card {
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 1rem;
        }

        .hiring-role {
          font-size: 1.25rem;
          font-weight: 700;
          color: #0066cc;
          margin-bottom: 0.5rem;
        }

        .hiring-details {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin-top: 1rem;
        }

        .alert {
          background: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 1rem;
          border-radius: 8px;
          margin-top: 1rem;
        }

        .alert.success {
          background: #d4edda;
          border-left-color: #28a745;
        }

        .alert.danger {
          background: #f8d7da;
          border-left-color: #dc3545;
        }

        @media (max-width: 768px) {
          .scaling-calculator {
            padding: 1rem;
          }

          .header h1 {
            font-size: 1.75rem;
          }

          .input-grid {
            grid-template-columns: 1fr;
          }

          .metrics-grid {
            grid-template-columns: 1fr;
          }

          .milestone-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }
        }
      `}</style>

      {/* Header */}
      <div className="header">
        <h1>HermeticSaaS Scaling Calculator</h1>
        <p>Model your growth, plan your resources, scale with confidence</p>
      </div>

      {/* Input Section */}
      <div className="input-section">
        <h2>Current Metrics</h2>
        <div className="input-grid">
          <div className="input-group">
            <label htmlFor="currentUsers">Current Users</label>
            <input
              id="currentUsers"
              type="number"
              value={metrics.currentUsers}
              onChange={e => updateMetric('currentUsers', Number(e.target.value))}
              min="0"
            />
          </div>

          <div className="input-group">
            <label htmlFor="currentMRR">Current MRR ($)</label>
            <input
              id="currentMRR"
              type="number"
              value={metrics.currentMRR}
              onChange={e => updateMetric('currentMRR', Number(e.target.value))}
              min="0"
            />
          </div>

          <div className="input-group">
            <label htmlFor="monthlyGrowthRate">Monthly Growth Rate (%)</label>
            <input
              id="monthlyGrowthRate"
              type="number"
              value={metrics.monthlyGrowthRate}
              onChange={e => updateMetric('monthlyGrowthRate', Number(e.target.value))}
              min="0"
              max="100"
              step="0.1"
            />
          </div>

          <div className="input-group">
            <label htmlFor="churnRate">Monthly Churn Rate (%)</label>
            <input
              id="churnRate"
              type="number"
              value={metrics.churnRate}
              onChange={e => updateMetric('churnRate', Number(e.target.value))}
              min="0"
              max="100"
              step="0.1"
            />
          </div>

          <div className="input-group">
            <label htmlFor="arpu">ARPU ($/user/month)</label>
            <input
              id="arpu"
              type="number"
              value={metrics.arpu}
              onChange={e => updateMetric('arpu', Number(e.target.value))}
              min="0"
              step="0.01"
            />
          </div>

          <div className="input-group">
            <label htmlFor="projectionMonths">Projection Period (months)</label>
            <input
              id="projectionMonths"
              type="number"
              value={projectionMonths}
              onChange={e => setProjectionMonths(Number(e.target.value))}
              min="1"
              max="36"
            />
          </div>
        </div>
      </div>

      {/* Current Status */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Current Users</div>
          <div className="metric-value">{formatNumber(metrics.currentUsers)}</div>
          <div className="metric-change">
            Net Growth: {(metrics.monthlyGrowthRate - metrics.churnRate).toFixed(1)}%/mo
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Current MRR</div>
          <div className="metric-value">{formatCurrency(metrics.currentMRR)}</div>
          <div className="metric-change">
            ARR: {formatCurrency(metrics.currentMRR * 12)}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Revenue per User</div>
          <div className="metric-value">{formatCurrency(metrics.arpu)}</div>
          <div className="metric-change">
            {metrics.arpu > 100 ? 'Enterprise-ready' : metrics.arpu > 50 ? 'Mid-market' : 'SMB pricing'}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Current Team Size</div>
          <div className="metric-value">{projections[0].teamSize}</div>
          <div className="metric-change">
            Revenue per employee: {formatCurrency(metrics.currentMRR / projections[0].teamSize)}
          </div>
        </div>
      </div>

      {/* Health Check */}
      {metrics.churnRate > 7 && (
        <div className="alert danger">
          <strong>Warning:</strong> Your churn rate ({metrics.churnRate}%) is high. Focus on retention before scaling acquisition.
        </div>
      )}

      {metrics.currentMRR / projections[0].teamSize < 5000 && projections[0].teamSize > 1 && (
        <div className="alert danger">
          <strong>Warning:</strong> Revenue per employee is low ({formatCurrency(metrics.currentMRR / projections[0].teamSize)}/mo).
          Consider automation before hiring more.
        </div>
      )}

      {metrics.monthlyGrowthRate - metrics.churnRate < 5 && (
        <div className="alert">
          <strong>Note:</strong> Net growth rate is low. Consider focusing on either acquisition OR retention.
        </div>
      )}

      {/* Projections Table */}
      <div className="chart-section">
        <h2>12-Month Projection</h2>
        <div style={{ overflowX: 'auto' }}>
          <table className="projection-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Users</th>
                <th>MRR</th>
                <th>Costs</th>
                <th>Profit</th>
                <th>Team Size</th>
                <th>Margin</th>
              </tr>
            </thead>
            <tbody>
              {projections.slice(0, 13).map(p => (
                <tr key={p.month}>
                  <td>{p.month === 0 ? 'Today' : `Month ${p.month}`}</td>
                  <td>{formatNumber(p.users)}</td>
                  <td>{formatCurrency(p.mrr)}</td>
                  <td>{formatCurrency(p.costs)}</td>
                  <td style={{ color: p.profit > 0 ? '#28a745' : '#dc3545', fontWeight: 600 }}>
                    {formatCurrency(p.profit)}
                  </td>
                  <td>{p.teamSize}</td>
                  <td>{((p.profit / p.mrr) * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Milestones */}
      {milestones.length > 0 && (
        <div className="milestones-section">
          <h2>Growth Milestones</h2>
          {milestones.map((milestone, idx) => (
            <div key={idx} className="milestone-card">
              <div className="milestone-header">
                <div className="milestone-name">{milestone.name}</div>
                <div className="milestone-timeline">
                  {milestone.monthsAway === 0 ? 'Today' :
                   milestone.monthsAway === 1 ? '1 month' :
                   `${milestone.monthsAway} months`}
                </div>
              </div>

              <div className="milestone-metrics">
                <div className="milestone-metric">
                  <span className="milestone-metric-label">Users</span>
                  <span className="milestone-metric-value">{formatNumber(milestone.users)}</span>
                </div>
                <div className="milestone-metric">
                  <span className="milestone-metric-label">MRR</span>
                  <span className="milestone-metric-value">{formatCurrency(milestone.mrr)}</span>
                </div>
                <div className="milestone-metric">
                  <span className="milestone-metric-label">Team Size</span>
                  <span className="milestone-metric-value">{milestone.requiredTeamSize}</span>
                </div>
                <div className="milestone-metric">
                  <span className="milestone-metric-label">Monthly Cost</span>
                  <span className="milestone-metric-value">{formatCurrency(milestone.monthlyCost)}</span>
                </div>
              </div>

              {milestone.recommendations.length > 0 && (
                <div className="recommendations">
                  <h4>Recommendations</h4>
                  <ul>
                    {milestone.recommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Next Hire */}
      {nextHire && (
        <div className="hiring-section">
          <h2>Next Hire Recommendation</h2>
          <div className="hiring-card">
            <div className="hiring-role">{nextHire.role}</div>
            <p>Recommended when you reach {formatCurrency(nextHire.mrr)} MRR</p>

            <div className="hiring-details">
              <div>
                <strong>Expected Salary:</strong> {formatCurrency(nextHire.salary)}/year
              </div>
              <div>
                <strong>Monthly Cost:</strong> {formatCurrency(nextHire.salary / 12)}
              </div>
              <div>
                <strong>Months Away:</strong> {
                  projections.find(p => p.mrr >= nextHire.mrr)?.month || 'Beyond projection'
                }
              </div>
              <div>
                <strong>Revenue Impact:</strong> Should increase MRR by 20-50%
              </div>
            </div>
          </div>

          <div className="alert success">
            <strong>Pro Tip:</strong> Start as contractor for 3 months before converting to full-time.
            This reduces risk and allows both parties to validate fit.
          </div>
        </div>
      )}
    </div>
  );
}
