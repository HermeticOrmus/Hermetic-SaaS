# Refactoring Guide: Managing Technical Debt in HermeticSaaS

## Overview

Technical debt is inevitable when shipping fast. The key is managing it intelligently—knowing when to refactor vs when to build new, how to identify debt early, and strategies for paying it down without disrupting velocity.

**Philosophy**: Ship fast, but ship smart. Technical debt is a tool, not a failure. The question isn't "Do we have technical debt?" but "Are we managing it strategically?"

## Understanding Technical Debt

### Types of Technical Debt

#### 1. Deliberate & Strategic
**What**: Intentional shortcuts to ship faster
**When**: MVP launches, experiments, prototypes
**Example**: Hard-coded values instead of config system

```typescript
// Deliberate debt - noted and planned
// TODO: Replace with config system in v2.0
const PAYMENT_PROVIDER = 'stripe';
```

**Management**: Document, time-box, plan repayment

#### 2. Inadvertent & Tactical
**What**: Unintentional complexity from incomplete understanding
**When**: Learning new technologies, evolving requirements
**Example**: Suboptimal architecture discovered after implementation

**Management**: Identify through code review, refactor incrementally

#### 3. Bit Rot & Entropy
**What**: Code that degrades over time due to changing context
**When**: Dependency updates, technology shifts, pattern evolution
**Example**: Using deprecated APIs, outdated patterns

**Management**: Regular audits, proactive updates

#### 4. Framework Evolution Debt
**What**: Templates/patterns that become outdated as framework improves
**When**: Major framework versions, new best practices
**Example**: Old auth template vs new improved version

**Management**: Migration guides, version tracking, backward compatibility

## Debt Assessment Framework

### Debt Scoring System

```typescript
interface TechnicalDebt {
  id: string;
  description: string;
  location: string[];

  // Impact scoring (1-10)
  impact: {
    velocity: number;        // How much it slows development
    quality: number;         // How much it affects code quality
    maintenance: number;     // How hard is it to maintain
    security: number;        // Security implications
    performance: number;     // Performance impact
  };

  // Repayment cost
  effort: {
    hours: number;          // Estimated time to fix
    risk: 'low' | 'medium' | 'high';
    complexity: 'low' | 'medium' | 'high';
  };

  // Context
  createdDate: string;
  lastReviewed: string;
  priority: 'critical' | 'high' | 'medium' | 'low';

  // Strategy
  strategy: 'refactor_now' | 'refactor_soon' | 'monitor' | 'accept';
}
```

### Priority Calculation

```typescript
function calculateDebtPriority(debt: TechnicalDebt): number {
  // Total impact score
  const impactScore =
    debt.impact.velocity * 2 +      // Velocity matters most
    debt.impact.quality +
    debt.impact.maintenance +
    debt.impact.security * 3 +       // Security is critical
    debt.impact.performance;

  // Effort score (lower is better)
  const effortScore = debt.effort.hours / 10;
  const riskMultiplier = debt.effort.risk === 'high' ? 2 : 1;

  // Priority = Impact / (Effort * Risk)
  return impactScore / (effortScore * riskMultiplier);
}
```

### Decision Matrix

| Impact | Effort | Action |
|--------|--------|--------|
| High | Low | Refactor immediately |
| High | High | Plan strategic refactor |
| Low | Low | Refactor when touching code |
| Low | High | Accept as permanent |

## When to Refactor vs Build New

### Refactor Existing Code When:

1. **Core functionality is sound**
   - The architecture is fundamentally correct
   - Just needs cleanup or optimization
   - No major paradigm shift needed

2. **Users depend on current behavior**
   - Breaking changes would disrupt users
   - Migration path is complex
   - Backward compatibility is valuable

3. **Incremental improvement is possible**
   - Can improve in small steps
   - Each step adds value
   - Low risk of breakage

4. **Technical debt is localized**
   - Problem is contained to specific modules
   - Doesn't require system-wide changes
   - Clear boundaries exist

### Build New When:

1. **Fundamental architecture is flawed**
   - Core assumptions were wrong
   - Scaling requires complete redesign
   - Refactoring would touch 80%+ of code

2. **Technology has evolved significantly**
   - New patterns make old approach obsolete
   - Major version upgrades of dependencies
   - Paradigm shift in the ecosystem

3. **Refactoring cost exceeds rebuild cost**
   - Estimated refactor time > rebuild time
   - Opportunity to modernize completely
   - Can leverage new learnings

4. **New version can coexist**
   - Both versions can run in parallel
   - Gradual migration is possible
   - A/B testing is valuable

### Hybrid Approach: Strangler Fig Pattern

```
Old System ← Gradually migrate features → New System
```

1. Build new system alongside old
2. Migrate features one at a time
3. Redirect traffic incrementally
4. Deprecate old system when empty

**Example**:
```typescript
// Old authentication system
import { oldAuth } from './legacy/auth';

// New authentication system
import { newAuth } from './v2/auth';

// Feature flag to control migration
const useNewAuth = process.env.USE_NEW_AUTH === 'true';

export const authenticate = useNewAuth ? newAuth : oldAuth;
```

## Identifying Technical Debt Early

### Code Review Signals

Watch for these patterns:
- Comments like "TODO", "HACK", "FIXME"
- Duplicated code
- Long functions (> 50 lines)
- Deep nesting (> 3 levels)
- Many function parameters (> 5)
- Complex conditionals
- Magic numbers
- Tight coupling

### Automated Detection

```typescript
// Example: Debt detection script
interface DebtDetectionRule {
  pattern: RegExp;
  severity: 'high' | 'medium' | 'low';
  category: string;
}

const debtPatterns: DebtDetectionRule[] = [
  {
    pattern: /TODO|FIXME|HACK/gi,
    severity: 'medium',
    category: 'acknowledged_debt'
  },
  {
    pattern: /any\s*>/g,  // TypeScript any type
    severity: 'low',
    category: 'type_safety'
  },
  {
    pattern: /console\.log/g,
    severity: 'low',
    category: 'debugging_code'
  },
];

async function scanForDebt(directory: string) {
  // Implementation would scan files and flag issues
}
```

### Metrics to Monitor

```typescript
interface CodeHealthMetrics {
  // Size metrics
  linesOfCode: number;
  averageFunctionLength: number;
  averageFileLength: number;

  // Complexity
  cyclomaticComplexity: number;
  nestingDepth: number;

  // Quality
  testCoverage: number;
  documentationCoverage: number;
  typeSafety: number;

  // Maintenance
  duplicatedCode: number;
  todoCount: number;
  deprecatedAPIUsage: number;

  // Dependencies
  outdatedDependencies: number;
  vulnerabilities: number;
}
```

### Launch Retrospective Signals

From each launch, watch for:
- "This took longer than expected" → potential debt
- "We had to work around X" → architectural debt
- "This broke when we added Y" → fragile code
- "We copy-pasted from Z" → duplication debt

## Migration Strategies for Breaking Changes

### Strategy 1: Big Bang Migration
**When**: Small codebase, low user impact, controlled environment
**Process**: Update everything at once

```bash
# 1. Create migration branch
git checkout -b migration/v2.0

# 2. Update all code
# ... make changes ...

# 3. Test thoroughly
npm run test:all

# 4. Deploy
npm run deploy
```

**Pros**: Clean break, simple
**Cons**: High risk, downtime

### Strategy 2: Incremental Migration
**When**: Large codebase, need to maintain service
**Process**: Migrate module by module

```typescript
// Phase 1: Add compatibility layer
import { oldAPI } from './legacy';
import { newAPI } from './v2';

export function unifiedAPI(params: any) {
  if (params.version === 2) {
    return newAPI(params);
  }
  return oldAPI(params);
}

// Phase 2: Migrate callers one at a time
// Phase 3: Remove old API when no callers remain
```

**Pros**: Low risk, continuous delivery
**Cons**: Temporary complexity

### Strategy 3: Feature Flags
**When**: Need to A/B test or rollback quickly
**Process**: Use flags to control which version runs

```typescript
import { featureFlag } from './config';

export function processPayment(order: Order) {
  if (featureFlag('new_payment_flow')) {
    return newPaymentProcessor.process(order);
  }
  return legacyPaymentProcessor.process(order);
}
```

**Pros**: Safe rollback, gradual rollout
**Cons**: Increased complexity, must clean up flags

### Strategy 4: Dual-Write Pattern
**When**: Migrating data stores or integrations
**Process**: Write to both old and new, read from old, then flip

```typescript
// Phase 1: Write to both
async function saveUser(user: User) {
  await Promise.all([
    oldDatabase.save(user),
    newDatabase.save(user)
  ]);
}

// Phase 2: Read from new, fallback to old
async function getUser(id: string) {
  const user = await newDatabase.get(id);
  if (!user) {
    return oldDatabase.get(id);
  }
  return user;
}

// Phase 3: Stop writing to old
// Phase 4: Remove old database
```

**Pros**: Data safety, validation period
**Cons**: Temporary double writes

## Deprecation Process

### Deprecation Lifecycle

```
Announce → Warn → Sunset → Remove
  |         |       |        |
  3 months  2 months 1 month  Done
```

### Step 1: Announce Deprecation

```typescript
/**
 * @deprecated Since v2.0. Use `newFunction` instead.
 * Will be removed in v3.0 (estimated Q2 2025)
 *
 * Migration guide: https://docs.example.com/migration/v2-to-v3
 */
export function oldFunction() {
  console.warn('oldFunction is deprecated. Use newFunction instead.');
  // ... implementation
}
```

### Step 2: Add Runtime Warnings

```typescript
export function deprecatedAPI() {
  // Log deprecation with call stack
  console.warn(`
    DEPRECATION WARNING

    deprecatedAPI() is deprecated and will be removed in v3.0

    Migration: Use newAPI() instead
    Guide: https://docs.example.com/migration

    Called from:
    ${new Error().stack}
  `);

  // Continue to work for now
  return legacyImplementation();
}
```

### Step 3: Sunset Period

```typescript
export function sunsettedAPI() {
  throw new Error(`
    sunsettedAPI() has been sunset and will be removed in the next release.

    You must migrate to newAPI() before upgrading.
    Migration guide: https://docs.example.com/migration
  `);
}
```

### Step 4: Remove

```typescript
// Function completely removed from codebase
// Only exists in git history

// Breaking change documented in CHANGELOG.md
// Migration guide prominently displayed
```

## Backward Compatibility Strategies

### Strategy 1: Adapter Pattern

```typescript
// New interface
interface NewPaymentAPI {
  processPayment(payment: PaymentV2): Promise<Result>;
}

// Adapter for old interface
class LegacyPaymentAdapter implements NewPaymentAPI {
  constructor(private legacy: OldPaymentAPI) {}

  async processPayment(payment: PaymentV2): Promise<Result> {
    // Transform new format to old format
    const oldPayment = this.transformToLegacy(payment);
    const result = await this.legacy.process(oldPayment);
    return this.transformToNew(result);
  }
}
```

### Strategy 2: Versioned APIs

```typescript
// v1 endpoint
app.post('/api/v1/users', handleV1Users);

// v2 endpoint
app.post('/api/v2/users', handleV2Users);

// Default to latest
app.post('/api/users', handleV2Users);
```

### Strategy 3: Opt-in Upgrades

```typescript
// Users explicitly opt-in to new behavior
interface Config {
  useV2Features?: boolean;
}

export function initialize(config: Config) {
  if (config.useV2Features) {
    return initializeV2();
  }
  return initializeV1();
}
```

### Strategy 4: Polyfills & Shims

```typescript
// Provide old API on top of new implementation
export const oldAPI = {
  create: (data: OldFormat) => newAPI.create(transform(data)),
  update: (data: OldFormat) => newAPI.update(transform(data)),
  delete: (id: string) => newAPI.delete(id),
};
```

## Refactoring Patterns

### Pattern 1: Extract Function

**Before**:
```typescript
function processOrder(order: Order) {
  // Validation
  if (!order.items || order.items.length === 0) {
    throw new Error('Order must have items');
  }

  // Calculate total
  let total = 0;
  for (const item of order.items) {
    total += item.price * item.quantity;
  }

  // Apply discount
  if (order.coupon) {
    total -= total * (order.coupon.percentage / 100);
  }

  // Process payment
  // ...
}
```

**After**:
```typescript
function processOrder(order: Order) {
  validateOrder(order);
  const total = calculateTotal(order);
  return processPayment(total);
}

function validateOrder(order: Order) {
  if (!order.items || order.items.length === 0) {
    throw new Error('Order must have items');
  }
}

function calculateTotal(order: Order): number {
  const subtotal = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  return applyDiscount(subtotal, order.coupon);
}
```

### Pattern 2: Replace Conditional with Polymorphism

**Before**:
```typescript
function calculatePrice(product: Product, customer: Customer) {
  if (customer.type === 'premium') {
    return product.price * 0.9; // 10% discount
  } else if (customer.type === 'vip') {
    return product.price * 0.8; // 20% discount
  } else {
    return product.price;
  }
}
```

**After**:
```typescript
interface PricingStrategy {
  calculate(price: number): number;
}

class StandardPricing implements PricingStrategy {
  calculate(price: number) { return price; }
}

class PremiumPricing implements PricingStrategy {
  calculate(price: number) { return price * 0.9; }
}

class VIPPricing implements PricingStrategy {
  calculate(price: number) { return price * 0.8; }
}

const strategies = {
  standard: new StandardPricing(),
  premium: new PremiumPricing(),
  vip: new VIPPricing(),
};

function calculatePrice(product: Product, customer: Customer) {
  const strategy = strategies[customer.type];
  return strategy.calculate(product.price);
}
```

### Pattern 3: Introduce Parameter Object

**Before**:
```typescript
function createUser(
  name: string,
  email: string,
  password: string,
  role: string,
  verified: boolean,
  createdAt: Date
) {
  // ...
}
```

**After**:
```typescript
interface CreateUserParams {
  name: string;
  email: string;
  password: string;
  role: string;
  verified: boolean;
  createdAt: Date;
}

function createUser(params: CreateUserParams) {
  // ...
}
```

### Pattern 4: Move Calculation to Data

**Before**:
```typescript
function isExpired(subscription: Subscription): boolean {
  return new Date() > subscription.endDate;
}

// Called everywhere
if (isExpired(user.subscription)) {
  // ...
}
```

**After**:
```typescript
class Subscription {
  // ... properties

  get isExpired(): boolean {
    return new Date() > this.endDate;
  }
}

// Cleaner usage
if (user.subscription.isExpired) {
  // ...
}
```

## Refactoring Workflow

### Step 1: Ensure Test Coverage

```bash
# Run coverage report
npm run test:coverage

# Aim for > 80% coverage of code being refactored
# If coverage is low, write tests first
```

### Step 2: Make Small Changes

```bash
# Each commit should:
# - Make one logical change
# - Keep all tests passing
# - Be revertible independently

git commit -m "Extract validation logic to separate function"
git commit -m "Replace if-else with strategy pattern"
git commit -m "Add type safety to payment processing"
```

### Step 3: Run Tests Constantly

```bash
# Use watch mode during refactoring
npm run test:watch

# Run full suite before committing
npm run test:all
```

### Step 4: Get Feedback Early

```bash
# Open draft PR early
git push origin refactor/payment-system
# Create draft PR with refactoring plan

# Get feedback on approach before investing too much
```

### Step 5: Update Documentation

```markdown
# Update relevant docs
- API documentation
- Architecture diagrams
- Migration guides
- Code comments
```

## Technical Debt Register

### Maintaining the Register

```typescript
// debt-register.json
{
  "debts": [
    {
      "id": "DEBT-001",
      "title": "Hard-coded payment provider",
      "description": "Payment provider is hard-coded instead of configurable",
      "location": ["src/payments/stripe.ts"],
      "impact": {
        "velocity": 6,
        "quality": 4,
        "maintenance": 5,
        "security": 2,
        "performance": 1
      },
      "effort": {
        "hours": 8,
        "risk": "low",
        "complexity": "medium"
      },
      "createdDate": "2025-01-15",
      "lastReviewed": "2025-02-01",
      "priority": "medium",
      "strategy": "refactor_soon",
      "targetVersion": "v2.1.0"
    }
  ]
}
```

### Regular Debt Reviews

**Monthly**: Review high-priority debt
**Quarterly**: Full debt audit
**Per Launch**: Add new debt identified

## Success Criteria

### Healthy Technical Debt Management Looks Like:

- Debt is documented and tracked
- Strategic shortcuts are intentional
- Refactoring happens continuously, not in "cleanup sprints"
- Tests prevent regression during refactoring
- Migration paths are clear and tested
- Velocity remains high despite evolving codebase
- Quality improves over time

### Warning Signs:

- "We can't add features without breaking things"
- "Nobody understands this code anymore"
- "Tests are too brittle to maintain"
- "We're spending more time fixing than building"
- "Every change causes unexpected side effects"

## Framework-Specific Guidelines

### Template Refactoring

When refactoring framework templates:
1. Create new version (don't break existing)
2. Mark old version as deprecated
3. Provide migration script
4. A/B test new version
5. Promote when validated
6. Remove old after sunset period

### Backward Compatibility Promise

HermeticSaaS maintains:
- **Patch versions**: 100% backward compatible
- **Minor versions**: Deprecations allowed, no removals
- **Major versions**: Breaking changes allowed with migration guides

---

**Remember**: Technical debt isn't failure—it's a tool for velocity. The art is knowing when to borrow and when to pay back. Refactor strategically, ship continuously, improve constantly.
