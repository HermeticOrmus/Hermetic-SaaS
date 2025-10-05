/**
 * Analytics Type Definitions
 */

export interface AnalyticsEvent {
  id?: string;
  userId?: string;
  sessionId?: string;
  eventType: string;
  eventProperties?: Record<string, any>;
  pageUrl?: string;
  referrer?: string;
  userAgent?: string;
  ipAddress?: string;
  country?: string;
  city?: string;
  deviceType?: string;
  browser?: string;
  os?: string;
  createdAt?: Date;
}

export interface MetricData {
  date: Date;
  metricName: string;
  metricValue: number;
  dimensions?: Record<string, any>;
}

export interface UserProperties {
  userId: string;
  properties: Record<string, any>;
  updatedAt: Date;
}

export interface AnalyticsContextType {
  track: (eventType: string, properties?: Record<string, any>) => void;
  page: (pagePath: string, properties?: Record<string, any>) => void;
  identify: (userId: string, properties?: Record<string, any>) => void;
  group: (groupId: string, properties?: Record<string, any>) => void;
  reset: () => void;
}

export interface MetricCardData {
  title: string;
  value: number | string;
  change?: number;
  changeLabel?: string;
  trend?: 'up' | 'down' | 'neutral';
  format?: 'number' | 'currency' | 'percentage';
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface ConversionStep {
  name: string;
  count: number;
  percentage?: number;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface ExportOptions {
  userId?: string;
  dateRange?: string;
  eventTypes?: string[];
  format?: 'csv' | 'json';
}

export interface RealtimeData {
  activeUsers: number;
  recentEvents: AnalyticsEvent[];
  topPages: Array<{ page: string; count: number }>;
}
