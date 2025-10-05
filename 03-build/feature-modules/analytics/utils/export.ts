/**
 * Analytics Export Utilities
 */

import type { AnalyticsEvent, ExportOptions } from '../types';

/**
 * Export analytics data to CSV
 */
export function exportToCSV(events: AnalyticsEvent[]): string {
  if (events.length === 0) {
    return 'No data to export';
  }

  // CSV headers
  const headers = [
    'Event Type',
    'User ID',
    'Session ID',
    'Page URL',
    'Timestamp',
    'Properties',
  ];

  // CSV rows
  const rows = events.map((event) => [
    event.eventType,
    event.userId || '',
    event.sessionId || '',
    event.pageUrl || '',
    event.createdAt?.toISOString() || '',
    JSON.stringify(event.eventProperties || {}),
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\n');

  return csvContent;
}

/**
 * Export analytics data to JSON
 */
export function exportToJSON(events: AnalyticsEvent[]): string {
  return JSON.stringify(events, null, 2);
}

/**
 * Fetch and export analytics data
 */
export async function fetchAndExport(
  options: ExportOptions
): Promise<string> {
  const { userId, dateRange, eventTypes, format = 'csv' } = options;

  try {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (dateRange) params.append('dateRange', dateRange);
    if (eventTypes) params.append('eventTypes', eventTypes.join(','));

    const response = await fetch(`/api/analytics/export?${params}`);
    if (!response.ok) {
      throw new Error('Failed to fetch analytics data');
    }

    const events: AnalyticsEvent[] = await response.json();

    return format === 'csv' ? exportToCSV(events) : exportToJSON(events);
  } catch (error: any) {
    console.error('Export error:', error);
    throw new Error(error.message || 'Failed to export data');
  }
}

/**
 * Download exported data as file
 */
export function downloadExport(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
