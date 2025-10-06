/**
 * Sentry Application Monitoring Setup
 *
 * Provides comprehensive error tracking, performance monitoring,
 * and release tracking for HermeticSaaS applications.
 */

import * as Sentry from '@sentry/nextjs';
import { ProfilingIntegration } from '@sentry/profiling-node';

interface SentryConfig {
  dsn: string;
  environment: 'development' | 'staging' | 'production';
  tracesSampleRate?: number;
  profilesSampleRate?: number;
  replaysSessionSampleRate?: number;
  replaysOnErrorSampleRate?: number;
}

/**
 * Initialize Sentry with HermeticSaaS best practices
 */
export function initSentry(config: SentryConfig) {
  Sentry.init({
    dsn: config.dsn,
    environment: config.environment,

    // Performance Monitoring
    tracesSampleRate: config.tracesSampleRate || (
      config.environment === 'production' ? 0.1 : 1.0
    ),

    // Profiling
    profilesSampleRate: config.profilesSampleRate || (
      config.environment === 'production' ? 0.1 : 1.0
    ),
    integrations: [
      new ProfilingIntegration(),
    ],

    // Session Replay
    replaysSessionSampleRate: config.replaysSessionSampleRate || 0.1,
    replaysOnErrorSampleRate: config.replaysOnErrorSampleRate || 1.0,

    // Enhanced error tracking
    beforeSend(event, hint) {
      // Filter out noise
      if (event.exception) {
        const error = hint.originalException;

        // Ignore network errors during development
        if (config.environment === 'development' &&
            error?.toString().includes('Network')) {
          return null;
        }

        // Ignore known third-party errors
        if (error?.toString().includes('ResizeObserver')) {
          return null;
        }
      }

      return event;
    },

    // Breadcrumbs for context
    beforeBreadcrumb(breadcrumb, hint) {
      // Sanitize sensitive data
      if (breadcrumb.category === 'console') {
        // Don't send console logs to Sentry
        return null;
      }

      if (breadcrumb.category === 'xhr' || breadcrumb.category === 'fetch') {
        // Remove sensitive headers
        if (breadcrumb.data?.headers) {
          delete breadcrumb.data.headers['authorization'];
          delete breadcrumb.data.headers['cookie'];
        }
      }

      return breadcrumb;
    },

    // Release tracking
    release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,

    // Source maps
    enableTracing: true,
  });
}

/**
 * Set user context for error tracking
 */
export function setSentryUser(user: {
  id: string;
  email?: string;
  username?: string;
  subscription?: string;
}) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
    subscription: user.subscription,
  });
}

/**
 * Clear user context on logout
 */
export function clearSentryUser() {
  Sentry.setUser(null);
}

/**
 * Set custom context for debugging
 */
export function setSentryContext(context: {
  feature?: string;
  action?: string;
  metadata?: Record<string, any>;
}) {
  Sentry.setContext('custom', context);
}

/**
 * Track custom events
 */
export function trackSentryEvent(
  eventName: string,
  data?: Record<string, any>
) {
  Sentry.captureMessage(eventName, {
    level: 'info',
    extra: data,
  });
}

/**
 * Manual error capture with context
 */
export function captureSentryError(
  error: Error,
  context?: {
    feature?: string;
    action?: string;
    metadata?: Record<string, any>;
  }
) {
  if (context) {
    setSentryContext(context);
  }

  Sentry.captureException(error);
}

/**
 * Performance monitoring wrapper
 */
export function withSentryPerformance<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  return Sentry.startSpan(
    {
      name,
      op: 'function',
    },
    async () => {
      return await fn();
    }
  );
}

/**
 * API route wrapper with error tracking
 */
export function withSentryAPI<T>(
  handler: (req: any, res: any) => Promise<T>
) {
  return async (req: any, res: any) => {
    try {
      return await Sentry.startSpan(
        {
          name: `${req.method} ${req.url}`,
          op: 'http.server',
          attributes: {
            'http.method': req.method,
            'http.url': req.url,
          },
        },
        async () => {
          return await handler(req, res);
        }
      );
    } catch (error) {
      captureSentryError(error as Error, {
        feature: 'api',
        action: req.url,
        metadata: {
          method: req.method,
          query: req.query,
        },
      });
      throw error;
    }
  };
}

// Export Sentry for direct access
export { Sentry };
