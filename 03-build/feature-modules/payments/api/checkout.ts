/**
 * Checkout Session API
 *
 * Create Stripe checkout sessions
 */

import { stripe } from '../lib/stripe';
import type { CheckoutSessionOptions } from '../types';

export async function createCheckoutSession(
  options: CheckoutSessionOptions
) {
  const {
    priceId,
    mode,
    customerId,
    customerEmail,
    successUrl,
    cancelUrl,
    trialPeriodDays,
    couponCode,
    metadata,
    allowPromotionCodes = true,
    paymentMethodTypes = ['card'],
  } = options;

  const sessionParams: any = {
    mode,
    payment_method_types: paymentMethodTypes,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: allowPromotionCodes,
    metadata,
  };

  // Add customer or email
  if (customerId) {
    sessionParams.customer = customerId;
  } else if (customerEmail) {
    sessionParams.customer_email = customerEmail;
  }

  // Add trial period for subscriptions
  if (mode === 'subscription' && trialPeriodDays) {
    sessionParams.subscription_data = {
      trial_period_days: trialPeriodDays,
    };
  }

  // Add coupon code
  if (couponCode) {
    sessionParams.discounts = [
      {
        coupon: couponCode,
      },
    ];
  }

  try {
    const session = await stripe.checkout.sessions.create(sessionParams);
    return session;
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    throw new Error(error.message || 'Failed to create checkout session');
  }
}
