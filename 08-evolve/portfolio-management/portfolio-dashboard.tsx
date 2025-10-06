import React, { useState, useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { calculateProductHealth, getHealthCategory, getRecommendation } from './product-health-scorer';
import {
  calculatePortfolioMetrics,
  calculateOpportunityCost,
  optimizeResourceAllocation,
  assessRisk
} from './portfolio-analytics';

// Types
interface Product {
  id: string;
  name: string;
  mrr: number;
  mrrGrowthRate: number; // Percentage
  customers: number;
  churn: number; // Percentage
  cac: number;
  ltv: number;
  supportHoursPerWeek: number;
  techDebtScore: number; // 0-100
  uptime: number; // Percentage
  monthlyData: MonthlyData[];
  launchedDate: string;
  category: string;
}

interface MonthlyData {
  month: string;
  mrr: number;
  customers: number;
  churn: number;
}

interface HealthScore {
  overall: number;
  revenue: number;
  growth: number;
  retention: number;
  efficiency: number;
  technical: number;
}

// Sample data - in production, fetch from your API
const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'TaskFlow Pro',
    mrr: 12500,
    mrrGrowthRate: 15,
    customers: 450,
    churn: 3.5,
    cac: 85,
    ltv: 850,
    supportHoursPerWeek: 8,
    techDebtScore: 25,
    uptime: 99.8,
    category: 'Productivity',
    launchedDate: '2023-06-01',
    monthlyData: [
      { month: 'Apr', mrr: 9500, customers: 380, churn: 4.2 },
      { month: 'May', mrr: 10800, customers: 410, churn: 3.8 },
      { month: 'Jun', mrr: 12500, customers: 450, churn: 3.5 },
    ]
  },
  {
    id: '2',
    name: 'FormBuilder',
    mrr: 4200,
    mrrGrowthRate: 8,
    customers: 180,
    churn: 5.2,
    cac: 45,
    ltv: 420,
    supportHoursPerWeek: 12,
    techDebtScore: 55,
    uptime: 99.2,
    category: 'Forms',
    launchedDate: '2022-03-15',
    monthlyData: [
      { month: 'Apr', mrr: 3600, customers: 165, churn: 5.8 },
      { month: 'May', mrr: 3900, customers: 172, churn: 5.5 },
      { month: 'Jun', mrr: 4200, customers: 180, churn: 5.2 },
    ]
  },
  {
    id: '3',
    name: 'APIMonitor',
    mrr: 8900,
    mrrGrowthRate: 22,
    customers: 220,
    churn: 2.8,
    cac: 120,
    ltv: 1250,
    supportHoursPerWeek: 5,
    techDebtScore: 15,
    uptime: 99.95,
    category: 'Developer Tools',
    launchedDate: '2024-01-10',
    monthlyData: [
      { month: 'Apr', mrr: 6000, customers: 160, churn: 3.5 },
      { month: 'May', mrr: 7300, customers: 190, churn: 3.0 },
      { month: 'Jun', mrr: 8900, customers: 220, churn: 2.8 },
    ]
  },
  {
    id: '4',
    name: 'EmailSequencer',
    mrr: 1800,
    mrrGrowthRate: -2,
    customers: 95,
    churn: 8.5,
    cac: 65,
    ltv: 180,
    supportHoursPerWeek: 15,
    techDebtScore: 75,
    uptime: 98.5,
    category: 'Marketing',
    launchedDate: '2021-09-01',
    monthlyData: [
      { month: 'Apr', mrr: 2100, customers: 105, churn: 7.8 },
      { month: 'May', mrr: 1950, customers: 100, churn: 8.2 },
      { month: 'Jun', mrr: 1800, customers: 95, churn: 8.5 },
    ]
  }
];

const COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  purple: '#8b5cf6',
  teal: '#14b8a6',
  pink: '#ec4899',
};

const HEALTH_COLORS = {
  excellent: '#10b981',
  good: '#3b82f6',
  fair: '#f59e0b',
  poor: '#ef4444',
};

export default function PortfolioDashboard() {
  const [products, setProducts] = useState<Product[]>(sampleProducts);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'month' | 'quarter' | 'year'>('month');
  const [view, setView] = useState<'overview' | 'detailed' | 'allocation'>('overview');

  // Calculate metrics
  const portfolioMetrics = useMemo(() =>
    calculatePortfolioMetrics(products), [products]
  );

  const productHealthScores = useMemo(() =>
    products.map(product => ({
      product,
      health: calculateProductHealth(product),
      category: getHealthCategory(calculateProductHealth(product).overall),
      recommendation: getRecommendation(product)
    })), [products]
  );

  const riskAssessment = useMemo(() =>
    assessRisk(products), [products]
  );

  const resourceAllocation = useMemo(() =>
    optimizeResourceAllocation(products), [products]
  );

  // Format currency
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  const formatPercent = (value: number) =>
    `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Portfolio Dashboard
          </h1>
          <p className="text-gray-600">
            Monitor and optimize your MicroSaaS portfolio
          </p>
        </div>

        {/* View Selector */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setView('overview')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              view === 'overview'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setView('detailed')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              view === 'detailed'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Detailed Analysis
          </button>
          <button
            onClick={() => setView('allocation')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              view === 'allocation'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Resource Allocation
          </button>
        </div>

        {view === 'overview' && (
          <>
            {/* Portfolio Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <SummaryCard
                title="Total MRR"
                value={formatCurrency(portfolioMetrics.totalMRR)}
                change={formatPercent(portfolioMetrics.weightedGrowthRate)}
                positive={portfolioMetrics.weightedGrowthRate > 0}
                icon="💰"
              />
              <SummaryCard
                title="Total ARR"
                value={formatCurrency(portfolioMetrics.totalARR)}
                subtitle={`${products.length} Products`}
                icon="📈"
              />
              <SummaryCard
                title="Portfolio Health"
                value={`${portfolioMetrics.portfolioHealthScore.toFixed(0)}/100`}
                subtitle={getHealthCategory(portfolioMetrics.portfolioHealthScore)}
                positive={portfolioMetrics.portfolioHealthScore > 70}
                icon="❤️"
              />
              <SummaryCard
                title="Diversification"
                value={`${(portfolioMetrics.diversificationScore * 100).toFixed(0)}/100`}
                subtitle={riskAssessment.riskLevel}
                positive={portfolioMetrics.diversificationScore > 0.5}
                icon="🎯"
              />
            </div>

            {/* Products Grid with Health Scores */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Product Performance
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {productHealthScores
                  .sort((a, b) => b.health.overall - a.health.overall)
                  .map(({ product, health, category, recommendation }) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      health={health}
                      category={category}
                      recommendation={recommendation}
                      onClick={() => setSelectedProduct(product.id)}
                    />
                  ))}
              </div>
            </div>

            {/* Portfolio Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Revenue Distribution */}
              <ChartCard title="Revenue Distribution">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={products.map(p => ({
                        name: p.name,
                        value: p.mrr
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {products.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={Object.values(COLORS)[index % Object.values(COLORS).length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Growth Comparison */}
              <ChartCard title="Growth Rate Comparison">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={products.map(p => ({
                      name: p.name,
                      growth: p.mrrGrowthRate
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Bar dataKey="growth" fill={COLORS.primary}>
                      {products.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.mrrGrowthRate > 0 ? COLORS.success : COLORS.danger}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* MRR Trend */}
              <ChartCard title="MRR Trend (Combined)">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={products[0].monthlyData.map((_, idx) => ({
                      month: products[0].monthlyData[idx].month,
                      ...products.reduce((acc, product) => ({
                        ...acc,
                        [product.name]: product.monthlyData[idx]?.mrr || 0
                      }), {})
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                    {products.map((product, index) => (
                      <Line
                        key={product.id}
                        type="monotone"
                        dataKey={product.name}
                        stroke={Object.values(COLORS)[index % Object.values(COLORS).length]}
                        strokeWidth={2}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Health Score Radar */}
              <ChartCard title="Health Score Comparison">
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart
                    data={[
                      { metric: 'Revenue', ...products.reduce((acc, p, i) => ({
                        ...acc,
                        [p.name]: calculateProductHealth(p).revenue
                      }), {}) },
                      { metric: 'Growth', ...products.reduce((acc, p) => ({
                        ...acc,
                        [p.name]: calculateProductHealth(p).growth
                      }), {}) },
                      { metric: 'Retention', ...products.reduce((acc, p) => ({
                        ...acc,
                        [p.name]: calculateProductHealth(p).retention
                      }), {}) },
                      { metric: 'Efficiency', ...products.reduce((acc, p) => ({
                        ...acc,
                        [p.name]: calculateProductHealth(p).efficiency
                      }), {}) },
                      { metric: 'Technical', ...products.reduce((acc, p) => ({
                        ...acc,
                        [p.name]: calculateProductHealth(p).technical
                      }), {}) },
                    ]}
                  >
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    {products.map((product, index) => (
                      <Radar
                        key={product.id}
                        name={product.name}
                        dataKey={product.name}
                        stroke={Object.values(COLORS)[index % Object.values(COLORS).length]}
                        fill={Object.values(COLORS)[index % Object.values(COLORS).length]}
                        fillOpacity={0.3}
                      />
                    ))}
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            {/* Risk Assessment */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Risk Assessment
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Risk Level</div>
                  <div className={`text-2xl font-bold ${
                    riskAssessment.riskLevel === 'Low' ? 'text-green-600' :
                    riskAssessment.riskLevel === 'Medium' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {riskAssessment.riskLevel}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Concentration Risk</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {(riskAssessment.concentrationRisk * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {riskAssessment.topProductShare.toFixed(0)}% in top product
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Recommendations</div>
                  <ul className="text-sm space-y-1">
                    {riskAssessment.recommendations.slice(0, 3).map((rec, idx) => (
                      <li key={idx} className="text-gray-700">• {rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}

        {view === 'detailed' && (
          <DetailedAnalysis
            products={products}
            productHealthScores={productHealthScores}
          />
        )}

        {view === 'allocation' && (
          <ResourceAllocationView
            products={products}
            allocation={resourceAllocation}
          />
        )}
      </div>
    </div>
  );
}

// Component: Summary Card
function SummaryCard({
  title,
  value,
  change,
  subtitle,
  positive,
  icon
}: {
  title: string;
  value: string;
  change?: string;
  subtitle?: string;
  positive?: boolean;
  icon: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium text-gray-600">{title}</div>
        <div className="text-2xl">{icon}</div>
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      {change && (
        <div className={`text-sm font-medium ${
          positive ? 'text-green-600' : 'text-red-600'
        }`}>
          {change}
        </div>
      )}
      {subtitle && (
        <div className="text-sm text-gray-500">{subtitle}</div>
      )}
    </div>
  );
}

// Component: Product Card
function ProductCard({
  product,
  health,
  category,
  recommendation,
  onClick
}: {
  product: Product;
  health: HealthScore;
  category: string;
  recommendation: any;
  onClick: () => void;
}) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(value);

  return (
    <div
      className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{product.name}</h3>
          <div className="text-sm text-gray-500">{product.category}</div>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          category === 'Excellent' ? 'bg-green-100 text-green-800' :
          category === 'Good' ? 'bg-blue-100 text-blue-800' :
          category === 'Fair' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {health.overall.toFixed(0)}/100
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-sm text-gray-600">MRR</div>
          <div className="text-lg font-bold text-gray-900">
            {formatCurrency(product.mrr)}
          </div>
          <div className={`text-xs font-medium ${
            product.mrrGrowthRate > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {product.mrrGrowthRate > 0 ? '+' : ''}{product.mrrGrowthRate}% growth
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Customers</div>
          <div className="text-lg font-bold text-gray-900">
            {product.customers}
          </div>
          <div className="text-xs text-gray-500">
            {product.churn}% churn
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">LTV:CAC</span>
          <span className={`font-medium ${
            product.ltv / product.cac > 3 ? 'text-green-600' :
            product.ltv / product.cac > 2 ? 'text-yellow-600' :
            'text-red-600'
          }`}>
            {(product.ltv / product.cac).toFixed(1)}:1
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Support Load</span>
          <span className="font-medium text-gray-900">
            {product.supportHoursPerWeek}h/week
          </span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-sm font-medium text-gray-900 mb-2">
          Strategy: {recommendation.strategy}
        </div>
        <div className="text-xs text-gray-600">
          {recommendation.primaryAction}
        </div>
      </div>
    </div>
  );
}

// Component: Chart Card
function ChartCard({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
      {children}
    </div>
  );
}

// Component: Detailed Analysis View
function DetailedAnalysis({
  products,
  productHealthScores
}: {
  products: Product[];
  productHealthScores: any[];
}) {
  return (
    <div className="space-y-6">
      {productHealthScores.map(({ product, health, category, recommendation }) => (
        <div key={product.id} className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
              <div className="text-gray-600">{product.category}</div>
            </div>
            <div className={`px-4 py-2 rounded-full text-lg font-bold ${
              category === 'Excellent' ? 'bg-green-100 text-green-800' :
              category === 'Good' ? 'bg-blue-100 text-blue-800' :
              category === 'Fair' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {health.overall.toFixed(0)}/100 - {category}
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <MetricItem label="MRR" value={`$${product.mrr.toLocaleString()}`} />
            <MetricItem label="ARR" value={`$${(product.mrr * 12).toLocaleString()}`} />
            <MetricItem label="Customers" value={product.customers.toString()} />
            <MetricItem label="Churn" value={`${product.churn}%`} />
            <MetricItem label="LTV" value={`$${product.ltv}`} />
            <MetricItem label="CAC" value={`$${product.cac}`} />
            <MetricItem label="LTV:CAC" value={`${(product.ltv / product.cac).toFixed(1)}:1`} />
            <MetricItem label="Uptime" value={`${product.uptime}%`} />
          </div>

          {/* Health Score Breakdown */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Health Score Breakdown</h3>
            <div className="space-y-3">
              <HealthBar label="Revenue Health" score={health.revenue} />
              <HealthBar label="Growth Health" score={health.growth} />
              <HealthBar label="Retention Health" score={health.retention} />
              <HealthBar label="Efficiency Health" score={health.efficiency} />
              <HealthBar label="Technical Health" score={health.technical} />
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Recommended Strategy: {recommendation.strategy}
            </h3>
            <div className="text-gray-700 mb-3">
              <strong>Primary Action:</strong> {recommendation.primaryAction}
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-900">Action Items:</div>
              <ul className="text-sm text-gray-700 space-y-1">
                {recommendation.actions.map((action: string, idx: number) => (
                  <li key={idx}>• {action}</li>
                ))}
              </ul>
            </div>
            {recommendation.warnings.length > 0 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <div className="text-sm font-medium text-yellow-900 mb-1">Warnings:</div>
                <ul className="text-sm text-yellow-800 space-y-1">
                  {recommendation.warnings.map((warning: string, idx: number) => (
                    <li key={idx}>⚠️ {warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// Component: Metric Item
function MetricItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-sm text-gray-600">{label}</div>
      <div className="text-lg font-bold text-gray-900">{value}</div>
    </div>
  );
}

// Component: Health Bar
function HealthBar({ label, score }: { label: string; score: number }) {
  const color =
    score >= 80 ? 'bg-green-500' :
    score >= 60 ? 'bg-blue-500' :
    score >= 40 ? 'bg-yellow-500' :
    'bg-red-500';

  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-gray-700">{label}</span>
        <span className="font-medium text-gray-900">{score.toFixed(0)}/100</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${color} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

// Component: Resource Allocation View
function ResourceAllocationView({
  products,
  allocation
}: {
  products: Product[];
  allocation: any;
}) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Optimized Time Allocation
        </h2>
        <p className="text-gray-600 mb-6">
          Based on ROI potential and product health, here's how you should allocate your time:
        </p>

        <div className="space-y-4">
          {allocation.recommendations.map((rec: any, idx: number) => (
            <div key={idx} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{rec.product}</h3>
                  <div className="text-sm text-gray-600">
                    Current: {rec.currentHours}h/week → Recommended: {rec.recommendedHours}h/week
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  rec.change > 0 ? 'bg-green-100 text-green-800' :
                  rec.change < 0 ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {rec.change > 0 ? '+' : ''}{rec.change}h
                </div>
              </div>
              <div className="text-sm text-gray-700 mb-2">
                <strong>Rationale:</strong> {rec.rationale}
              </div>
              <div className="text-sm text-gray-600">
                Expected ROI: ${rec.expectedROI.toLocaleString()}/month
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Opportunity Cost Analysis
        </h2>
        <div className="space-y-4">
          {products.map(product => {
            const oc = calculateOpportunityCost(
              product,
              products.filter(p => p.id !== product.id)
            );
            return (
              <div key={product.id} className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{product.name}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Current ROI</div>
                    <div className="text-lg font-bold text-gray-900">
                      ${oc.currentROI.toLocaleString()}/month
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Opportunity Cost</div>
                    <div className={`text-lg font-bold ${
                      oc.opportunityCost > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      ${Math.abs(oc.opportunityCost).toLocaleString()}/month
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-sm text-gray-700">
                  {oc.recommendation}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
