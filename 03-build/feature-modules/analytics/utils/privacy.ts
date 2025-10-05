/**
 * Privacy and Consent Management
 */

const CONSENT_KEY = 'analytics_consent';
const OPT_OUT_KEY = 'analytics_opt_out';

/**
 * Check if user has granted consent
 */
export function hasConsent(): boolean {
  if (typeof window === 'undefined') return false;
  const consent = localStorage.getItem(CONSENT_KEY);
  return consent === 'granted';
}

/**
 * Set user consent
 */
export function setConsent(granted: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CONSENT_KEY, granted ? 'granted' : 'denied');
}

/**
 * Request consent from user
 */
export async function requestConsent(): Promise<boolean> {
  // This is a simple implementation
  // In production, use a proper consent management platform
  const granted = confirm(
    'We use analytics to improve our service. Do you consent to analytics tracking?'
  );
  setConsent(granted);
  return granted;
}

/**
 * Check if user has opted out
 */
export function getOptOut(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(OPT_OUT_KEY) === 'true';
}

/**
 * Set opt-out preference
 */
export function setOptOut(optOut: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(OPT_OUT_KEY, String(optOut));
}

/**
 * Anonymize IP address
 */
export function anonymizeIP(ip: string): string {
  const parts = ip.split('.');
  if (parts.length === 4) {
    // IPv4: Replace last octet with 0
    return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
  } else {
    // IPv6: Keep first 48 bits
    const ipv6Parts = ip.split(':');
    return ipv6Parts.slice(0, 3).join(':') + '::';
  }
}

/**
 * Hash sensitive data
 */
export async function hashData(data: string): Promise<string> {
  if (typeof window === 'undefined') return data;

  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Delete user analytics data
 */
export async function deleteUserData(userId: string): Promise<void> {
  try {
    const response = await fetch('/api/analytics/delete-user-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error('Failed to delete user data');
    }
  } catch (error: any) {
    console.error('Error deleting user data:', error);
    throw error;
  }
}

/**
 * Check if tracking is allowed
 */
export function isTrackingAllowed(): boolean {
  return hasConsent() && !getOptOut();
}
