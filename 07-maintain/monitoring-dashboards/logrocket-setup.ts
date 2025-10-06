/**
 * LogRocket Session Replay Setup
 *
 * Provides session replay, user analytics, and frontend monitoring
 * for debugging user issues and improving UX.
 */

import LogRocket from 'logrocket';
import setupLogRocketReact from 'logrocket-react';

interface LogRocketConfig {
  appId: string;
  environment: 'development' | 'staging' | 'production';
  enabled?: boolean;
}

/**
 * Initialize LogRocket with privacy and performance settings
 */
export function initLogRocket(config: LogRocketConfig) {
  // Only run in production by default
  if (!config.enabled && config.environment !== 'production') {
    return;
  }

  LogRocket.init(config.appId, {
    // Network configuration
    network: {
      requestSanitizer: (request) => {
        // Remove sensitive headers
        if (request.headers['authorization']) {
          request.headers['authorization'] = '[REDACTED]';
        }

        if (request.headers['cookie']) {
          request.headers['cookie'] = '[REDACTED]';
        }

        // Remove sensitive query parameters
        if (request.url) {
          const url = new URL(request.url);
          if (url.searchParams.has('token')) {
            url.searchParams.set('token', '[REDACTED]');
            request.url = url.toString();
          }
        }

        return request;
      },

      responseSanitizer: (response) => {
        // Remove sensitive response data
        if (response.headers['set-cookie']) {
          response.headers['set-cookie'] = '[REDACTED]';
        }

        return response;
      },
    },

    // DOM configuration
    dom: {
      inputSanitizer: true, // Automatically sanitize input fields
      textSanitizer: true,  // Sanitize text content

      // Privacy: Don't record sensitive input types
      privateAttributeBlocklist: [
        'data-private',
        'data-sensitive',
      ],
    },

    // Console configuration
    console: {
      shouldAggregateConsoleErrors: true,
      isEnabled: {
        log: config.environment !== 'production',
        info: true,
        warn: true,
        error: true,
        debug: config.environment !== 'production',
      },
    },

    // Performance
    shouldCaptureIP: false, // Privacy: don't capture IPs
    shouldDebugLog: config.environment === 'development',

    // Release tracking
    release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
  });

  // Setup React plugin if using React
  if (typeof window !== 'undefined') {
    setupLogRocketReact(LogRocket);
  }
}

/**
 * Identify user for session tracking
 */
export function identifyLogRocketUser(user: {
  id: string;
  email?: string;
  name?: string;
  subscription?: string;
  createdAt?: string;
  mrr?: number;
}) {
  LogRocket.identify(user.id, {
    name: user.name,
    email: user.email,
    subscription: user.subscription,
    createdAt: user.createdAt,
    mrr: user.mrr,
  });
}

/**
 * Track custom events
 */
export function trackLogRocketEvent(
  eventName: string,
  properties?: Record<string, any>
) {
  LogRocket.track(eventName, properties);
}

/**
 * Add custom tags to session
 */
export function tagLogRocketSession(tags: Record<string, string>) {
  Object.entries(tags).forEach(([key, value]) => {
    LogRocket.addTag(key, value);
  });
}

/**
 * Capture console log
 */
export function logToLogRocket(
  level: 'log' | 'info' | 'warn' | 'error',
  message: string,
  data?: any
) {
  LogRocket.log(message, data);

  // Also log to console
  console[level](message, data);
}

/**
 * Get session URL for support
 */
export function getLogRocketSessionURL(): Promise<string> {
  return new Promise((resolve) => {
    LogRocket.getSessionURL((sessionURL) => {
      resolve(sessionURL);
    });
  });
}

/**
 * Capture user feedback
 */
export function captureLogRocketFeedback(feedback: {
  rating?: number;
  message?: string;
  metadata?: Record<string, any>;
}) {
  LogRocket.track('User Feedback', feedback);
}

/**
 * Integration with error tracking
 */
export function setupLogRocketIntegrations() {
  // Sentry integration
  if (typeof window !== 'undefined' && window.Sentry) {
    LogRocket.getSessionURL((sessionURL) => {
      window.Sentry.configureScope((scope: any) => {
        scope.setExtra('sessionURL', sessionURL);
      });
    });
  }
}

/**
 * Performance tracking
 */
export function trackPerformanceMetric(
  metricName: string,
  value: number,
  unit: string = 'ms'
) {
  LogRocket.track('Performance Metric', {
    metric: metricName,
    value,
    unit,
  });
}

/**
 * Feature usage tracking
 */
export function trackFeatureUsage(
  featureName: string,
  action: string,
  metadata?: Record<string, any>
) {
  LogRocket.track('Feature Usage', {
    feature: featureName,
    action,
    ...metadata,
  });
}

// Export LogRocket for direct access
export { LogRocket };
