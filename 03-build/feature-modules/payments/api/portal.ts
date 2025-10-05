/**
 * Customer Portal API
 *
 * Create Stripe customer portal sessions
 */

import { stripe } from '../lib/stripe';
import type { PortalSessionOptions } from '../types';

export async function createPortalSession(options: PortalSessionOptions) {
  const { customerId, returnUrl } = options;

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return session;
  } catch (error: any) {
    console.error('Error creating portal session:', error);
    throw new Error(error.message || 'Failed to create portal session');
  }
}
