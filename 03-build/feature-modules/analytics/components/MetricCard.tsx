/**
 * MetricCard Component
 *
 * Display individual metrics with trend indicators
 */

'use client';

import React from 'react';
import type { MetricCardData } from '../types';

interface MetricCardProps extends MetricCardData {
  icon?: React.ReactNode;
  className?: string;
}

export function MetricCard({
  title,
  value,
  change,
  changeLabel,
  trend,
  format = 'number',
  icon,
  className = '',
}: MetricCardProps) {
  const formatValue = (val: number | string) => {
    if (typeof val === 'string') return val;

    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(val);
      case 'percentage':
        return `${val.toFixed(1)}%`;
      default:
        return new Intl.NumberFormat('en-US').format(val);
    }
  };

  const getTrendColor = () => {
    if (!change) return '';
    if (trend === 'up' || change > 0)
      return 'text-green-600 dark:text-green-400';
    if (trend === 'down' || change < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getTrendIcon = () => {
    if (!change) return null;
    if (change > 0) {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 10l7-7m0 0l7 7m-7-7v18"
          />
        </svg>
      );
    } else {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      );
    }
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {formatValue(value)}
          </p>
          {change !== undefined && (
            <div className={`mt-2 flex items-center text-sm ${getTrendColor()}`}>
              {getTrendIcon()}
              <span className="ml-1">
                {Math.abs(change)}%
                {changeLabel && (
                  <span className="ml-1 text-gray-600 dark:text-gray-400">
                    {changeLabel}
                  </span>
                )}
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className="ml-4 p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
