/**
 * Analytics Service
 *
 * Hermetic Principle: No Schemes
 * - Track what matters, not everything
 * - Privacy-first analytics
 */

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: Date;
}

interface UserProperties {
  userId?: string;
  email?: string;
  [key: string]: any;
}

class AnalyticsService {
  private isEnabled: boolean;
  private userId: string | null = null;

  constructor() {
    this.isEnabled = process.env.EXPO_PUBLIC_ENABLE_ANALYTICS === 'true';
  }

  /**
   * Initialize analytics with user context
   */
  async initialize(userId?: string): Promise<void> {
    if (!this.isEnabled) return;

    if (userId) {
      this.userId = userId;
      // TODO: Initialize Mixpanel/Amplitude with user ID
      // const Mixpanel = await import('mixpanel-react-native');
      // await Mixpanel.init(process.env.EXPO_PUBLIC_MIXPANEL_TOKEN!);
      // Mixpanel.identify(userId);
    }

    this.track('App Initialized');
  }

  /**
   * Track an event
   */
  track(eventName: string, properties?: Record<string, any>): void {
    if (!this.isEnabled) return;

    const event: AnalyticsEvent = {
      name: eventName,
      properties,
      timestamp: new Date(),
    };

    // Log to console in development
    if (__DEV__) {
      console.log('[Analytics]', event);
    }

    // TODO: Send to analytics provider
    // mixpanel?.track(eventName, properties);
  }

  /**
   * Track screen view
   */
  screen(screenName: string, properties?: Record<string, any>): void {
    this.track('Screen View', {
      screen: screenName,
      ...properties,
    });
  }

  /**
   * Set user properties
   */
  setUserProperties(properties: UserProperties): void {
    if (!this.isEnabled) return;

    if (__DEV__) {
      console.log('[Analytics] User Properties:', properties);
    }

    // TODO: Send to analytics provider
    // mixpanel?.getPeople().set(properties);
  }

  /**
   * Track conversion event (purchase, signup, etc.)
   */
  conversion(eventName: string, value?: number, currency?: string): void {
    this.track(eventName, {
      value,
      currency,
      conversion: true,
    });
  }

  /**
   * Reset analytics (on logout)
   */
  reset(): void {
    this.userId = null;
    // TODO: Reset analytics provider
    // mixpanel?.reset();
  }
}

// Export singleton instance
export const analytics = new AnalyticsService();

// Convenience exports
export const trackEvent = analytics.track.bind(analytics);
export const trackScreen = analytics.screen.bind(analytics);
export const setUserProperties = analytics.setUserProperties.bind(analytics);
export const trackConversion = analytics.conversion.bind(analytics);
