/**
 * Uptime and Infrastructure Monitoring
 *
 * Multi-provider health checks and status page management.
 * Supports BetterUptime, UptimeRobot, and custom health checks.
 */

interface HealthCheck {
  name: string;
  url: string;
  method: 'GET' | 'POST';
  interval: number; // in seconds
  timeout: number; // in seconds
  expectedStatus: number;
  expectedBody?: string;
  headers?: Record<string, string>;
}

interface MonitorConfig {
  provider: 'betteruptime' | 'uptimerobot' | 'custom';
  apiKey?: string;
  checks: HealthCheck[];
}

/**
 * BetterUptime configuration
 */
export const betterUptimeConfig: MonitorConfig = {
  provider: 'betteruptime',
  apiKey: process.env.BETTERUPTIME_API_KEY,
  checks: [
    {
      name: 'Website Homepage',
      url: 'https://yoursaas.com',
      method: 'GET',
      interval: 60,
      timeout: 30,
      expectedStatus: 200,
    },
    {
      name: 'API Health',
      url: 'https://api.yoursaas.com/health',
      method: 'GET',
      interval: 30,
      timeout: 10,
      expectedStatus: 200,
      expectedBody: '{"status":"healthy"}',
    },
    {
      name: 'Authentication Service',
      url: 'https://api.yoursaas.com/api/auth/health',
      method: 'GET',
      interval: 60,
      timeout: 10,
      expectedStatus: 200,
    },
    {
      name: 'Database Connection',
      url: 'https://api.yoursaas.com/api/health/database',
      method: 'GET',
      interval: 120,
      timeout: 15,
      expectedStatus: 200,
    },
    {
      name: 'Stripe Webhook',
      url: 'https://api.yoursaas.com/api/webhooks/stripe',
      method: 'GET',
      interval: 300,
      timeout: 10,
      expectedStatus: 405, // Method not allowed is OK (endpoint exists)
    },
  ],
};

/**
 * Create BetterUptime monitor
 */
export async function createBetterUptimeMonitor(check: HealthCheck) {
  const response = await fetch('https://betteruptime.com/api/v2/monitors', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.BETTERUPTIME_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      monitor_type: 'status',
      url: check.url,
      monitor_group_id: null,
      pronounceable_name: check.name,
      check_frequency: check.interval,
      request_timeout: check.timeout,
      recovery_period: 0,
      verify_ssl: true,
      domain_expiration: 30,
      expected_status_codes: [check.expectedStatus],
      http_method: check.method,
      request_headers: check.headers || [],
    }),
  });

  return response.json();
}

/**
 * Health check endpoint implementation
 */
export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    database: boolean;
    cache: boolean;
    storage: boolean;
    email: boolean;
    payments: boolean;
  };
  metrics?: {
    responseTime: number;
    requestsPerMinute: number;
    errorRate: number;
    activeUsers: number;
  };
}

/**
 * Comprehensive health check
 */
export async function performHealthCheck(): Promise<HealthCheckResult> {
  const startTime = Date.now();

  const checks = {
    database: await checkDatabase(),
    cache: await checkCache(),
    storage: await checkStorage(),
    email: await checkEmail(),
    payments: await checkPayments(),
  };

  const allHealthy = Object.values(checks).every(check => check === true);
  const someHealthy = Object.values(checks).some(check => check === true);

  const status = allHealthy ? 'healthy' : someHealthy ? 'degraded' : 'unhealthy';

  return {
    status,
    timestamp: new Date().toISOString(),
    version: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || 'unknown',
    uptime: process.uptime(),
    checks,
    metrics: {
      responseTime: Date.now() - startTime,
      requestsPerMinute: await getRequestsPerMinute(),
      errorRate: await getErrorRate(),
      activeUsers: await getActiveUsers(),
    },
  };
}

/**
 * Individual service checks
 */
async function checkDatabase(): Promise<boolean> {
  try {
    // Example: Supabase health check
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase.from('_health_check').select('count').limit(1);
    return !error;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

async function checkCache(): Promise<boolean> {
  try {
    // Example: Redis/Upstash check
    if (!process.env.UPSTASH_REDIS_REST_URL) return true; // Optional service

    const response = await fetch(
      `${process.env.UPSTASH_REDIS_REST_URL}/ping`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
        },
      }
    );

    return response.ok;
  } catch (error) {
    console.error('Cache health check failed:', error);
    return false;
  }
}

async function checkStorage(): Promise<boolean> {
  try {
    // Example: Supabase Storage check
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase.storage.listBuckets();
    return !error;
  } catch (error) {
    console.error('Storage health check failed:', error);
    return false;
  }
}

async function checkEmail(): Promise<boolean> {
  try {
    // Example: Resend API check
    if (!process.env.RESEND_API_KEY) return true; // Optional service

    const response = await fetch('https://api.resend.com/domains', {
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      },
    });

    return response.ok;
  } catch (error) {
    console.error('Email health check failed:', error);
    return false;
  }
}

async function checkPayments(): Promise<boolean> {
  try {
    // Example: Stripe API check
    const response = await fetch('https://api.stripe.com/v1/balance', {
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      },
    });

    return response.ok;
  } catch (error) {
    console.error('Payments health check failed:', error);
    return false;
  }
}

/**
 * Metrics helpers
 */
async function getRequestsPerMinute(): Promise<number> {
  // Implement based on your analytics
  return 0;
}

async function getErrorRate(): Promise<number> {
  // Implement based on your error tracking
  return 0;
}

async function getActiveUsers(): Promise<number> {
  // Implement based on your user tracking
  return 0;
}

/**
 * Status page data
 */
export interface StatusPageData {
  status: 'operational' | 'degraded' | 'outage';
  services: {
    name: string;
    status: 'operational' | 'degraded' | 'outage';
    uptime: number; // percentage
  }[];
  incidents: {
    id: string;
    title: string;
    status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
    severity: 'minor' | 'major' | 'critical';
    createdAt: string;
    updates: {
      message: string;
      timestamp: string;
    }[];
  }[];
}

/**
 * Generate status page data
 */
export async function getStatusPageData(): Promise<StatusPageData> {
  const health = await performHealthCheck();

  return {
    status: health.status === 'healthy' ? 'operational' :
            health.status === 'degraded' ? 'degraded' : 'outage',
    services: [
      {
        name: 'Website',
        status: 'operational',
        uptime: 99.99,
      },
      {
        name: 'API',
        status: 'operational',
        uptime: 99.95,
      },
      {
        name: 'Database',
        status: health.checks.database ? 'operational' : 'outage',
        uptime: 99.99,
      },
      {
        name: 'Authentication',
        status: 'operational',
        uptime: 99.98,
      },
      {
        name: 'Payments',
        status: health.checks.payments ? 'operational' : 'degraded',
        uptime: 99.90,
      },
    ],
    incidents: [],
  };
}
