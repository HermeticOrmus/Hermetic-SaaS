/**
 * Stripe Client Configuration
 *
 * Server and client Stripe instances
 */

import Stripe from 'stripe';
import { loadStripe, type Stripe as StripeClient } from '@stripe/stripe-js';

// Server-side Stripe instance
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  typescript: true,
});

// Client-side Stripe instance (lazy loaded)
let stripePromise: Promise<StripeClient | null>;

export const getStripe = () => {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      throw new Error('Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY');
    }
    stripePromise = loadStripe(key);
  }
  return stripePromise;
};
