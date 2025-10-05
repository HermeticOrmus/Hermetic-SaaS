/**
 * Payments Module - Export Index
 *
 * Import everything you need from a single entry point
 */

// Components
export { CheckoutButton } from './components/CheckoutButton';
export { CustomerPortalButton } from './components/CustomerPortalButton';
export { PricingTable } from './components/PricingTable';

// API
export { createCheckoutSession } from './api/checkout';
export { createPortalSession } from './api/portal';

// Utils
export {
  updateSubscription,
  cancelSubscription,
  reactivateSubscription,
  getSubscription,
  listCustomerSubscriptions,
} from './utils/subscription';

export { reportUsage, getUsageRecords, getBillingPeriodUsage } from './utils/usage';
export { handleStripeWebhook } from './utils/webhook-handler';

// Lib
export { stripe, getStripe } from './lib/stripe';

// Types
export type {
  Subscription,
  SubscriptionStatus,
  Invoice,
  CheckoutSessionOptions,
  PortalSessionOptions,
  UpdateSubscriptionOptions,
  CancelSubscriptionOptions,
  UsageRecord,
  PricingPlan,
} from './types';
