# Testing Framework for HermeticSaaS

Comprehensive testing setup for unit tests, integration tests, E2E tests, and load testing.

## Overview

This testing framework provides:
- **Unit Testing** with Jest
- **Integration Testing** with Jest + Supertest
- **E2E Testing** with Playwright
- **Load Testing** with k6
- **Test Data Generation** with Faker

## Quick Start

### 1. Install Dependencies

```bash
# Core testing dependencies
npm install -D jest @testing-library/react @testing-library/jest-dom
npm install -D @testing-library/user-event @testing-library/hooks

# Playwright for E2E
npm install -D @playwright/test

# Load testing (install k6 separately)
# macOS: brew install k6
# Windows: choco install k6
# Linux: sudo apt-get install k6

# Test data generation
npm install -D @faker-js/faker

# API testing
npm install -D supertest node-mocks-http
```

### 2. Copy Configuration Files

```bash
# Copy from testing-framework to your project root
cp jest.config.js your-project/
cp jest.setup.js your-project/
cp playwright.config.ts your-project/
```

### 3. Create Mock Files

```bash
# Create __mocks__ directory
mkdir -p __mocks__

# Create style mock
echo "module.exports = {}" > __mocks__/styleMock.js

# Create file mock
echo "module.exports = 'test-file-stub'" > __mocks__/fileMock.js
```

### 4. Add Test Scripts to package.json

```json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest --testPathPattern=\\.test\\.",
    "test:integration": "jest --testPathPattern=\\.integration\\.",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:debug": "playwright test --debug",
    "test:load": "k6 run load-testing/k6-load-test.js",
    "test:smoke": "playwright test smoke/",
    "test:all": "npm run test:unit && npm run test:integration && npm run test:e2e"
  }
}
```

## Testing Patterns

### Unit Testing

**Test Components:**

```typescript
// components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './Button'

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('handles clicks', () => {
    const onClick = jest.fn()
    render(<Button onClick={onClick}>Click</Button>)

    fireEvent.click(screen.getByText('Click'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('can be disabled', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

**Test Hooks:**

```typescript
// hooks/useCounter.test.ts
import { renderHook, act } from '@testing-library/react'
import { useCounter } from './useCounter'

describe('useCounter', () => {
  it('increments count', () => {
    const { result } = renderHook(() => useCounter())

    act(() => {
      result.current.increment()
    })

    expect(result.current.count).toBe(1)
  })
})
```

**Test Utilities:**

```typescript
// lib/utils.test.ts
import { formatCurrency, validateEmail } from './utils'

describe('Utilities', () => {
  describe('formatCurrency', () => {
    it('formats USD correctly', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56')
    })

    it('handles zero', () => {
      expect(formatCurrency(0)).toBe('$0.00')
    })
  })

  describe('validateEmail', () => {
    it('validates correct emails', () => {
      expect(validateEmail('test@example.com')).toBe(true)
    })

    it('rejects invalid emails', () => {
      expect(validateEmail('invalid')).toBe(false)
    })
  })
})
```

### Integration Testing

**Test API Routes:**

```typescript
// api/users/route.test.ts
import { createMocks } from 'node-mocks-http'
import handler from './route'

describe('/api/users', () => {
  it('returns users list', async () => {
    const { req, res } = createMocks({ method: 'GET' })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)
    expect(JSON.parse(res._getData())).toHaveProperty('users')
  })

  it('creates new user', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { email: 'new@example.com', name: 'New User' }
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(201)
  })
})
```

**Test Database Operations:**

```typescript
// lib/db.test.ts
import { prisma } from '@/lib/prisma'

describe('Database Operations', () => {
  beforeEach(async () => {
    await prisma.user.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('creates user', async () => {
    const user = await prisma.user.create({
      data: { email: 'test@example.com', name: 'Test' }
    })

    expect(user.id).toBeTruthy()
  })

  it('finds user by email', async () => {
    await prisma.user.create({
      data: { email: 'find@example.com', name: 'Find' }
    })

    const user = await prisma.user.findUnique({
      where: { email: 'find@example.com' }
    })

    expect(user).toBeTruthy()
  })
})
```

### E2E Testing

**Test User Flows:**

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('user can sign up', async ({ page }) => {
    await page.goto('/signup')

    await page.fill('input[name="email"]', 'new@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')

    await page.waitForURL('/dashboard')
    await expect(page.locator('text=Welcome')).toBeVisible()
  })

  test('user can log in', async ({ page }) => {
    await page.goto('/login')

    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')

    await page.waitForURL('/dashboard')
  })
})
```

**Test Critical Flows:**

```typescript
// e2e/subscription.spec.ts
test('user can subscribe', async ({ page }) => {
  // Login
  await page.goto('/login')
  await page.fill('input[name="email"]', 'test@example.com')
  await page.fill('input[name="password"]', 'password123')
  await page.click('button[type="submit"]')

  // Navigate to pricing
  await page.goto('/pricing')
  await page.click('button:has-text("Upgrade to Pro")')

  // Fill payment
  const frame = page.frameLocator('iframe[name^="__privateStripeFrame"]')
  await frame.locator('input[name="cardnumber"]').fill('4242424242424242')
  await frame.locator('input[name="exp-date"]').fill('12/25')
  await frame.locator('input[name="cvc"]').fill('123')

  // Submit
  await page.click('button:has-text("Subscribe")')

  // Verify
  await expect(page.locator('text=Subscription active')).toBeVisible()
})
```

### Load Testing

**Run Load Tests:**

```bash
# Basic load test
k6 run load-testing/k6-load-test.js

# With custom environment
BASE_URL=https://staging.yourapp.com k6 run load-testing/k6-load-test.js

# With results output
k6 run --out json=results.json load-testing/k6-load-test.js

# Spike test
k6 run --config spike load-testing/k6-load-test.js

# Stress test
k6 run --config stress load-testing/k6-load-test.js
```

**Custom Load Test:**

```javascript
// my-load-test.js
import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
  vus: 50,
  duration: '5m',
  thresholds: {
    http_req_duration: ['p(95)<500'],
  },
}

export default function () {
  const res = http.get('https://yourapp.com')

  check(res, {
    'status is 200': (r) => r.status === 200,
    'load time < 2s': (r) => r.timings.duration < 2000,
  })

  sleep(1)
}
```

## Test Data Generation

**Generate Test Data:**

```typescript
import {
  generateUser,
  generateUsers,
  generateOrganization,
  generateProject,
} from './test-data-generators'

describe('User Management', () => {
  it('handles multiple users', () => {
    const users = generateUsers(100)

    expect(users).toHaveLength(100)
    expect(users[0]).toHaveProperty('email')
  })

  it('creates organization', () => {
    const org = generateOrganization({
      name: 'Test Corp',
    })

    expect(org.name).toBe('Test Corp')
    expect(org.slug).toBeTruthy()
  })
})
```

**Seed Test Database:**

```typescript
import { seedTestData } from './test-data-generators'
import { prisma } from '@/lib/prisma'

beforeAll(async () => {
  await seedTestData(prisma)
})
```

## CI Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci

      - name: Run unit tests
        run: npm run test:unit -- --coverage

      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e
        env:
          BASE_URL: http://localhost:3000

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Coverage Thresholds

**Configure in jest.config.js:**

```javascript
coverageThresholds: {
  global: {
    branches: 70,
    functions: 70,
    lines: 70,
    statements: 70,
  },
  './src/lib/**/*.ts': {
    branches: 90,
    functions: 90,
    lines: 90,
    statements: 90,
  },
}
```

**View Coverage:**

```bash
npm run test:coverage

# Open HTML report
open coverage/lcov-report/index.html
```

## Best Practices

### 1. Test Naming

```typescript
// Good
it('creates user with valid data')
it('rejects invalid email format')
it('returns 404 for non-existent resource')

// Bad
it('works')
it('test 1')
it('should work correctly')
```

### 2. Arrange-Act-Assert

```typescript
it('updates user profile', async () => {
  // Arrange
  const user = await createTestUser()
  const updateData = { name: 'New Name' }

  // Act
  const result = await updateUser(user.id, updateData)

  // Assert
  expect(result.name).toBe('New Name')
})
```

### 3. Test Isolation

```typescript
describe('User Tests', () => {
  beforeEach(async () => {
    // Clean state before each test
    await prisma.user.deleteMany()
  })

  afterAll(async () => {
    // Cleanup after all tests
    await prisma.$disconnect()
  })
})
```

### 4. Mock External Dependencies

```typescript
jest.mock('@/lib/stripe', () => ({
  createCustomer: jest.fn().mockResolvedValue({
    id: 'cus_test123',
  }),
}))
```

### 5. Test Error Cases

```typescript
it('handles network errors', async () => {
  // Mock network failure
  global.fetch = jest.fn().mockRejectedValue(new Error('Network error'))

  render(<UserProfile />)

  await waitFor(() => {
    expect(screen.getByText(/error/i)).toBeInTheDocument()
  })
})
```

## Troubleshooting

### Common Issues

**1. Tests timeout:**
```javascript
// Increase timeout in jest.config.js
testTimeout: 30000  // 30 seconds
```

**2. Playwright tests fail:**
```bash
# Install browsers
npx playwright install

# Run in headed mode to debug
npm run test:e2e:headed
```

**3. Database tests fail:**
```bash
# Ensure test database is running
# Check DATABASE_URL environment variable
echo $DATABASE_URL
```

**4. Coverage too low:**
```bash
# Find uncovered code
npm run test:coverage
open coverage/lcov-report/index.html
```

## Next Steps

1. **Copy configuration files** to your project
2. **Install dependencies**
3. **Create your first test**
4. **Run tests locally**
5. **Add to CI/CD pipeline**
6. **Monitor coverage**

---

**HermeticSaaS Principle**: Comprehensive tests give you confidence to ship fast. Test early, test often, ship with confidence.
