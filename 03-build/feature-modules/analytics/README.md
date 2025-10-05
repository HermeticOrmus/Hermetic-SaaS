# Analytics Module

Production-ready analytics and event tracking for MicroSaaS apps. Privacy-compliant and customizable.

## Features

- Event tracking wrapper
- Dashboard components
- Metrics visualization
- Export functionality
- Privacy-compliant tracking
- Real-time metrics
- User behavior analytics
- Conversion tracking
- Custom events

## Installation

```bash
npm install recharts date-fns
```

## Optional Integrations

```bash
# PostHog (recommended for privacy)
npm install posthog-js

# Google Analytics 4
npm install react-ga4

# Mixpanel
npm install mixpanel-browser
```

## Environment Variables

Add to your `.env.local`:

```env
# PostHog (recommended)
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Google Analytics 4 (optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-...

# Mixpanel (optional)
NEXT_PUBLIC_MIXPANEL_TOKEN=...
```

## Quick Start

### 1. Initialize Analytics Provider

```tsx
// app/layout.tsx
import { AnalyticsProvider } from '@/features/analytics/providers/AnalyticsProvider';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AnalyticsProvider>
          {children}
        </AnalyticsProvider>
      </body>
    </html>
  );
}
```

### 2. Track Events

```tsx
import { useAnalytics } from '@/features/analytics/hooks/useAnalytics';

export default function ProductPage() {
  const { track } = useAnalytics();

  const handlePurchase = () => {
    track('purchase_completed', {
      product_id: '123',
      price: 29.99,
      currency: 'USD',
    });
  };

  return <button onClick={handlePurchase}>Buy Now</button>;
}
```

### 3. Add Analytics Dashboard

```tsx
import { AnalyticsDashboard } from '@/features/analytics/components/AnalyticsDashboard';

export default function AdminPage() {
  return (
    <div>
      <h1>Analytics</h1>
      <AnalyticsDashboard />
    </div>
  );
}
```

## Components

### AnalyticsDashboard
Complete analytics dashboard with charts.

```tsx
<AnalyticsDashboard
  userId={user.id}
  dateRange="30d"
  showRealTime={true}
/>
```

### MetricCard
Display individual metrics.

```tsx
<MetricCard
  title="Total Users"
  value={1234}
  change={+12.5}
  changeLabel="vs last month"
  icon={<UsersIcon />}
/>
```

### EventsChart
Visualize events over time.

```tsx
<EventsChart
  events={events}
  dateRange="7d"
  eventTypes={['page_view', 'button_click']}
/>
```

### ConversionFunnel
Track conversion funnels.

```tsx
<ConversionFunnel
  steps={[
    { name: 'Visit', count: 1000 },
    { name: 'Signup', count: 500 },
    { name: 'Purchase', count: 100 },
  ]}
/>
```

### RealtimeUsers
Show current active users.

```tsx
<RealtimeUsers />
```

## Hooks

### useAnalytics
Main analytics hook.

```tsx
const {
  track,           // Track custom event
  page,            // Track page view
  identify,        // Identify user
  group,           // Group users
  reset,           // Reset session
} = useAnalytics();

// Track event
track('button_clicked', { button_id: 'cta' });

// Track page view
page('/dashboard');

// Identify user
identify(user.id, {
  email: user.email,
  plan: 'pro',
});
```

### useMetrics
Get aggregated metrics.

```tsx
const {
  metrics,
  loading,
  error,
  refresh,
} = useMetrics({
  userId: user.id,
  dateRange: '30d',
  metrics: ['users', 'revenue', 'conversions'],
});
```

### useEventHistory
Get event history.

```tsx
const {
  events,
  loading,
  loadMore,
  hasMore,
} = useEventHistory({
  userId: user.id,
  limit: 50,
  eventTypes: ['purchase'],
});
```

## Database Schema

Add to your Supabase schema:

```sql
-- Events table
create table analytics_events (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete set null,
  session_id text,
  event_type text not null,
  event_properties jsonb,
  page_url text,
  referrer text,
  user_agent text,
  ip_address inet,
  country text,
  city text,
  device_type text,
  browser text,
  os text,
  created_at timestamp with time zone default now()
);

-- Metrics table (aggregated daily)
create table analytics_metrics (
  id uuid default uuid_generate_v4() primary key,
  date date not null,
  metric_name text not null,
  metric_value numeric not null,
  dimensions jsonb,
  created_at timestamp with time zone default now(),
  unique(date, metric_name, dimensions)
);

-- User properties
create table user_properties (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade unique,
  properties jsonb not null,
  updated_at timestamp with time zone default now()
);

-- Create indexes
create index idx_events_user_id on analytics_events(user_id);
create index idx_events_type on analytics_events(event_type);
create index idx_events_created_at on analytics_events(created_at);
create index idx_metrics_date on analytics_metrics(date);
create index idx_metrics_name on analytics_metrics(metric_name);

-- Enable RLS
alter table analytics_events enable row level security;
alter table analytics_metrics enable row level security;
alter table user_properties enable row level security;

-- Create policies (admin only for analytics)
create policy "Admins can view all events"
  on analytics_events for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

create policy "Service can insert events"
  on analytics_events for insert
  with check (true);

create policy "Admins can view all metrics"
  on analytics_metrics for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );
```

## Event Types

### Standard Events

```tsx
// Page views
track('page_view', { page: '/dashboard' });

// User actions
track('button_click', { button_id: 'cta', location: 'hero' });
track('form_submit', { form_id: 'contact' });
track('link_click', { url: 'https://example.com' });

// E-commerce
track('product_viewed', { product_id: '123' });
track('add_to_cart', { product_id: '123', quantity: 1 });
track('checkout_started', { cart_value: 99.99 });
track('purchase_completed', {
  order_id: 'ord_123',
  revenue: 99.99,
  currency: 'USD',
});

// User lifecycle
track('user_signed_up', { method: 'email' });
track('user_logged_in', { method: 'google' });
track('subscription_started', { plan: 'pro' });
track('subscription_canceled', { plan: 'pro', reason: 'too_expensive' });

// Features
track('feature_used', { feature: 'ai_chat' });
track('video_played', { video_id: '123', duration: 120 });
track('file_uploaded', { file_type: 'pdf', size: 1024 });
```

## Privacy Compliance

### GDPR Compliance

```tsx
import { requestConsent, hasConsent } from '@/features/analytics/utils/consent';

// Request consent
const granted = await requestConsent();

// Check consent before tracking
if (hasConsent()) {
  track('page_view');
}

// Delete user data
import { deleteUserData } from '@/features/analytics/utils/privacy';
await deleteUserData(userId);
```

### Anonymize IP Addresses

```tsx
// Automatically enabled in production
// IPs are hashed before storage
```

### Opt-Out

```tsx
import { setOptOut } from '@/features/analytics/utils/privacy';

// User opts out
setOptOut(true);

// Check opt-out status
const isOptedOut = getOptOut();
```

## Exporting Data

### Export to CSV

```tsx
import { exportToCSV } from '@/features/analytics/utils/export';

const csv = await exportToCSV({
  userId: user.id,
  dateRange: '30d',
  eventTypes: ['purchase'],
});

// Download file
const blob = new Blob([csv], { type: 'text/csv' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'analytics.csv';
a.click();
```

### Export to JSON

```tsx
import { exportToJSON } from '@/features/analytics/utils/export';

const data = await exportToJSON({
  userId: user.id,
  dateRange: '30d',
});
```

## Real-Time Analytics

### WebSocket Connection

```tsx
import { useRealtimeMetrics } from '@/features/analytics/hooks/useRealtimeMetrics';

const { activeUsers, recentEvents } = useRealtimeMetrics();
```

### Server-Sent Events

```tsx
// API route: /api/analytics/realtime
import { createRealtimeStream } from '@/features/analytics/api/realtime';

export async function GET(request: Request) {
  return createRealtimeStream();
}
```

## Custom Dashboards

### Create Custom Widgets

```tsx
import { Widget } from '@/features/analytics/components/Widget';

<Widget title="Custom Metric">
  <YourCustomVisualization />
</Widget>
```

### Combine Multiple Charts

```tsx
import { ChartGrid } from '@/features/analytics/components/ChartGrid';

<ChartGrid>
  <EventsChart />
  <ConversionFunnel />
  <MetricCard />
</ChartGrid>
```

## Performance Optimization

### Batch Events

Events are automatically batched and sent every 5 seconds or when batch reaches 10 events.

```tsx
// Configure batching
<AnalyticsProvider batchSize={20} batchInterval={10000}>
```

### Lazy Loading

```tsx
// Lazy load analytics dashboard
const AnalyticsDashboard = lazy(() =>
  import('@/features/analytics/components/AnalyticsDashboard')
);
```

## Testing

### Mock Analytics in Tests

```tsx
import { MockAnalyticsProvider } from '@/features/analytics/testing/MockAnalyticsProvider';

<MockAnalyticsProvider>
  <YourComponent />
</MockAnalyticsProvider>
```

### Verify Events

```tsx
import { getTrackedEvents } from '@/features/analytics/testing/utils';

// In test
fireEvent.click(button);
const events = getTrackedEvents();
expect(events).toContainEqual({
  type: 'button_click',
  properties: { button_id: 'cta' },
});
```

## Best Practices

1. **Event Naming**: Use snake_case for consistency
2. **Event Properties**: Keep properties flat and simple
3. **PII**: Never track personally identifiable information
4. **Sampling**: Sample high-volume events in production
5. **Error Handling**: Track errors and exceptions
6. **Performance**: Use batching for high-frequency events
7. **Documentation**: Document custom events

## Integration Examples

### PostHog Integration

```tsx
import posthog from 'posthog-js';

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  capture_pageview: false,
  autocapture: false,
});
```

### Google Analytics 4

```tsx
import ReactGA from 'react-ga4';

ReactGA.initialize(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!);
ReactGA.send('pageview');
```

## Troubleshooting

### Events not appearing
- Check browser console for errors
- Verify API keys are correct
- Check network tab for failed requests
- Ensure RLS policies allow inserts

### Dashboard loading slowly
- Add database indexes
- Implement caching
- Use aggregated metrics table
- Limit date range

### Privacy compliance issues
- Enable consent management
- Anonymize IP addresses
- Implement data deletion
- Add cookie banner

## Production Checklist

- [ ] Configure analytics provider
- [ ] Set up event schema
- [ ] Add consent management
- [ ] Test event tracking
- [ ] Create custom dashboards
- [ ] Set up alerts
- [ ] Document events
- [ ] Configure data retention
- [ ] Enable IP anonymization
- [ ] Test data export

## License

MIT - Free to use in commercial projects
