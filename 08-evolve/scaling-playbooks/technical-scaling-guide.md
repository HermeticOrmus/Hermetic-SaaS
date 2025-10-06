# Technical Scaling Guide: 100K+ Users

> "Premature optimization is the root of all evil. But so is ignoring performance until it's too late." - Hermetic Principle

## The Scaling Philosophy

### Three Rules of Technical Scaling

1. **Measure First, Optimize Second**
   - Never optimize without data
   - Set up monitoring before problems
   - Know your bottlenecks precisely

2. **Scale Vertically First, Horizontally Second**
   - Bigger servers are simpler
   - Horizontal scaling adds complexity
   - Cloud makes vertical scaling easy

3. **Cache Aggressively, Invalidate Carefully**
   - Most data doesn't change often
   - Stale data > slow data (usually)
   - Cache layers compound effectiveness

---

## Infrastructure Evolution Path

### Stage 1: 0-1K Users
**Single Server Setup**

```
┌─────────────────────────────────┐
│     Single VPS ($20-50/mo)     │
│                                 │
│  ┌──────────┐  ┌─────────────┐ │
│  │   App    │  │  PostgreSQL │ │
│  │  Server  │  │             │ │
│  │ (Node.js)│  │   Database  │ │
│  └──────────┘  └─────────────┘ │
│                                 │
│         ┌──────────┐           │
│         │  Redis   │           │
│         │ (Session)│           │
│         └──────────┘           │
└─────────────────────────────────┘
```

**Stack:**
- VPS: DigitalOcean Droplet ($20/mo, 2GB RAM)
- Database: PostgreSQL on same server
- Cache: Redis for sessions
- CDN: Cloudflare (free tier)
- Files: Local storage or S3

**Scaling Limits:**
- ~1,000 active users
- ~50 requests/second
- ~10GB data
- Single point of failure (acceptable at this stage)

---

### Stage 2: 1K-10K Users
**Managed Services Setup**

```
┌──────────────┐
│  Cloudflare  │ (CDN + DDoS)
│     CDN      │
└──────┬───────┘
       │
┌──────▼────────────────────────────┐
│      App Server(s)                │
│   (Railway/Render/Fly.io)        │
│                                   │
│  ┌─────────────────────────┐     │
│  │  Node.js App Instances  │     │
│  │  (Auto-scaling 1-3)     │     │
│  └─────────────────────────┘     │
└───────┬──────────────┬────────────┘
        │              │
┌───────▼──────┐   ┌──▼─────────┐
│  PostgreSQL  │   │   Redis    │
│   (Managed)  │   │ (Upstash)  │
│  Supabase/   │   │            │
│  Railway     │   │            │
└──────────────┘   └────────────┘
```

**Stack:**
- App: Railway/Render ($50-200/mo)
- Database: Managed PostgreSQL ($25-100/mo)
- Cache: Upstash Redis ($10-50/mo)
- CDN: Cloudflare Pro ($20/mo)
- Files: S3 or R2
- Background Jobs: BullMQ on Redis

**Improvements:**
- Separate database server
- Managed backups
- Auto-scaling app servers
- CDN for all assets
- Dedicated cache layer

**Scaling Limits:**
- ~10,000 active users
- ~500 requests/second
- ~100GB data
- 99.9% uptime

---

### Stage 3: 10K-100K Users
**Distributed Architecture**

```
┌─────────────────────────────────────┐
│         Cloudflare CDN              │
│      (Global Edge Network)          │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Load Balancer                  │
│   (Built-in or separate)            │
└──────┬───────────────┬──────────────┘
       │               │
┌──────▼──────┐  ┌────▼──────────┐
│  App Server │  │  App Server   │
│   Pool      │  │   Pool        │
│  (3-10)     │  │  (Workers)    │
└──────┬──────┘  └────┬──────────┘
       │              │
┌──────▼──────────────▼──────────┐
│      Redis Cluster              │
│   ┌──────┐  ┌──────┐  ┌──────┐│
│   │Master│  │Replica│ │Replica││
│   └──────┘  └──────┘  └──────┘│
└─────────────────────────────────┘
       │
┌──────▼──────────────────────────┐
│   PostgreSQL HA Cluster         │
│  ┌──────────┐  ┌──────────────┐│
│  │ Primary  │──│Read Replica 1││
│  └──────────┘  └──────────────┘│
│                ┌──────────────┐ │
│                │Read Replica 2│ │
│                └──────────────┘ │
└─────────────────────────────────┘
```

**Stack:**
- App: Multi-region deployment
- Database: Primary + 2+ read replicas
- Cache: Redis cluster (3+ nodes)
- CDN: Enterprise Cloudflare
- Search: Meilisearch or Algolia
- Queue: Separate job workers
- Monitoring: Datadog/New Relic

**Scaling Limits:**
- ~100,000 active users
- ~5,000 requests/second
- ~1TB data
- 99.95% uptime
- Multi-region capability

---

## Database Optimization for Scale

### PostgreSQL Performance Tuning

#### Indexing Strategy

**Rule 1: Index Every Foreign Key**
```sql
-- BAD: No index on foreign key
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  created_at TIMESTAMP
);

-- GOOD: Index on foreign key
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  created_at TIMESTAMP
);
CREATE INDEX idx_orders_user_id ON orders(user_id);
```

**Rule 2: Compound Indexes for Common Queries**
```sql
-- Query: Find user's recent orders
SELECT * FROM orders
WHERE user_id = 123
ORDER BY created_at DESC
LIMIT 10;

-- Optimal index (order matters!)
CREATE INDEX idx_orders_user_created
ON orders(user_id, created_at DESC);
```

**Rule 3: Partial Indexes for Filtered Queries**
```sql
-- Query: Find active subscriptions
SELECT * FROM subscriptions
WHERE user_id = 123 AND status = 'active';

-- Partial index (smaller, faster)
CREATE INDEX idx_active_subscriptions
ON subscriptions(user_id)
WHERE status = 'active';
```

#### Query Optimization

**Use EXPLAIN ANALYZE**
```sql
EXPLAIN ANALYZE
SELECT u.email, COUNT(o.id) as order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at > NOW() - INTERVAL '30 days'
GROUP BY u.id, u.email;
```

**Look for:**
- Sequential Scans (should be Index Scans)
- High execution time on specific nodes
- Missing indexes warnings

**Common Fixes:**
1. Add indexes on JOIN columns
2. Add indexes on WHERE clause columns
3. Add indexes on ORDER BY columns
4. Use covering indexes (include SELECT columns)

#### Connection Pooling

**Without Pooling (BAD):**
```javascript
// Each request creates new connection
app.get('/users/:id', async (req, res) => {
  const client = await pg.connect(); // SLOW!
  const result = await client.query('SELECT * FROM users WHERE id = $1', [req.params.id]);
  await client.end();
  res.json(result.rows[0]);
});
```

**With Pooling (GOOD):**
```javascript
import { Pool } from 'pg';

const pool = new Pool({
  max: 20, // max connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

app.get('/users/:id', async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM users WHERE id = $1',
    [req.params.id]
  );
  res.json(result.rows[0]);
});
```

**Pool Size Formula:**
```
Pool Size = ((Core Count × 2) + Effective Spindle Count)

Example:
- 4 CPU cores
- SSD storage (treat as 1 spindle)
= (4 × 2) + 1 = 9 connections

Recommendation: Start at 10-20, monitor and adjust
```

#### Read Replicas Strategy

**When to Use:**
- Read/write ratio > 80/20
- >10K active users
- Complex reporting queries
- Analytics workload

**Implementation:**
```javascript
// Write to primary
const writeToPrimary = async (query, params) => {
  return primaryPool.query(query, params);
};

// Read from replica (with fallback)
const readFromReplica = async (query, params) => {
  try {
    return await replicaPool.query(query, params);
  } catch (error) {
    // Fallback to primary if replica unavailable
    console.error('Replica error, using primary:', error);
    return await primaryPool.query(query, params);
  }
};

// Usage
app.post('/orders', async (req, res) => {
  const result = await writeToPrimary(
    'INSERT INTO orders (...) VALUES (...)',
    [...]
  );
  res.json(result.rows[0]);
});

app.get('/orders/:id', async (req, res) => {
  const result = await readFromReplica(
    'SELECT * FROM orders WHERE id = $1',
    [req.params.id]
  );
  res.json(result.rows[0]);
});
```

**Replication Lag Handling:**
```javascript
// For operations requiring immediate consistency
app.post('/orders', async (req, res) => {
  // Write to primary
  const order = await writeToPrimary(
    'INSERT INTO orders (...) VALUES (...) RETURNING *',
    [...]
  );

  // Read back from PRIMARY (not replica)
  // to ensure we see the just-written data
  const result = await primaryPool.query(
    'SELECT * FROM orders WHERE id = $1',
    [order.id]
  );

  res.json(result.rows[0]);
});
```

---

## Caching Strategies

### Multi-Layer Caching Architecture

```
Request Flow:

1. CDN (Edge) ────┐
   ↓ MISS         │ HIT → Return
2. Redis (App)────┤
   ↓ MISS         │ HIT → Return
3. App Cache ─────┤
   ↓ MISS         │ HIT → Return
4. Database ──────┘
```

### Layer 1: CDN Caching (Cloudflare)

**What to Cache:**
- Static assets (JS, CSS, images)
- API responses (with Cache-Control headers)
- Public pages
- User-generated content (images, uploads)

**Configuration:**
```javascript
// API endpoint with CDN caching
app.get('/api/public/stats', (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=300'); // 5 min
  res.setHeader('CDN-Cache-Control', 'public, max-age=3600'); // 1 hour on CDN

  // ... generate stats
  res.json(stats);
});
```

**Cloudflare Page Rules:**
- Cache Level: Standard
- Edge Cache TTL: 1 hour (for frequently accessed)
- Browser Cache TTL: 30 minutes
- Cache Everything: On (for API routes you want cached)

### Layer 2: Redis Caching

**Pattern 1: Cache-Aside (Most Common)**
```javascript
const getUser = async (userId) => {
  // Try cache first
  const cached = await redis.get(`user:${userId}`);
  if (cached) {
    return JSON.parse(cached);
  }

  // Cache miss - fetch from database
  const user = await db.query('SELECT * FROM users WHERE id = $1', [userId]);

  // Store in cache (1 hour TTL)
  await redis.setex(`user:${userId}`, 3600, JSON.stringify(user));

  return user;
};
```

**Pattern 2: Write-Through**
```javascript
const updateUser = async (userId, data) => {
  // Update database
  const user = await db.query(
    'UPDATE users SET ... WHERE id = $1 RETURNING *',
    [userId]
  );

  // Update cache immediately
  await redis.setex(`user:${userId}`, 3600, JSON.stringify(user));

  return user;
};
```

**Pattern 3: Write-Behind (For Analytics)**
```javascript
const trackEvent = async (userId, event) => {
  // Write to Redis immediately (fast)
  await redis.lpush(`events:${userId}`, JSON.stringify(event));

  // Background job processes Redis queue → Database
  // This happens async, user doesn't wait
};
```

**Cache Invalidation Strategies:**
```javascript
// Time-based (TTL)
await redis.setex('key', 3600, value); // Expires in 1 hour

// Event-based (manual invalidation)
const invalidateUser = async (userId) => {
  await redis.del(`user:${userId}`);
  await redis.del(`user:${userId}:orders`);
  await redis.del(`user:${userId}:subscriptions`);
};

// Tag-based (using Sets)
const cacheWithTags = async (key, value, tags) => {
  await redis.setex(key, 3600, value);
  for (const tag of tags) {
    await redis.sadd(`tag:${tag}`, key);
  }
};

const invalidateByTag = async (tag) => {
  const keys = await redis.smembers(`tag:${tag}`);
  if (keys.length > 0) {
    await redis.del(...keys);
    await redis.del(`tag:${tag}`);
  }
};

// Usage
await cacheWithTags('user:123', userData, ['user:123', 'users:active']);
await invalidateByTag('users:active'); // Invalidates all active users
```

### Layer 3: Application-Level Caching

**In-Memory Cache (for read-heavy, rarely-changing data):**
```javascript
import NodeCache from 'node-cache';

const cache = new NodeCache({
  stdTTL: 600, // 10 minutes
  checkperiod: 120 // Check for expired keys every 2 min
});

const getConfig = () => {
  let config = cache.get('app_config');

  if (!config) {
    config = loadConfigFromDatabase();
    cache.set('app_config', config);
  }

  return config;
};
```

**HTTP Response Caching:**
```javascript
import apicache from 'apicache';

const cacheMiddleware = apicache.middleware;

// Cache GET requests for 5 minutes
app.get('/api/public/blog',
  cacheMiddleware('5 minutes'),
  async (req, res) => {
    const posts = await db.query('SELECT * FROM posts WHERE published = true');
    res.json(posts);
  }
);
```

### What to Cache (and for how long)

**Short TTL (1-5 minutes):**
- User profiles
- Dashboard data
- Real-time stats
- Recent activity

**Medium TTL (15-60 minutes):**
- Configuration data
- Feature flags
- Public content
- Aggregated stats

**Long TTL (1-24 hours):**
- Static content
- Rarely-changing data
- Computed reports
- Archive data

**Never Cache:**
- Personal/sensitive data (in CDN)
- Real-time notifications
- Payment information
- Session data (use Redis, not CDN)

---

## Background Job Processing

### When to Use Background Jobs

**Use for:**
- Email sending
- Report generation
- Data exports
- Image processing
- Third-party API calls
- Batch operations
- Scheduled tasks

**DON'T use for:**
- Critical user-facing operations
- Real-time features
- Simple database queries

### BullMQ Setup (Recommended)

**Installation:**
```bash
npm install bullmq ioredis
```

**Queue Configuration:**
```javascript
import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis({
  host: 'localhost',
  port: 6379,
  maxRetriesPerRequest: null,
});

// Create queue
const emailQueue = new Queue('emails', { connection });

// Add jobs
const sendWelcomeEmail = async (userId, email) => {
  await emailQueue.add('welcome', {
    userId,
    email,
  }, {
    attempts: 3, // Retry up to 3 times
    backoff: {
      type: 'exponential',
      delay: 5000, // Start with 5 seconds
    },
  });
};

// Process jobs (separate worker process recommended)
const worker = new Worker('emails', async (job) => {
  if (job.name === 'welcome') {
    await sendEmail(job.data.email, 'welcome-template');
  }
}, { connection });

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err);
});
```

**Job Priority:**
```javascript
// High priority (process first)
await emailQueue.add('urgent', data, { priority: 1 });

// Normal priority
await emailQueue.add('normal', data, { priority: 5 });

// Low priority
await emailQueue.add('batch', data, { priority: 10 });
```

**Scheduled Jobs:**
```javascript
// Run in 1 hour
await emailQueue.add('reminder', data, {
  delay: 3600000, // milliseconds
});

// Repeat every day at 9 AM
await emailQueue.add('daily-report', data, {
  repeat: {
    pattern: '0 9 * * *', // Cron syntax
  },
});
```

### Worker Scaling

**Development (0-1K users):**
```javascript
// Single worker, single process
const worker = new Worker('emails', processJob, {
  concurrency: 5 // Process 5 jobs simultaneously
});
```

**Production (1K-10K users):**
```javascript
// Multiple workers, separate process
// worker.js
const worker = new Worker('emails', processJob, {
  concurrency: 10,
});

// Run multiple processes:
// pm2 start worker.js -i 2
```

**Scale (10K+ users):**
```javascript
// Dedicated worker servers
// Multiple servers running workers
// Queue-specific workers

const emailWorker = new Worker('emails', processEmails, {
  concurrency: 20,
});

const reportWorker = new Worker('reports', processReports, {
  concurrency: 5, // CPU-intensive, lower concurrency
});
```

---

## API Rate Limiting

### Why Rate Limit?

1. Prevent abuse
2. Ensure fair usage
3. Protect infrastructure
4. Monetization (tier-based limits)

### Implementation with Redis

```javascript
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';

const redis = new Redis();

// Basic rate limiter
const limiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rate_limit:',
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);
```

### Tier-Based Rate Limiting

```javascript
const createRateLimiter = (requestsPerMinute) => {
  return rateLimit({
    store: new RedisStore({ client: redis }),
    windowMs: 60 * 1000,
    max: requestsPerMinute,
    keyGenerator: (req) => {
      // Use user ID instead of IP for authenticated requests
      return req.user?.id || req.ip;
    },
  });
};

// Different limits per tier
const freeTierLimit = createRateLimiter(60); // 60/min
const proTierLimit = createRateLimiter(600); // 600/min
const enterpriseLimit = createRateLimiter(6000); // 6000/min

app.use('/api/', async (req, res, next) => {
  const user = await getUser(req);

  if (user.tier === 'enterprise') {
    return enterpriseLimit(req, res, next);
  } else if (user.tier === 'pro') {
    return proTierLimit(req, res, next);
  } else {
    return freeTierLimit(req, res, next);
  }
});
```

### Token Bucket Algorithm (Advanced)

```javascript
const checkRateLimit = async (userId, maxTokens, refillRate) => {
  const key = `rate_limit:${userId}`;
  const now = Date.now();

  // Get current state
  const data = await redis.get(key);
  let tokens = maxTokens;
  let lastRefill = now;

  if (data) {
    const state = JSON.parse(data);
    const elapsed = now - state.lastRefill;
    const tokensToAdd = Math.floor(elapsed / 1000) * refillRate;
    tokens = Math.min(maxTokens, state.tokens + tokensToAdd);
    lastRefill = state.lastRefill;
  }

  if (tokens < 1) {
    return { allowed: false, remaining: 0 };
  }

  // Consume token
  tokens -= 1;

  // Save state
  await redis.setex(key, 3600, JSON.stringify({
    tokens,
    lastRefill: now,
  }));

  return { allowed: true, remaining: tokens };
};
```

---

## Performance Monitoring

### Essential Metrics to Track

**Application Performance:**
- Response time (p50, p95, p99)
- Throughput (requests/second)
- Error rate
- Apdex score

**Database Performance:**
- Query execution time
- Active connections
- Lock wait time
- Cache hit ratio

**Infrastructure:**
- CPU usage
- Memory usage
- Disk I/O
- Network throughput

### Monitoring Stack

**Option 1: Simple (0-10K users)**
- BetterStack (uptime + logs)
- Plausible Analytics (user behavior)
- PostgreSQL built-in stats

**Option 2: Comprehensive (10K+ users)**
- Datadog or New Relic (APM)
- Sentry (error tracking)
- Grafana + Prometheus (metrics)
- LogTail or Papertrail (logs)

### Performance Budgets

**Set and enforce:**
```javascript
// performance-budget.js
module.exports = {
  api: {
    p95ResponseTime: 500, // ms
    errorRate: 1, // percentage
    throughput: 100, // req/sec minimum
  },
  database: {
    p95QueryTime: 100, // ms
    connectionPoolUsage: 80, // percentage
  },
  frontend: {
    FCP: 1800, // First Contentful Paint (ms)
    LCP: 2500, // Largest Contentful Paint (ms)
    CLS: 0.1, // Cumulative Layout Shift
  },
};
```

**Alert when budgets exceeded:**
- Immediate alerts for critical metrics
- Daily summaries for trends
- Weekly performance reviews

---

## Cost Optimization at Scale

### The Cost Scaling Curve

**Typical Costs by Stage:**
- 0-1K users: $50-200/mo
- 1K-10K users: $500-2K/mo
- 10K-100K users: $5K-20K/mo
- 100K+ users: $20K-100K+/mo

### Cost Optimization Strategies

**1. Right-Size Infrastructure**
```
Don't over-provision "just in case"
Start small, scale up when needed
Monitor usage, adjust monthly
Use auto-scaling for variable load
```

**2. Reserved Instances (Cloud)**
```
1-year commitment: 30-40% savings
3-year commitment: 50-60% savings
Use for baseline capacity
Keep spot/on-demand for spikes
```

**3. Database Optimization**
```
Smaller database = lower cost
Archive old data
Delete unused data
Compress large columns
Efficient indexing
```

**4. CDN and Storage**
```
Aggressive caching = lower origin hits
Optimize images (WebP, compression)
Lazy load non-critical assets
Use cheap storage tiers for archives
```

**5. Background Job Efficiency**
```
Batch operations
Off-peak processing
Cancel unnecessary jobs
Deduplicate jobs
```

### Cost per User Target

**Healthy Margins:**
- Infrastructure: <20% of ARPU
- Total CoGS: <30% of ARPU

**Example:**
- ARPU: $20/month
- Target infrastructure cost: <$4/user
- Actual cost at scale: $0.50-2/user

---

## Scaling Checklist

### Before Scaling (Prepare)
- [ ] Performance monitoring in place
- [ ] Database properly indexed
- [ ] Redis caching implemented
- [ ] Background jobs for async work
- [ ] Rate limiting configured
- [ ] Error tracking setup
- [ ] Backup/recovery tested
- [ ] Load testing performed

### During Scaling (Execute)
- [ ] Vertical scaling first (bigger servers)
- [ ] Add read replicas
- [ ] Implement CDN caching
- [ ] Add Redis cluster
- [ ] Horizontal app scaling
- [ ] Queue worker scaling
- [ ] Multi-region deployment

### After Scaling (Optimize)
- [ ] Review performance metrics
- [ ] Optimize slow queries
- [ ] Adjust cache TTLs
- [ ] Right-size resources
- [ ] Cost analysis
- [ ] Capacity planning
- [ ] Documentation updates

---

**Remember:** The best scale is the scale you don't need. Optimize before you scale. Cache before you cluster. Measure before you migrate.

Build for the users you have, not the users you want. When you actually need to scale, you'll know—and you'll have the runway to do it right.
