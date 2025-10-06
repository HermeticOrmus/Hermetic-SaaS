/**
 * MRR/ARR Tracking Dashboard
 *
 * Real-time revenue metrics and growth tracking for SaaS businesses.
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RevenueMetrics {
  mrr: number;
  arr: number;
  growth: {
    mrr: number;
    arr: number;
  };
  breakdown: {
    newMrr: number;
    expansionMrr: number;
    contractionMrr: number;
    churnedMrr: number;
  };
  ltv: number;
  cac: number;
  ltvCacRatio: number;
}

interface CustomerMetrics {
  total: number;
  new: number;
  churned: number;
  churnRate: number;
  arpu: number;
}

interface SubscriptionBreakdown {
  plan: string;
  customers: number;
  mrr: number;
  percentage: number;
}

export function MRRDashboard() {
  const [metrics, setMetrics] = useState<RevenueMetrics | null>(null);
  const [customers, setCustomers] = useState<CustomerMetrics | null>(null);
  const [breakdown, setBreakdown] = useState<SubscriptionBreakdown[]>([]);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  async function fetchDashboardData() {
    const response = await fetch(`/api/analytics/revenue?range=${timeRange}`);
    const data = await response.json();

    setMetrics(data.metrics);
    setCustomers(data.customers);
    setBreakdown(data.breakdown);
    setHistoricalData(data.historical);
  }

  if (!metrics || !customers) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Revenue Dashboard</h1>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as any)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="1y">Last year</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Monthly Recurring Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${metrics.mrr.toLocaleString()}
            </div>
            <div className={`text-sm mt-1 ${metrics.growth.mrr >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {metrics.growth.mrr >= 0 ? '+' : ''}{metrics.growth.mrr.toFixed(1)}% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Annual Recurring Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${metrics.arr.toLocaleString()}
            </div>
            <div className={`text-sm mt-1 ${metrics.growth.arr >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {metrics.growth.arr >= 0 ? '+' : ''}{metrics.growth.arr.toFixed(1)}% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {customers.total.toLocaleString()}
            </div>
            <div className="text-sm mt-1 text-gray-600">
              +{customers.new} new, -{customers.churned} churned
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              LTV:CAC Ratio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {metrics.ltvCacRatio.toFixed(1)}:1
            </div>
            <div className="text-sm mt-1 text-gray-600">
              LTV: ${metrics.ltv} / CAC: ${metrics.cac}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MRR Movement */}
      <Card>
        <CardHeader>
          <CardTitle>MRR Movement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <div className="text-sm text-gray-600">New MRR</div>
              <div className="text-2xl font-bold text-green-600">
                +${metrics.breakdown.newMrr.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Expansion MRR</div>
              <div className="text-2xl font-bold text-blue-600">
                +${metrics.breakdown.expansionMrr.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Contraction MRR</div>
              <div className="text-2xl font-bold text-orange-600">
                -${metrics.breakdown.contractionMrr.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Churned MRR</div>
              <div className="text-2xl font-bold text-red-600">
                -${metrics.breakdown.churnedMrr.toLocaleString()}
              </div>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="newMrr" fill="#10b981" name="New MRR" />
              <Bar dataKey="expansionMrr" fill="#3b82f6" name="Expansion MRR" />
              <Bar dataKey="contractionMrr" fill="#f97316" name="Contraction MRR" />
              <Bar dataKey="churnedMrr" fill="#ef4444" name="Churned MRR" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* MRR Trend */}
      <Card>
        <CardHeader>
          <CardTitle>MRR Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="mrr" stroke="#8b5cf6" strokeWidth={2} name="MRR" />
              <Line type="monotone" dataKey="customers" stroke="#06b6d4" strokeWidth={2} name="Customers" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Plan Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Plan Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {breakdown.map((plan) => (
              <div key={plan.plan}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-medium">{plan.plan}</div>
                    <div className="text-sm text-gray-600">
                      {plan.customers} customers
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">${plan.mrr.toLocaleString()}/mo</div>
                    <div className="text-sm text-gray-600">
                      {plan.percentage.toFixed(1)}% of total
                    </div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: `${plan.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Average Revenue Per User
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${customers.arpu.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Monthly Churn Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {customers.churnRate.toFixed(2)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Customer Lifetime Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${metrics.ltv.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/**
 * API endpoint for revenue analytics
 */
export async function getRevenueAnalytics(timeRange: string) {
  // This would query your database for actual data
  // Example implementation with Supabase

  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Calculate date range
  const endDate = new Date();
  const startDate = new Date();

  switch (timeRange) {
    case '7d': startDate.setDate(endDate.getDate() - 7); break;
    case '30d': startDate.setDate(endDate.getDate() - 30); break;
    case '90d': startDate.setDate(endDate.getDate() - 90); break;
    case '1y': startDate.setFullYear(endDate.getFullYear() - 1); break;
  }

  // Fetch subscription data
  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('*')
    .gte('created_at', startDate.toISOString());

  // Calculate metrics (simplified example)
  const activeSubscriptions = subscriptions?.filter(s => s.status === 'active') || [];
  const mrr = activeSubscriptions.reduce((sum, s) => sum + s.monthly_amount, 0);

  return {
    metrics: {
      mrr,
      arr: mrr * 12,
      growth: { mrr: 5.2, arr: 5.2 },
      breakdown: {
        newMrr: mrr * 0.15,
        expansionMrr: mrr * 0.05,
        contractionMrr: mrr * 0.02,
        churnedMrr: mrr * 0.03,
      },
      ltv: 5000,
      cac: 500,
      ltvCacRatio: 10,
    },
    customers: {
      total: activeSubscriptions.length,
      new: 10,
      churned: 2,
      churnRate: 2.5,
      arpu: mrr / activeSubscriptions.length || 0,
    },
    breakdown: [
      { plan: 'Starter', customers: 50, mrr: 1000, percentage: 20 },
      { plan: 'Pro', customers: 30, mrr: 3000, percentage: 60 },
      { plan: 'Enterprise', customers: 5, mrr: 1000, percentage: 20 },
    ],
    historical: [], // Generate historical data
  };
}
