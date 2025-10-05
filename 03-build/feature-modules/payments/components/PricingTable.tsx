/**
 * PricingTable Component
 *
 * Pre-built pricing table with multiple tiers
 */

'use client';

import React from 'react';
import { CheckoutButton } from './CheckoutButton';
import type { PricingPlan } from '../types';

interface PricingTableProps {
  plans: PricingPlan[];
  currentPlanId?: string;
  className?: string;
}

export function PricingTable({
  plans,
  currentPlanId,
  className = '',
}: PricingTableProps) {
  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className={`grid md:grid-cols-${plans.length} gap-8 ${className}`}>
      {plans.map((plan) => {
        const isCurrentPlan = currentPlanId === plan.id;

        return (
          <div
            key={plan.id}
            className={`relative rounded-2xl border-2 p-8 ${
              plan.highlighted
                ? 'border-blue-600 shadow-xl scale-105'
                : 'border-gray-200 dark:border-gray-700'
            } bg-white dark:bg-gray-800`}
          >
            {plan.highlighted && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                Most Popular
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {plan.name}
              </h3>
              {plan.description && (
                <p className="text-gray-600 dark:text-gray-400">
                  {plan.description}
                </p>
              )}
            </div>

            <div className="mb-6">
              <div className="flex items-baseline">
                <span className="text-5xl font-bold text-gray-900 dark:text-white">
                  {formatPrice(plan.price, plan.currency)}
                </span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">
                  /{plan.interval}
                </span>
              </div>
              {plan.trialDays && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {plan.trialDays}-day free trial
                </p>
              )}
            </div>

            <ul className="mb-8 space-y-3">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <svg
                    className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            {isCurrentPlan ? (
              <button
                disabled
                className="w-full py-3 px-6 bg-gray-300 text-gray-700 font-medium rounded-lg cursor-not-allowed"
              >
                Current Plan
              </button>
            ) : (
              <CheckoutButton
                priceId={plan.priceId}
                mode="subscription"
                trialPeriodDays={plan.trialDays}
                className={`w-full py-3 px-6 font-medium rounded-lg transition-colors ${
                  plan.highlighted
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                }`}
              >
                {plan.trialDays ? 'Start Free Trial' : 'Subscribe'}
              </CheckoutButton>
            )}
          </div>
        );
      })}
    </div>
  );
}
