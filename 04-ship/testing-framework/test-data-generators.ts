// Test Data Generators for HermeticSaaS
// Generate realistic test data for your tests

import { faker } from '@faker-js/faker'

/**
 * User Data Generator
 */
export const generateUser = (overrides = {}) => ({
  id: faker.string.uuid(),
  email: faker.internet.email(),
  name: faker.person.fullName(),
  avatar: faker.image.avatar(),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  ...overrides,
})

export const generateUsers = (count: number) => {
  return Array.from({ length: count }, () => generateUser())
}

/**
 * Organization Data Generator
 */
export const generateOrganization = (overrides = {}) => ({
  id: faker.string.uuid(),
  name: faker.company.name(),
  slug: faker.helpers.slugify(faker.company.name()).toLowerCase(),
  logo: faker.image.urlLoremFlickr({ category: 'business' }),
  description: faker.company.catchPhrase(),
  website: faker.internet.url(),
  industry: faker.helpers.arrayElement([
    'Technology',
    'Finance',
    'Healthcare',
    'Education',
    'Retail',
    'Manufacturing',
  ]),
  size: faker.helpers.arrayElement(['1-10', '11-50', '51-200', '201-500', '500+']),
  createdAt: faker.date.past(),
  ...overrides,
})

/**
 * Project Data Generator
 */
export const generateProject = (overrides = {}) => ({
  id: faker.string.uuid(),
  name: faker.commerce.productName(),
  description: faker.commerce.productDescription(),
  status: faker.helpers.arrayElement(['active', 'pending', 'completed', 'archived']),
  priority: faker.helpers.arrayElement(['low', 'medium', 'high', 'urgent']),
  startDate: faker.date.past(),
  endDate: faker.date.future(),
  budget: faker.number.int({ min: 10000, max: 1000000 }),
  tags: faker.helpers.arrayElements(
    ['frontend', 'backend', 'mobile', 'design', 'testing', 'devops'],
    { min: 1, max: 3 }
  ),
  createdAt: faker.date.past(),
  ...overrides,
})

/**
 * Subscription Data Generator
 */
export const generateSubscription = (overrides = {}) => ({
  id: faker.string.uuid(),
  userId: faker.string.uuid(),
  plan: faker.helpers.arrayElement(['free', 'pro', 'enterprise']),
  status: faker.helpers.arrayElement(['active', 'canceled', 'past_due', 'trialing']),
  stripeCustomerId: `cus_${faker.string.alphanumeric(14)}`,
  stripeSubscriptionId: `sub_${faker.string.alphanumeric(14)}`,
  currentPeriodStart: faker.date.recent(),
  currentPeriodEnd: faker.date.future(),
  cancelAt: null,
  canceledAt: null,
  trialStart: faker.date.recent(),
  trialEnd: faker.date.future(),
  createdAt: faker.date.past(),
  ...overrides,
})

/**
 * Payment Data Generator
 */
export const generatePayment = (overrides = {}) => ({
  id: faker.string.uuid(),
  amount: faker.number.int({ min: 999, max: 99999 }), // Amount in cents
  currency: 'usd',
  status: faker.helpers.arrayElement(['succeeded', 'pending', 'failed', 'refunded']),
  description: faker.commerce.productName(),
  stripePaymentIntentId: `pi_${faker.string.alphanumeric(24)}`,
  receiptUrl: faker.internet.url(),
  createdAt: faker.date.past(),
  ...overrides,
})

/**
 * API Key Data Generator
 */
export const generateApiKey = (overrides = {}) => ({
  id: faker.string.uuid(),
  name: faker.commerce.productName(),
  key: `sk_${faker.string.alphanumeric(32)}`,
  prefix: `sk_${faker.string.alphanumeric(8)}`,
  lastUsedAt: faker.date.recent(),
  expiresAt: faker.date.future(),
  scopes: faker.helpers.arrayElements(
    ['read', 'write', 'delete', 'admin'],
    { min: 1, max: 3 }
  ),
  createdAt: faker.date.past(),
  ...overrides,
})

/**
 * Webhook Data Generator
 */
export const generateWebhook = (overrides = {}) => ({
  id: faker.string.uuid(),
  url: faker.internet.url(),
  events: faker.helpers.arrayElements(
    ['user.created', 'user.updated', 'payment.succeeded', 'subscription.updated'],
    { min: 1, max: 3 }
  ),
  secret: faker.string.alphanumeric(32),
  active: faker.datatype.boolean(),
  lastTriggeredAt: faker.date.recent(),
  createdAt: faker.date.past(),
  ...overrides,
})

/**
 * Analytics Event Data Generator
 */
export const generateAnalyticsEvent = (overrides = {}) => ({
  id: faker.string.uuid(),
  event: faker.helpers.arrayElement([
    'page_view',
    'button_click',
    'form_submit',
    'purchase',
    'signup',
    'login',
  ]),
  properties: {
    page: faker.internet.url(),
    referrer: faker.internet.url(),
    userAgent: faker.internet.userAgent(),
    ip: faker.internet.ip(),
    country: faker.location.country(),
    city: faker.location.city(),
  },
  timestamp: faker.date.recent(),
  ...overrides,
})

/**
 * Email Data Generator
 */
export const generateEmail = (overrides = {}) => ({
  id: faker.string.uuid(),
  to: faker.internet.email(),
  from: faker.internet.email(),
  subject: faker.lorem.sentence(),
  body: faker.lorem.paragraphs(3),
  status: faker.helpers.arrayElement(['sent', 'pending', 'failed', 'bounced']),
  openedAt: faker.date.recent(),
  clickedAt: faker.date.recent(),
  sentAt: faker.date.recent(),
  ...overrides,
})

/**
 * Notification Data Generator
 */
export const generateNotification = (overrides = {}) => ({
  id: faker.string.uuid(),
  userId: faker.string.uuid(),
  title: faker.lorem.sentence(),
  message: faker.lorem.paragraph(),
  type: faker.helpers.arrayElement(['info', 'success', 'warning', 'error']),
  read: faker.datatype.boolean(),
  actionUrl: faker.internet.url(),
  createdAt: faker.date.recent(),
  readAt: faker.date.recent(),
  ...overrides,
})

/**
 * Invoice Data Generator
 */
export const generateInvoice = (overrides = {}) => ({
  id: faker.string.uuid(),
  invoiceNumber: `INV-${faker.number.int({ min: 1000, max: 9999 })}`,
  customerId: faker.string.uuid(),
  amount: faker.number.int({ min: 1000, max: 100000 }),
  tax: faker.number.int({ min: 0, max: 10000 }),
  total: faker.number.int({ min: 1000, max: 110000 }),
  status: faker.helpers.arrayElement(['draft', 'open', 'paid', 'void', 'uncollectible']),
  dueDate: faker.date.future(),
  paidAt: faker.date.recent(),
  items: Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => ({
    description: faker.commerce.productName(),
    quantity: faker.number.int({ min: 1, max: 10 }),
    unitPrice: faker.number.int({ min: 100, max: 10000 }),
    total: faker.number.int({ min: 100, max: 100000 }),
  })),
  createdAt: faker.date.past(),
  ...overrides,
})

/**
 * Support Ticket Data Generator
 */
export const generateSupportTicket = (overrides = {}) => ({
  id: faker.string.uuid(),
  ticketNumber: faker.number.int({ min: 1000, max: 9999 }),
  subject: faker.lorem.sentence(),
  description: faker.lorem.paragraphs(2),
  status: faker.helpers.arrayElement(['open', 'in_progress', 'resolved', 'closed']),
  priority: faker.helpers.arrayElement(['low', 'medium', 'high', 'urgent']),
  category: faker.helpers.arrayElement([
    'bug',
    'feature_request',
    'question',
    'billing',
    'other',
  ]),
  assignedTo: faker.string.uuid(),
  createdBy: faker.string.uuid(),
  createdAt: faker.date.past(),
  resolvedAt: faker.date.recent(),
  ...overrides,
})

/**
 * Activity Log Data Generator
 */
export const generateActivityLog = (overrides = {}) => ({
  id: faker.string.uuid(),
  userId: faker.string.uuid(),
  action: faker.helpers.arrayElement([
    'created',
    'updated',
    'deleted',
    'viewed',
    'exported',
    'imported',
  ]),
  resource: faker.helpers.arrayElement([
    'user',
    'project',
    'organization',
    'subscription',
    'payment',
  ]),
  resourceId: faker.string.uuid(),
  metadata: {
    ip: faker.internet.ip(),
    userAgent: faker.internet.userAgent(),
    changes: {},
  },
  timestamp: faker.date.recent(),
  ...overrides,
})

/**
 * File Upload Data Generator
 */
export const generateFileUpload = (overrides = {}) => ({
  id: faker.string.uuid(),
  filename: faker.system.fileName(),
  originalName: faker.system.fileName(),
  mimeType: faker.system.mimeType(),
  size: faker.number.int({ min: 1024, max: 10485760 }), // 1KB to 10MB
  url: faker.internet.url(),
  uploadedBy: faker.string.uuid(),
  uploadedAt: faker.date.recent(),
  ...overrides,
})

/**
 * Generate batch of mixed test data
 */
export const generateTestDatabase = () => ({
  users: generateUsers(50),
  organizations: Array.from({ length: 10 }, () => generateOrganization()),
  projects: Array.from({ length: 100 }, () => generateProject()),
  subscriptions: Array.from({ length: 30 }, () => generateSubscription()),
  payments: Array.from({ length: 200 }, () => generatePayment()),
  notifications: Array.from({ length: 500 }, () => generateNotification()),
  supportTickets: Array.from({ length: 75 }, () => generateSupportTicket()),
  activityLogs: Array.from({ length: 1000 }, () => generateActivityLog()),
})

/**
 * Seed database with test data
 */
export const seedTestData = async (prisma: any) => {
  const data = generateTestDatabase()

  // Clear existing data
  await prisma.activityLog.deleteMany()
  await prisma.supportTicket.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.subscription.deleteMany()
  await prisma.project.deleteMany()
  await prisma.organization.deleteMany()
  await prisma.user.deleteMany()

  // Insert test data
  await prisma.user.createMany({ data: data.users })
  await prisma.organization.createMany({ data: data.organizations })
  await prisma.project.createMany({ data: data.projects })
  await prisma.subscription.createMany({ data: data.subscriptions })
  await prisma.payment.createMany({ data: data.payments })
  await prisma.notification.createMany({ data: data.notifications })
  await prisma.supportTicket.createMany({ data: data.supportTickets })
  await prisma.activityLog.createMany({ data: data.activityLogs })

  console.log('Test database seeded successfully!')
}
