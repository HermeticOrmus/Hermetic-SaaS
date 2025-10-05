/**
 * Stripe Webhook Handler
 *
 * Process Stripe webhook events
 */

import Stripe from 'stripe';
import { stripe } from '../lib/stripe';
import { createServerClient } from '../../authentication/lib/supabase';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function handleStripeWebhook(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return new Response('Missing stripe-signature header', { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (err: any) {
    console.error('Error processing webhook:', err);
    return new Response(`Webhook processing error: ${err.message}`, {
      status: 500,
    });
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const supabase = createServerClient();

  const customerId = subscription.customer as string;
  const priceId = subscription.items.data[0]?.price.id;

  // Get user by customer ID
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!profile) {
    console.error('No user found for customer:', customerId);
    return;
  }

  // Create subscription record
  await supabase.from('subscriptions').insert({
    user_id: profile.id,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    stripe_price_id: priceId,
    status: subscription.status,
    current_period_start: new Date(subscription.current_period_start * 1000),
    current_period_end: new Date(subscription.current_period_end * 1000),
    cancel_at_period_end: subscription.cancel_at_period_end,
  });

  // Update profile
  await supabase
    .from('profiles')
    .update({
      stripe_subscription_id: subscription.id,
      subscription_status: subscription.status,
      subscription_current_period_end: new Date(
        subscription.current_period_end * 1000
      ),
    })
    .eq('id', profile.id);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const supabase = createServerClient();

  const priceId = subscription.items.data[0]?.price.id;

  // Update subscription record
  await supabase
    .from('subscriptions')
    .update({
      stripe_price_id: priceId,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000),
      current_period_end: new Date(subscription.current_period_end * 1000),
      cancel_at_period_end: subscription.cancel_at_period_end,
      canceled_at: subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000)
        : null,
      updated_at: new Date(),
    })
    .eq('stripe_subscription_id', subscription.id);

  // Update profile
  const customerId = subscription.customer as string;
  await supabase
    .from('profiles')
    .update({
      subscription_status: subscription.status,
      subscription_current_period_end: new Date(
        subscription.current_period_end * 1000
      ),
    })
    .eq('stripe_customer_id', customerId);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const supabase = createServerClient();

  // Update subscription to canceled
  await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date(),
      updated_at: new Date(),
    })
    .eq('stripe_subscription_id', subscription.id);

  // Update profile
  const customerId = subscription.customer as string;
  await supabase
    .from('profiles')
    .update({
      subscription_status: 'canceled',
    })
    .eq('stripe_customer_id', customerId);
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const supabase = createServerClient();

  const customerId = invoice.customer as string;

  // Get user by customer ID
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!profile) {
    console.error('No user found for customer:', customerId);
    return;
  }

  // Create invoice record
  await supabase.from('invoices').insert({
    user_id: profile.id,
    stripe_invoice_id: invoice.id,
    stripe_customer_id: customerId,
    amount_paid: invoice.amount_paid,
    currency: invoice.currency,
    status: invoice.status || 'paid',
    invoice_pdf: invoice.invoice_pdf,
  });
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const supabase = createServerClient();

  // Update subscription status to past_due
  if (invoice.subscription) {
    await supabase
      .from('subscriptions')
      .update({
        status: 'past_due',
        updated_at: new Date(),
      })
      .eq('stripe_subscription_id', invoice.subscription as string);

    const customerId = invoice.customer as string;
    await supabase
      .from('profiles')
      .update({
        subscription_status: 'past_due',
      })
      .eq('stripe_customer_id', customerId);
  }

  // TODO: Send email notification to user about failed payment
  console.log('Payment failed for invoice:', invoice.id);
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const supabase = createServerClient();

  // Get or create customer record
  if (session.customer && session.customer_email) {
    const customerId = session.customer as string;

    // Update user profile with Stripe customer ID
    await supabase
      .from('profiles')
      .update({
        stripe_customer_id: customerId,
      })
      .eq('email', session.customer_email);
  }

  // If this was a subscription checkout, the subscription events will handle the rest
  console.log('Checkout completed:', session.id);
}
