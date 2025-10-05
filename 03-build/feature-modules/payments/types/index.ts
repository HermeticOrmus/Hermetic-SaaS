/**
 * Payment Type Definitions
 */

import type Stripe from 'stripe';

export interface Subscription {
  id: string;
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  stripePriceId: string;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  canceledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'past_due'
  | 'trialing'
  | 'unpaid';

export interface Invoice {
  id: string;
  userId: string;
  stripeInvoiceId: string;
  stripeCustomerId: string;
  amountPaid: number;
  currency: string;
  status: string;
  invoicePdf: string | null;
  createdAt: Date;
}

export interface CheckoutSessionOptions {
  priceId: string;
  mode: 'payment' | 'subscription';
  customerId?: string;
  customerEmail?: string;
  successUrl: string;
  cancelUrl: string;
  trialPeriodDays?: number;
  couponCode?: string;
  metadata?: Record<string, string>;
  allowPromotionCodes?: boolean;
  paymentMethodTypes?: Stripe.Checkout.SessionCreateParams.PaymentMethodType[];
}

export interface PortalSessionOptions {
  customerId: string;
  returnUrl: string;
}

export interface UpdateSubscriptionOptions {
  subscriptionId: string;
  newPriceId: string;
  prorationBehavior?: Stripe.SubscriptionUpdateParams.ProrationBehavior;
}

export interface CancelSubscriptionOptions {
  subscriptionId: string;
  cancelAtPeriodEnd: boolean;
}

export interface UsageRecord {
  subscriptionItemId: string;
  quantity: number;
  timestamp?: number;
  action?: 'increment' | 'set';
}

export interface PricingPlan {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  priceId: string;
  features: string[];
  highlighted?: boolean;
  trialDays?: number;
}
