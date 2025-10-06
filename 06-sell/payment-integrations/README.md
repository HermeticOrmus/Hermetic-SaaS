# Payment Integration Templates

**Choose the right payment provider for your SaaS.** Each has different strengths, fees, and use cases.

## Quick Comparison

| Provider | Best For | Fees | Setup Time | Global? |
|----------|----------|------|------------|---------|
| **Stripe** | Most SaaS | 2.9% + $0.30 | 1-2 days | Yes |
| **Paddle** | Merchant of record | 5% + $0.50 | 1 week | Yes |
| **LemonSqueezy** | Indie hackers | 5% + $0.50 | 1 hour | Yes |
| **PayPal** | Consumer products | 2.9% + $0.30 | 1 day | Yes |
| **Crypto** | Web3/tech-savvy | 1-2% | Varies | Yes |

## Decision Tree

```
Do you want to handle tax/compliance yourself?
├─ YES → Stripe or PayPal
│  ├─ B2B SaaS → Stripe (better for subscriptions)
│  └─ B2C → PayPal (customer trust)
│
└─ NO (want merchant of record) → Paddle or LemonSqueezy
   ├─ Established product → Paddle (better support)
   └─ Just launching → LemonSqueezy (faster setup)
```

## Key Considerations

### 1. Merchant of Record (MoR)

**What it means:** The payment provider handles all tax, VAT, compliance.

**MoR Providers:**
- Paddle
- LemonSqueezy
- Gumroad (digital products)

**Pros:**
- Don't worry about tax laws
- Don't need legal entity initially
- Global sales from day 1

**Cons:**
- Higher fees (5% vs 2.9%)
- Less control over customer experience
- Harder to migrate away

**When to use:** Early stage, global audience, want to focus on product not compliance.

---

### 2. Self-Service vs. Sales-Led

**Self-Service:**
- Stripe Checkout (hosted)
- Paddle (hosted)
- LemonSqueezy (hosted)

**Sales-Led:**
- Stripe Billing (custom invoices)
- PayPal invoicing
- Wire transfers for enterprise

**Most SaaS:** Start self-service, add sales-led for enterprise tier.

---

### 3. Subscription Management

**What you need:**
- Recurring billing
- Plan changes (upgrades/downgrades)
- Proration
- Failed payment handling
- Dunning (retry logic)
- Cancellation flows

**Best for this:**
1. Stripe Billing (most flexible)
2. Paddle (handles everything)
3. LemonSqueezy (simple subscriptions)

---

## Fees Breakdown

### Stripe

**Standard:**
- 2.9% + $0.30 per transaction
- No monthly fees
- No setup fees

**Additional costs:**
- Currency conversion: +1%
- International cards: +1%
- Disputes: $15 per chargeback

**Total cost example (B2B SaaS, $99/mo):**
- $99 × 2.9% = $2.87
- + $0.30
- = $3.17 per transaction (3.2%)

**Annual revenue $100K:**
- Fees: ~$3,200/year

---

### Paddle

**Pricing:**
- 5% + $0.50 per transaction
- Includes VAT/tax handling
- No hidden fees

**What's included:**
- VAT registration & remittance
- Payment processing
- Fraud protection
- Customer support

**Total cost example ($99/mo):**
- $99 × 5% = $4.95
- + $0.50
- = $5.45 per transaction (5.5%)

**Annual revenue $100K:**
- Fees: ~$5,500/year
- Savings from not needing accountant/lawyer: ~$3,000+/year
- Net difference: ~$2,500/year

**Worth it if:** Global customers, hate dealing with tax, want simplicity.

---

### LemonSqueezy

**Pricing:**
- 5% + $0.50 per transaction
- Merchant of record included
- Email service included

**What's included:**
- Global tax compliance
- Email delivery (for license keys, etc)
- Affiliate program
- Webhook support

**Total cost example ($99/mo):**
- Same as Paddle: $5.45 per transaction

**Annual revenue $100K:**
- Fees: ~$5,500/year

**Best for:** Solo founders, indie hackers, digital products.

---

### PayPal

**Pricing:**
- 2.9% + $0.30 (US)
- 3.9% + $0.30 (international)
- Monthly fee: $30 for Pro

**Total cost example ($99/mo, US customer):**
- $3.17 per transaction (same as Stripe)
- + $30/month = $360/year

**Annual revenue $100K:**
- Fees: ~$3,200 + $360 = $3,560/year

**When to use:** Consumer products, older demographic, eBay-style marketplaces.

---

## Resources Included

1. **stripe-setup-guide.md** - Complete Stripe integration
2. **paddle-integration.md** - Paddle setup for merchant of record
3. **lemonsqueezy-quickstart.md** - Fastest path to accepting payments
4. **paypal-business-setup.md** - PayPal for SaaS subscriptions
5. **crypto-payments.md** - Accept Bitcoin, Ethereum, stablecoins
6. **invoice-templates/** - Professional invoice generation
7. **refund-automation.md** - Handle refunds gracefully
8. **webhook-handlers/** - Code examples for payment events

## Migration Guide

**Switching providers later?** It's possible but painful. Choose carefully.

**Easiest migrations:**
- Stripe → Paddle: Paddle has import tools
- LemonSqueezy → Paddle: Manual but manageable
- PayPal → Stripe: Export customers, import to Stripe

**Hardest migrations:**
- Any MoR → Self-service: Tax implications
- Any → Crypto: Completely different model

**Advice:** Start with what gets you to revenue fastest. You can always migrate profitable businesses.

## Getting Started Checklist

Before integrating payments:

- [ ] Business entity formed (for Stripe/PayPal) or skip (for Paddle/LS)
- [ ] Business bank account opened
- [ ] Terms of service written
- [ ] Privacy policy written
- [ ] Refund policy decided (30 days recommended)
- [ ] Product is functional (no payments for broken products)
- [ ] Pricing decided and validated
- [ ] Support email setup (required by payment providers)

## Next Steps

1. **Quick launch (today):** Use LemonSqueezy
2. **Professional setup (this week):** Use Stripe
3. **Global compliance (no stress):** Use Paddle
4. **Optimize later:** Switch providers when you hit $10K/mo

**Remember:** The best payment provider is the one you actually integrate. Perfect is the enemy of shipped.
