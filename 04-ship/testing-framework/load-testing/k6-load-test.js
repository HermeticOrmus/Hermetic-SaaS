// k6 Load Testing Script for HermeticSaaS APIs
// Tests API performance under various load conditions

import http from 'k6/http'
import { check, sleep } from 'k6'
import { Rate, Trend, Counter } from 'k6/metrics'

// Custom metrics
const errorRate = new Rate('errors')
const apiLatency = new Trend('api_latency')
const successfulRequests = new Counter('successful_requests')

// Configuration
export const options = {
  // Test stages
  stages: [
    { duration: '2m', target: 10 },   // Ramp up to 10 users
    { duration: '5m', target: 10 },   // Stay at 10 users
    { duration: '2m', target: 50 },   // Ramp up to 50 users
    { duration: '5m', target: 50 },   // Stay at 50 users
    { duration: '2m', target: 100 },  // Ramp up to 100 users
    { duration: '5m', target: 100 },  // Stay at 100 users
    { duration: '2m', target: 0 },    // Ramp down to 0 users
  ],

  // Thresholds
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.01'],    // Error rate should be below 1%
    errors: ['rate<0.1'],              // Custom error rate below 10%
  },

  // Test configuration
  noConnectionReuse: false,
  userAgent: 'K6LoadTest/1.0',
}

// Test data
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000'

// Setup function - runs once before the test
export function setup() {
  console.log('Starting load test...')
  console.log(`Target URL: ${BASE_URL}`)

  // Create test user and get auth token
  const loginRes = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
    email: 'test@example.com',
    password: 'testpassword123',
  }), {
    headers: { 'Content-Type': 'application/json' },
  })

  const authToken = loginRes.json('token')

  return { authToken }
}

// Main test function
export default function (data) {
  const { authToken } = data

  // Test 1: Homepage load
  const homepageRes = http.get(`${BASE_URL}/`)
  check(homepageRes, {
    'homepage status is 200': (r) => r.status === 200,
    'homepage loads in <2s': (r) => r.timings.duration < 2000,
  })
  apiLatency.add(homepageRes.timings.duration)

  sleep(1)

  // Test 2: API health check
  const healthRes = http.get(`${BASE_URL}/api/health`)
  const healthCheck = check(healthRes, {
    'health check is 200': (r) => r.status === 200,
    'health check has status': (r) => r.json('status') === 'ok',
  })

  if (!healthCheck) {
    errorRate.add(1)
  } else {
    successfulRequests.add(1)
  }

  sleep(1)

  // Test 3: Authenticated API request
  const headers = {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json',
  }

  const dashboardRes = http.get(`${BASE_URL}/api/dashboard`, { headers })
  check(dashboardRes, {
    'dashboard is 200': (r) => r.status === 200,
    'dashboard has data': (r) => r.json('data') !== null,
  })

  sleep(1)

  // Test 4: Create resource
  const createRes = http.post(
    `${BASE_URL}/api/projects`,
    JSON.stringify({
      name: `Test Project ${Date.now()}`,
      description: 'Load test project',
    }),
    { headers }
  )

  const createCheck = check(createRes, {
    'create project is 201': (r) => r.status === 201,
    'create returns id': (r) => r.json('id') !== null,
  })

  if (!createCheck) {
    errorRate.add(1)
  } else {
    successfulRequests.add(1)
  }

  sleep(1)

  // Test 5: List resources
  const listRes = http.get(`${BASE_URL}/api/projects`, { headers })
  check(listRes, {
    'list projects is 200': (r) => r.status === 200,
    'list returns array': (r) => Array.isArray(r.json('projects')),
  })

  sleep(1)

  // Test 6: Update resource
  if (createRes.status === 201) {
    const projectId = createRes.json('id')

    const updateRes = http.patch(
      `${BASE_URL}/api/projects/${projectId}`,
      JSON.stringify({
        name: 'Updated Project Name',
      }),
      { headers }
    )

    check(updateRes, {
      'update project is 200': (r) => r.status === 200,
    })

    sleep(1)

    // Test 7: Delete resource
    const deleteRes = http.del(
      `${BASE_URL}/api/projects/${projectId}`,
      null,
      { headers }
    )

    check(deleteRes, {
      'delete project is 200': (r) => r.status === 200,
    })
  }

  sleep(2)
}

// Teardown function - runs once after the test
export function teardown(data) {
  console.log('Load test completed')
}

// Spike test configuration
export const spikeOptions = {
  stages: [
    { duration: '10s', target: 10 },
    { duration: '1m', target: 10 },
    { duration: '10s', target: 500 },  // Spike to 500 users
    { duration: '3m', target: 500 },
    { duration: '10s', target: 10 },
    { duration: '1m', target: 10 },
    { duration: '10s', target: 0 },
  ],
}

// Stress test configuration
export const stressOptions = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 200 },
    { duration: '5m', target: 200 },
    { duration: '2m', target: 300 },
    { duration: '5m', target: 300 },
    { duration: '2m', target: 400 },
    { duration: '5m', target: 400 },
    { duration: '10m', target: 0 },
  ],
}

// Soak test configuration (long-running)
export const soakOptions = {
  stages: [
    { duration: '2m', target: 50 },
    { duration: '3h', target: 50 },  // Run at 50 users for 3 hours
    { duration: '2m', target: 0 },
  ],
}
