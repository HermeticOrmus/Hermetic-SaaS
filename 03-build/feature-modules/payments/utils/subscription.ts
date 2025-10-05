/**
 * Subscription Management Utilities
 */

import { stripe } from '../lib/stripe';
import type {
  UpdateSubscriptionOptions,
  CancelSubscriptionOptions,
} from '../types';

/**
 * Update subscription (upgrade/downgrade)
 */
export async function updateSubscription(options: UpdateSubscriptionOptions) {
  const { subscriptionId, newPriceId, prorationBehavior = 'always_invoice' } =
    options;

  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    const updatedSubscription = await stripe.subscriptions.update(
      subscriptionId,
      {
        items: [
          {
            id: subscription.items.data[0].id,
            price: newPriceId,
          },
        ],
        proration_behavior: prorationBehavior,
      }
    );

    return updatedSubscription;
  } catch (error: any) {
    console.error('Error updating subscription:', error);
    throw new Error(error.message || 'Failed to update subscription');
  }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(options: CancelSubscriptionOptions) {
  const { subscriptionId, cancelAtPeriodEnd } = options;

  try {
    if (cancelAtPeriodEnd) {
      // Cancel at end of billing period
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
      return subscription;
    } else {
      // Cancel immediately
      const subscription = await stripe.subscriptions.cancel(subscriptionId);
      return subscription;
    }
  } catch (error: any) {
    console.error('Error canceling subscription:', error);
    throw new Error(error.message || 'Failed to cancel subscription');
  }
}

/**
 * Reactivate canceled subscription
 */
export async function reactivateSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });
    return subscription;
  } catch (error: any) {
    console.error('Error reactivating subscription:', error);
    throw new Error(error.message || 'Failed to reactivate subscription');
  }
}

/**
 * Get subscription details
 */
export async function getSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return subscription;
  } catch (error: any) {
    console.error('Error fetching subscription:', error);
    throw new Error(error.message || 'Failed to fetch subscription');
  }
}

/**
 * List customer subscriptions
 */
export async function listCustomerSubscriptions(customerId: string) {
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      expand: ['data.default_payment_method'],
    });
    return subscriptions.data;
  } catch (error: any) {
    console.error('Error listing subscriptions:', error);
    throw new Error(error.message || 'Failed to list subscriptions');
  }
}
