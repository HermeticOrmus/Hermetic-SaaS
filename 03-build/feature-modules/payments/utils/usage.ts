/**
 * Usage-Based Billing Utilities
 */

import { stripe } from '../lib/stripe';
import type { UsageRecord } from '../types';

/**
 * Report usage for metered billing
 */
export async function reportUsage(options: UsageRecord) {
  const {
    subscriptionItemId,
    quantity,
    timestamp = Math.floor(Date.now() / 1000),
    action = 'increment',
  } = options;

  try {
    const usageRecord = await stripe.subscriptionItems.createUsageRecord(
      subscriptionItemId,
      {
        quantity,
        timestamp,
        action,
      }
    );

    return usageRecord;
  } catch (error: any) {
    console.error('Error reporting usage:', error);
    throw new Error(error.message || 'Failed to report usage');
  }
}

/**
 * Get usage records for a subscription item
 */
export async function getUsageRecords(
  subscriptionItemId: string,
  startDate?: Date,
  endDate?: Date
) {
  try {
    const params: any = {
      limit: 100,
    };

    if (startDate) {
      params.starting_after = Math.floor(startDate.getTime() / 1000);
    }

    if (endDate) {
      params.ending_before = Math.floor(endDate.getTime() / 1000);
    }

    const usageRecords = await stripe.subscriptionItems.listUsageRecordSummaries(
      subscriptionItemId,
      params
    );

    return usageRecords.data;
  } catch (error: any) {
    console.error('Error fetching usage records:', error);
    throw new Error(error.message || 'Failed to fetch usage records');
  }
}

/**
 * Get total usage for billing period
 */
export async function getBillingPeriodUsage(subscriptionItemId: string) {
  try {
    const summaries = await stripe.subscriptionItems.listUsageRecordSummaries(
      subscriptionItemId,
      { limit: 1 }
    );

    return summaries.data[0]?.total_usage || 0;
  } catch (error: any) {
    console.error('Error fetching billing period usage:', error);
    throw new Error(error.message || 'Failed to fetch billing period usage');
  }
}
