/**
 * In-App Purchases Service (RevenueCat)
 *
 * Hermetic Principle: No Schemes
 * - Transparent pricing
 * - Easy subscription management
 */

import Purchases, {
  PurchasesPackage,
  CustomerInfo,
  PurchasesOfferings,
} from 'react-native-revenuecat';
import { Platform } from 'react-native';
import { trackConversion } from './analytics';

/**
 * Initialize RevenueCat SDK
 */
export async function initializePurchases(userId: string): Promise<void> {
  const apiKey = Platform.select({
    ios: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS!,
    android: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID!,
  });

  if (!apiKey) {
    console.warn('RevenueCat API key not configured');
    return;
  }

  try {
    await Purchases.configure({ apiKey, appUserID: userId });
    console.log('RevenueCat initialized');
  } catch (error) {
    console.error('Error initializing RevenueCat:', error);
  }
}

/**
 * Get available subscription offerings
 */
export async function getOfferings(): Promise<PurchasesPackage[]> {
  try {
    const offerings: PurchasesOfferings = await Purchases.getOfferings();
    if (offerings.current !== null) {
      return offerings.current.availablePackages;
    }
    return [];
  } catch (error) {
    console.error('Error fetching offerings:', error);
    return [];
  }
}

/**
 * Purchase a subscription package
 */
export async function purchasePackage(pkg: PurchasesPackage): Promise<{
  success: boolean;
  isPro: boolean;
  productIdentifier?: string;
  error?: string;
}> {
  try {
    const { customerInfo, productIdentifier } = await Purchases.purchasePackage(
      pkg
    );

    const isPro = customerInfo.entitlements.active['pro'] !== undefined;

    // Track successful purchase
    if (isPro) {
      trackConversion('Subscription Purchase', pkg.product.price, 'USD');
    }

    return { success: true, isPro, productIdentifier };
  } catch (error: any) {
    if (error.userCancelled) {
      return { success: false, isPro: false, error: 'User cancelled' };
    }

    console.error('Purchase error:', error);
    return { success: false, isPro: false, error: error.message };
  }
}

/**
 * Restore previous purchases
 */
export async function restorePurchases(): Promise<{
  success: boolean;
  isPro: boolean;
}> {
  try {
    const customerInfo: CustomerInfo = await Purchases.restorePurchases();
    const isPro = customerInfo.entitlements.active['pro'] !== undefined;

    return { success: true, isPro };
  } catch (error) {
    console.error('Restore error:', error);
    return { success: false, isPro: false };
  }
}

/**
 * Check current subscription status
 */
export async function getSubscriptionStatus(): Promise<{
  isPro: boolean;
  expirationDate: string | null;
  willRenew: boolean;
  productIdentifier: string | null;
}> {
  try {
    const customerInfo: CustomerInfo = await Purchases.getCustomerInfo();
    const proEntitlement = customerInfo.entitlements.active['pro'];

    if (proEntitlement) {
      return {
        isPro: true,
        expirationDate: proEntitlement.expirationDate,
        willRenew: proEntitlement.willRenew,
        productIdentifier: proEntitlement.productIdentifier,
      };
    }

    return {
      isPro: false,
      expirationDate: null,
      willRenew: false,
      productIdentifier: null,
    };
  } catch (error) {
    console.error('Status check error:', error);
    return {
      isPro: false,
      expirationDate: null,
      willRenew: false,
      productIdentifier: null,
    };
  }
}

/**
 * Cancel subscription (directs user to store)
 */
export async function manageSubscription(): Promise<void> {
  try {
    // This will open the subscription management page
    // iOS: App Store
    // Android: Play Store
    await Purchases.showManagementScreen();
  } catch (error) {
    console.error('Error opening management screen:', error);
  }
}
