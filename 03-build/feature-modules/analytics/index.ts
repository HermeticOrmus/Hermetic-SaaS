/**
 * Analytics Module - Export Index
 *
 * Import everything you need from a single entry point
 */

// Providers
export { AnalyticsProvider } from './providers/AnalyticsProvider';

// Hooks
export { useAnalytics } from './hooks/useAnalytics';

// Components
export { AnalyticsDashboard } from './components/AnalyticsDashboard';
export { MetricCard } from './components/MetricCard';
export { EventsChart } from './components/EventsChart';

// Utils
export {
  exportToCSV,
  exportToJSON,
  fetchAndExport,
  downloadExport,
} from './utils/export';

export {
  hasConsent,
  setConsent,
  requestConsent,
  getOptOut,
  setOptOut,
  anonymizeIP,
  hashData,
  deleteUserData,
  isTrackingAllowed,
} from './utils/privacy';

// Types
export type {
  AnalyticsEvent,
  MetricData,
  UserProperties,
  AnalyticsContextType,
  MetricCardData,
  ChartDataPoint,
  ConversionStep,
  DateRange,
  ExportOptions,
  RealtimeData,
} from './types';
