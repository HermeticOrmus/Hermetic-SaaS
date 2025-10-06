/**
 * Multi-Product Infrastructure
 *
 * Shared systems and patterns for managing multiple MicroSaaS products:
 * - Centralized authentication (SSO)
 * - Shared billing system
 * - Cross-product analytics
 * - Unified support system
 * - Code patterns for feature sharing
 */

// ============================================================================
// 1. CENTRALIZED AUTHENTICATION (SSO)
// ============================================================================

/**
 * Shared authentication service used by all products
 */

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
  lastLoginAt: Date;
  productAccess: ProductAccess[];
  billingInfo: BillingInfo;
}

interface ProductAccess {
  productId: string;
  productName: string;
  plan: 'free' | 'basic' | 'pro' | 'enterprise';
  status: 'active' | 'trialing' | 'past_due' | 'cancelled';
  permissions: string[];
  addedAt: Date;
}

interface BillingInfo {
  customerId: string; // Stripe customer ID
  paymentMethod?: {
    type: 'card' | 'paypal';
    last4: string;
    brand: string;
  };
  billingEmail?: string;
  taxId?: string;
}

// Auth Service - Single source of truth for authentication
export class PortfolioAuthService {
  private jwtSecret: string;
  private db: any; // Your database instance

  constructor(jwtSecret: string, db: any) {
    this.jwtSecret = jwtSecret;
    this.db = db;
  }

  /**
   * Register user (one account for all products)
   */
  async register(email: string, password: string, name: string): Promise<User> {
    // Check if user exists
    const existing = await this.db.users.findOne({ email });
    if (existing) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(password);

    // Create user
    const user: User = {
      id: this.generateId(),
      email,
      name,
      createdAt: new Date(),
      lastLoginAt: new Date(),
      productAccess: [], // No products yet
      billingInfo: {
        customerId: await this.createStripeCustomer(email, name)
      }
    };

    await this.db.users.insert({
      ...user,
      password: hashedPassword
    });

    return user;
  }

  /**
   * Login (works for all products)
   */
  async login(email: string, password: string): Promise<{
    user: User;
    accessToken: string;
    refreshToken: string;
  }> {
    const userRecord = await this.db.users.findOne({ email });
    if (!userRecord) {
      throw new Error('Invalid credentials');
    }

    const valid = await this.verifyPassword(password, userRecord.password);
    if (!valid) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    await this.db.users.update(
      { id: userRecord.id },
      { lastLoginAt: new Date() }
    );

    const user = this.sanitizeUser(userRecord);
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return { user, accessToken, refreshToken };
  }

  /**
   * Validate token (used by all product APIs)
   */
  async validateToken(token: string): Promise<User> {
    try {
      const decoded = this.verifyJWT(token);
      const user = await this.db.users.findOne({ id: decoded.userId });

      if (!user) {
        throw new Error('User not found');
      }

      return this.sanitizeUser(user);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  /**
   * Grant product access
   */
  async grantProductAccess(
    userId: string,
    productId: string,
    plan: ProductAccess['plan']
  ): Promise<void> {
    const user = await this.db.users.findOne({ id: userId });

    const access: ProductAccess = {
      productId,
      productName: this.getProductName(productId),
      plan,
      status: 'active',
      permissions: this.getDefaultPermissions(productId, plan),
      addedAt: new Date()
    };

    // Add or update product access
    const existingIndex = user.productAccess.findIndex(
      (p: ProductAccess) => p.productId === productId
    );

    if (existingIndex >= 0) {
      user.productAccess[existingIndex] = access;
    } else {
      user.productAccess.push(access);
    }

    await this.db.users.update(
      { id: userId },
      { productAccess: user.productAccess }
    );
  }

  /**
   * Check if user has access to product
   */
  async hasProductAccess(
    userId: string,
    productId: string,
    requiredPermission?: string
  ): Promise<boolean> {
    const user = await this.db.users.findOne({ id: userId });
    const access = user.productAccess.find(
      (p: ProductAccess) => p.productId === productId
    );

    if (!access || access.status !== 'active') {
      return false;
    }

    if (requiredPermission) {
      return access.permissions.includes(requiredPermission);
    }

    return true;
  }

  private hashPassword(password: string): Promise<string> {
    // Use bcrypt or similar
    return Promise.resolve('hashed_' + password);
  }

  private verifyPassword(password: string, hash: string): Promise<boolean> {
    return Promise.resolve(hash === 'hashed_' + password);
  }

  private generateAccessToken(user: User): string {
    // JWT with 1 hour expiry
    return this.createJWT({ userId: user.id }, '1h');
  }

  private generateRefreshToken(user: User): string {
    // JWT with 30 day expiry
    return this.createJWT({ userId: user.id }, '30d');
  }

  private createJWT(payload: any, expiresIn: string): string {
    // Use jsonwebtoken library
    return `jwt_token_${JSON.stringify(payload)}_${expiresIn}`;
  }

  private verifyJWT(token: string): any {
    // Verify and decode JWT
    const parts = token.split('_');
    return JSON.parse(parts[2]);
  }

  private generateId(): string {
    return 'user_' + Date.now() + Math.random().toString(36).substr(2, 9);
  }

  private async createStripeCustomer(email: string, name: string): Promise<string> {
    // Create Stripe customer
    return 'cus_' + Math.random().toString(36).substr(2, 9);
  }

  private sanitizeUser(userRecord: any): User {
    const { password, ...user } = userRecord;
    return user;
  }

  private getProductName(productId: string): string {
    const products: Record<string, string> = {
      'product_a': 'TaskFlow Pro',
      'product_b': 'FormBuilder',
      'product_c': 'APIMonitor'
    };
    return products[productId] || 'Unknown Product';
  }

  private getDefaultPermissions(productId: string, plan: string): string[] {
    const basePermissions = ['read', 'create'];
    if (plan === 'pro' || plan === 'enterprise') {
      return [...basePermissions, 'update', 'delete', 'export'];
    }
    return basePermissions;
  }
}

// ============================================================================
// 2. SHARED BILLING SYSTEM
// ============================================================================

/**
 * Unified billing service for all products
 */

interface Subscription {
  id: string;
  userId: string;
  productId: string;
  plan: string;
  status: 'active' | 'trialing' | 'past_due' | 'cancelled';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  amount: number;
  currency: string;
}

interface BundleDiscount {
  code: string;
  productIds: string[];
  discountPercent: number;
  description: string;
}

export class PortfolioBillingService {
  private stripe: any; // Stripe instance
  private db: any;

  constructor(stripe: any, db: any) {
    this.stripe = stripe;
    this.db = db;
  }

  /**
   * Create subscription for a product
   */
  async createSubscription(
    userId: string,
    productId: string,
    plan: string
  ): Promise<Subscription> {
    const user = await this.db.users.findOne({ id: userId });

    // Check for bundle discounts
    const discount = await this.checkBundleDiscount(userId, productId);

    // Calculate amount
    const baseAmount = this.getPlanPrice(productId, plan);
    const amount = discount
      ? baseAmount * (1 - discount.discountPercent / 100)
      : baseAmount;

    // Create Stripe subscription
    const stripeSubscription = await this.stripe.subscriptions.create({
      customer: user.billingInfo.customerId,
      items: [{
        price: this.getStripePriceId(productId, plan)
      }],
      metadata: {
        userId,
        productId,
        bundleDiscount: discount?.code
      }
    });

    const subscription: Subscription = {
      id: stripeSubscription.id,
      userId,
      productId,
      plan,
      status: stripeSubscription.status,
      currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
      amount,
      currency: 'usd'
    };

    await this.db.subscriptions.insert(subscription);

    return subscription;
  }

  /**
   * Get unified invoice (all products in one bill)
   */
  async getUnifiedInvoice(userId: string): Promise<{
    lineItems: Array<{
      productId: string;
      productName: string;
      plan: string;
      amount: number;
    }>;
    discounts: Array<{
      description: string;
      amount: number;
    }>;
    subtotal: number;
    total: number;
  }> {
    const subscriptions = await this.db.subscriptions.find({
      userId,
      status: 'active'
    });

    const lineItems = subscriptions.map((sub: Subscription) => ({
      productId: sub.productId,
      productName: this.getProductName(sub.productId),
      plan: sub.plan,
      amount: sub.amount
    }));

    const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);

    // Calculate bundle discounts
    const discounts = this.calculateBundleDiscounts(subscriptions);
    const discountTotal = discounts.reduce((sum, d) => sum + d.amount, 0);

    return {
      lineItems,
      discounts,
      subtotal,
      total: subtotal - discountTotal
    };
  }

  /**
   * Apply bundle discount when user subscribes to multiple products
   */
  private async checkBundleDiscount(
    userId: string,
    newProductId: string
  ): Promise<BundleDiscount | null> {
    const existingSubscriptions = await this.db.subscriptions.find({
      userId,
      status: 'active'
    });

    const allProductIds = [
      ...existingSubscriptions.map((s: Subscription) => s.productId),
      newProductId
    ];

    // Check if eligible for bundle
    if (allProductIds.includes('product_a') && allProductIds.includes('product_b')) {
      return {
        code: 'BUNDLE_AB',
        productIds: ['product_a', 'product_b'],
        discountPercent: 20,
        description: 'Bundle: 20% off when using both products'
      };
    }

    if (allProductIds.length >= 3) {
      return {
        code: 'BUNDLE_ALL',
        productIds: allProductIds,
        discountPercent: 30,
        description: 'Portfolio Bundle: 30% off for all products'
      };
    }

    return null;
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(
    userId: string,
    productId: string
  ): Promise<void> {
    const subscription = await this.db.subscriptions.findOne({
      userId,
      productId,
      status: 'active'
    });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    // Cancel in Stripe
    await this.stripe.subscriptions.cancel(subscription.id);

    // Update in database
    await this.db.subscriptions.update(
      { id: subscription.id },
      { status: 'cancelled' }
    );

    // Revoke product access
    const authService = new PortfolioAuthService('secret', this.db);
    await authService.grantProductAccess(userId, productId, 'free');
  }

  private getPlanPrice(productId: string, plan: string): number {
    const pricing: Record<string, Record<string, number>> = {
      'product_a': { basic: 29, pro: 49, enterprise: 99 },
      'product_b': { basic: 19, pro: 39, enterprise: 79 },
      'product_c': { basic: 39, pro: 69, enterprise: 129 }
    };

    return pricing[productId]?.[plan] || 0;
  }

  private getStripePriceId(productId: string, plan: string): string {
    return `price_${productId}_${plan}`;
  }

  private getProductName(productId: string): string {
    const products: Record<string, string> = {
      'product_a': 'TaskFlow Pro',
      'product_b': 'FormBuilder',
      'product_c': 'APIMonitor'
    };
    return products[productId] || 'Unknown Product';
  }

  private calculateBundleDiscounts(subscriptions: Subscription[]): Array<{
    description: string;
    amount: number;
  }> {
    const discounts = [];

    if (subscriptions.length === 2) {
      const total = subscriptions.reduce((sum, s) => sum + s.amount, 0);
      discounts.push({
        description: 'Bundle Discount (20%)',
        amount: total * 0.20
      });
    } else if (subscriptions.length >= 3) {
      const total = subscriptions.reduce((sum, s) => sum + s.amount, 0);
      discounts.push({
        description: 'Portfolio Bundle (30%)',
        amount: total * 0.30
      });
    }

    return discounts;
  }
}

// ============================================================================
// 3. CROSS-PRODUCT ANALYTICS
// ============================================================================

/**
 * Unified analytics tracking across all products
 */

interface AnalyticsEvent {
  userId: string;
  productId: string;
  event: string;
  properties?: Record<string, any>;
  timestamp: Date;
}

interface UserJourney {
  userId: string;
  events: AnalyticsEvent[];
  products: string[];
  firstSeen: Date;
  lastSeen: Date;
  totalEvents: number;
}

export class PortfolioAnalyticsService {
  private db: any;

  constructor(db: any) {
    this.db = db;
  }

  /**
   * Track event (from any product)
   */
  async track(event: AnalyticsEvent): Promise<void> {
    await this.db.events.insert({
      ...event,
      timestamp: event.timestamp || new Date()
    });

    // Update user journey
    await this.updateUserJourney(event.userId);
  }

  /**
   * Get user journey across all products
   */
  async getUserJourney(userId: string): Promise<UserJourney> {
    const events = await this.db.events.find({ userId });
    const products = [...new Set(events.map((e: AnalyticsEvent) => e.productId))];

    return {
      userId,
      events,
      products,
      firstSeen: events[0]?.timestamp || new Date(),
      lastSeen: events[events.length - 1]?.timestamp || new Date(),
      totalEvents: events.length
    };
  }

  /**
   * Identify cross-sell opportunities
   */
  async findCrossSellOpportunities(): Promise<Array<{
    userId: string;
    currentProducts: string[];
    recommendedProduct: string;
    reason: string;
    score: number;
  }>> {
    const opportunities = [];

    // Find users with Product A but not Product B
    const productAUsers = await this.getUsersByProduct('product_a');

    for (const user of productAUsers) {
      const journey = await this.getUserJourney(user.id);

      if (!journey.products.includes('product_b')) {
        // Check if user has relevant usage patterns
        const hasExportEvents = journey.events.some(
          e => e.event === 'export' && e.productId === 'product_a'
        );

        if (hasExportEvents) {
          opportunities.push({
            userId: user.id,
            currentProducts: journey.products,
            recommendedProduct: 'product_b',
            reason: 'User frequently exports from Product A - likely needs Product B',
            score: 0.75
          });
        }
      }
    }

    return opportunities.sort((a, b) => b.score - a.score);
  }

  /**
   * Get cross-product funnel metrics
   */
  async getCrossSellFunnel(
    fromProduct: string,
    toProduct: string
  ): Promise<{
    totalUsers: number;
    exposedToUpsell: number;
    clicked: number;
    converted: number;
    conversionRate: number;
  }> {
    const fromProductUsers = await this.getUsersByProduct(fromProduct);
    const totalUsers = fromProductUsers.length;

    // Users who saw upsell
    const exposedEvents = await this.db.events.find({
      event: 'upsell_shown',
      productId: fromProduct,
      'properties.targetProduct': toProduct
    });
    const exposedToUpsell = new Set(exposedEvents.map((e: AnalyticsEvent) => e.userId)).size;

    // Users who clicked
    const clickedEvents = await this.db.events.find({
      event: 'upsell_clicked',
      productId: fromProduct,
      'properties.targetProduct': toProduct
    });
    const clicked = new Set(clickedEvents.map((e: AnalyticsEvent) => e.userId)).size;

    // Users who converted
    const convertedUsers = fromProductUsers.filter(async (user: any) => {
      const journey = await this.getUserJourney(user.id);
      return journey.products.includes(toProduct);
    });
    const converted = convertedUsers.length;

    return {
      totalUsers,
      exposedToUpsell,
      clicked,
      converted,
      conversionRate: exposedToUpsell > 0 ? (converted / exposedToUpsell) * 100 : 0
    };
  }

  private async updateUserJourney(userId: string): Promise<void> {
    // Update journey cache/summary if needed
    // This is for performance - pre-compute common queries
  }

  private async getUsersByProduct(productId: string): Promise<any[]> {
    return this.db.users.find({
      'productAccess.productId': productId,
      'productAccess.status': 'active'
    });
  }
}

// ============================================================================
// 4. UNIFIED SUPPORT SYSTEM
// ============================================================================

/**
 * Shared support system across all products
 */

interface SupportTicket {
  id: string;
  userId: string;
  productId: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'waiting' | 'resolved';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

interface UserSupportContext {
  user: User;
  products: ProductAccess[];
  lifetimeValue: number;
  totalTickets: number;
  recentActivity: AnalyticsEvent[];
  previousTickets: SupportTicket[];
}

export class PortfolioSupportService {
  private db: any;

  constructor(db: any) {
    this.db = db;
  }

  /**
   * Create support ticket (from any product)
   */
  async createTicket(ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt'>): Promise<SupportTicket> {
    const newTicket: SupportTicket = {
      ...ticket,
      id: this.generateTicketId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await this.db.tickets.insert(newTicket);

    // Notify support team
    await this.notifySupport(newTicket);

    return newTicket;
  }

  /**
   * Get user context for support (across all products)
   */
  async getUserContext(userId: string): Promise<UserSupportContext> {
    const user = await this.db.users.findOne({ id: userId });

    // Get user's subscriptions
    const subscriptions = await this.db.subscriptions.find({
      userId,
      status: 'active'
    });

    // Calculate LTV
    const lifetimeValue = await this.calculateLTV(userId);

    // Get recent activity
    const recentActivity = await this.db.events.find({ userId })
      .sort({ timestamp: -1 })
      .limit(20);

    // Get previous tickets
    const previousTickets = await this.db.tickets.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10);

    return {
      user,
      products: user.productAccess,
      lifetimeValue,
      totalTickets: previousTickets.length,
      recentActivity,
      previousTickets
    };
  }

  /**
   * Auto-suggest responses based on common issues
   */
  async suggestResponse(ticket: SupportTicket): Promise<{
    template: string;
    confidence: number;
  } | null> {
    // Find similar resolved tickets
    const similarTickets = await this.db.tickets.find({
      productId: ticket.productId,
      status: 'resolved',
      $text: { $search: ticket.subject }
    }).limit(5);

    if (similarTickets.length === 0) {
      return null;
    }

    // Get most common resolution
    const template = this.extractTemplate(similarTickets);
    const confidence = similarTickets.length / 5; // Simple confidence score

    return { template, confidence };
  }

  /**
   * Get shared knowledge base articles
   */
  async searchKnowledge(query: string, productId?: string): Promise<Array<{
    title: string;
    content: string;
    productId: string;
    relevanceScore: number;
  }>> {
    const filter = productId ? { productId } : {};

    const articles = await this.db.knowledge.find({
      ...filter,
      $text: { $search: query }
    }).limit(10);

    return articles.map((article: any) => ({
      ...article,
      relevanceScore: this.calculateRelevance(article, query)
    })).sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  private generateTicketId(): string {
    return 'ticket_' + Date.now() + Math.random().toString(36).substr(2, 9);
  }

  private async notifySupport(ticket: SupportTicket): Promise<void> {
    // Send notification to support team
    // Email, Slack, etc.
  }

  private async calculateLTV(userId: string): Promise<number> {
    const subscriptions = await this.db.subscriptions.find({ userId });
    return subscriptions.reduce((sum: number, sub: Subscription) => {
      const months = this.getMonthsDiff(sub.currentPeriodStart, new Date());
      return sum + (sub.amount * months);
    }, 0);
  }

  private getMonthsDiff(start: Date, end: Date): number {
    return (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30);
  }

  private extractTemplate(tickets: SupportTicket[]): string {
    // Extract common response template from resolved tickets
    return 'Thank you for contacting support. [Resolution based on similar tickets]';
  }

  private calculateRelevance(article: any, query: string): number {
    // Simple relevance scoring
    const titleMatch = article.title.toLowerCase().includes(query.toLowerCase());
    const contentMatch = article.content.toLowerCase().includes(query.toLowerCase());
    return (titleMatch ? 0.6 : 0) + (contentMatch ? 0.4 : 0);
  }
}

// ============================================================================
// 5. SHARED PATTERNS & UTILITIES
// ============================================================================

/**
 * Reusable patterns for feature sharing across products
 */

// Shared webhook handler
export class PortfolioWebhookHandler {
  async handleStripeWebhook(event: any): Promise<void> {
    switch (event.type) {
      case 'customer.subscription.created':
        await this.onSubscriptionCreated(event.data.object);
        break;
      case 'customer.subscription.updated':
        await this.onSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await this.onSubscriptionDeleted(event.data.object);
        break;
      case 'invoice.payment_failed':
        await this.onPaymentFailed(event.data.object);
        break;
    }
  }

  private async onSubscriptionCreated(subscription: any): Promise<void> {
    // Grant product access
    const { userId, productId } = subscription.metadata;
    const authService = new PortfolioAuthService('secret', {} as any);
    await authService.grantProductAccess(userId, productId, 'pro');
  }

  private async onSubscriptionUpdated(subscription: any): Promise<void> {
    // Update access based on new status
  }

  private async onSubscriptionDeleted(subscription: any): Promise<void> {
    // Revoke access
  }

  private async onPaymentFailed(invoice: any): Promise<void> {
    // Send notification, update status
  }
}

// Shared email templates
export const sharedEmailTemplates = {
  welcome: (userName: string, productName: string) => `
    Hi ${userName},

    Welcome to ${productName}! We're excited to have you.

    Quick start guide: [link]

    You can also access our other products with the same account:
    - [List of other products]

    Questions? Reply to this email anytime.

    Best,
    The Team
  `,

  crossSell: (userName: string, currentProduct: string, recommendedProduct: string) => `
    Hi ${userName},

    We noticed you're using ${currentProduct}. Based on your usage,
    ${recommendedProduct} could help you [specific benefit].

    As an existing customer, you get 20% off: [link]

    Best,
    The Team
  `,

  bundle: (userName: string, products: string[]) => `
    Hi ${userName},

    Great news! You now have access to ${products.join(' and ')}.

    Save 30% by managing all products together: [link to bundle]

    Best,
    The Team
  `
};

// Export all services
export {
  PortfolioAuthService,
  PortfolioBillingService,
  PortfolioAnalyticsService,
  PortfolioSupportService,
  PortfolioWebhookHandler
};
