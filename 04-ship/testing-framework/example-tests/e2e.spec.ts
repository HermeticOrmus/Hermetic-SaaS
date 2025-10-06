// Example E2E Tests using Playwright
import { test, expect } from '@playwright/test'

// Authentication tests
test.describe('Authentication Flow', () => {
  test('user can sign up', async ({ page }) => {
    await page.goto('/signup')

    // Fill signup form
    await page.fill('input[name="email"]', 'newuser@example.com')
    await page.fill('input[name="password"]', 'SecurePass123!')
    await page.fill('input[name="confirmPassword"]', 'SecurePass123!')

    // Submit form
    await page.click('button[type="submit"]')

    // Wait for redirect to dashboard
    await page.waitForURL('/dashboard')

    // Verify user is logged in
    await expect(page.locator('text=Welcome')).toBeVisible()
  })

  test('user can log in', async ({ page }) => {
    await page.goto('/login')

    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')

    await page.waitForURL('/dashboard')
    await expect(page.locator('text=Dashboard')).toBeVisible()
  })

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login')

    await page.fill('input[name="email"]', 'wrong@example.com')
    await page.fill('input[name="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')

    await expect(page.locator('text=Invalid credentials')).toBeVisible()
  })

  test('user can log out', async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')

    // Logout
    await page.click('[data-testid="user-menu"]')
    await page.click('text=Log out')

    // Verify redirect to homepage
    await page.waitForURL('/')
    await expect(page.locator('text=Sign in')).toBeVisible()
  })
})

// Critical user flows
test.describe('Subscription Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
  })

  test('user can view pricing', async ({ page }) => {
    await page.goto('/pricing')

    // Check all pricing tiers are visible
    await expect(page.locator('text=Free')).toBeVisible()
    await expect(page.locator('text=Pro')).toBeVisible()
    await expect(page.locator('text=Enterprise')).toBeVisible()
  })

  test('user can upgrade to Pro', async ({ page }) => {
    await page.goto('/pricing')

    // Click upgrade button
    await page.click('button:has-text("Upgrade to Pro")')

    // Fill payment details (using Stripe test card)
    const stripeFrame = page.frameLocator('iframe[name^="__privateStripeFrame"]')
    await stripeFrame.locator('input[name="cardnumber"]').fill('4242424242424242')
    await stripeFrame.locator('input[name="exp-date"]').fill('12/25')
    await stripeFrame.locator('input[name="cvc"]').fill('123')

    // Submit payment
    await page.click('button:has-text("Subscribe")')

    // Wait for success
    await expect(page.locator('text=Subscription active')).toBeVisible({ timeout: 10000 })

    // Verify dashboard shows Pro features
    await page.goto('/dashboard')
    await expect(page.locator('text=Pro Plan')).toBeVisible()
  })

  test('user can cancel subscription', async ({ page }) => {
    await page.goto('/settings/billing')

    // Click cancel button
    await page.click('button:has-text("Cancel Subscription")')

    // Confirm cancellation
    await page.click('button:has-text("Yes, cancel")')

    // Verify cancellation message
    await expect(page.locator('text=Subscription will end on')).toBeVisible()
  })
})

// Dashboard functionality
test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
  })

  test('displays user statistics', async ({ page }) => {
    // Check statistics are visible
    await expect(page.locator('[data-testid="total-projects"]')).toBeVisible()
    await expect(page.locator('[data-testid="active-users"]')).toBeVisible()
    await expect(page.locator('[data-testid="revenue"]')).toBeVisible()
  })

  test('user can create new project', async ({ page }) => {
    // Click create project button
    await page.click('button:has-text("New Project")')

    // Fill project details
    await page.fill('input[name="name"]', 'Test Project')
    await page.fill('textarea[name="description"]', 'This is a test project')

    // Submit
    await page.click('button:has-text("Create")')

    // Verify project appears in list
    await expect(page.locator('text=Test Project')).toBeVisible()
  })

  test('user can edit profile', async ({ page }) => {
    await page.goto('/settings/profile')

    // Update name
    await page.fill('input[name="name"]', 'Updated Name')

    // Save changes
    await page.click('button:has-text("Save")')

    // Verify success message
    await expect(page.locator('text=Profile updated')).toBeVisible()
  })
})

// Performance tests
test.describe('Performance', () => {
  test('homepage loads quickly', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/')
    const loadTime = Date.now() - startTime

    expect(loadTime).toBeLessThan(3000) // Should load in under 3 seconds
  })

  test('dashboard loads within acceptable time', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')

    const startTime = Date.now()
    await page.waitForURL('/dashboard')
    const loadTime = Date.now() - startTime

    expect(loadTime).toBeLessThan(5000)
  })
})

// Accessibility tests
test.describe('Accessibility', () => {
  test('homepage is accessible', async ({ page }) => {
    await page.goto('/')

    // Check for basic accessibility
    const title = await page.title()
    expect(title).toBeTruthy()

    // Check for main landmark
    await expect(page.locator('main')).toBeVisible()

    // Check for skip link
    await expect(page.locator('a:has-text("Skip to content")')).toBeVisible()
  })

  test('forms have proper labels', async ({ page }) => {
    await page.goto('/login')

    // Email input has label
    const emailLabel = await page.locator('label[for="email"]')
    await expect(emailLabel).toBeVisible()

    // Password input has label
    const passwordLabel = await page.locator('label[for="password"]')
    await expect(passwordLabel).toBeVisible()
  })

  test('buttons have accessible names', async ({ page }) => {
    await page.goto('/')

    // All buttons should have text or aria-label
    const buttons = await page.locator('button').all()

    for (const button of buttons) {
      const text = await button.textContent()
      const ariaLabel = await button.getAttribute('aria-label')

      expect(text || ariaLabel).toBeTruthy()
    }
  })
})

// Mobile responsiveness
test.describe('Mobile Experience', () => {
  test.use({ viewport: { width: 375, height: 667 } }) // iPhone SE

  test('mobile menu works', async ({ page }) => {
    await page.goto('/')

    // Click hamburger menu
    await page.click('[data-testid="mobile-menu-button"]')

    // Verify menu is visible
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible()

    // Click nav item
    await page.click('text=Pricing')

    // Verify navigation
    await page.waitForURL('/pricing')
  })

  test('forms are usable on mobile', async ({ page }) => {
    await page.goto('/login')

    // Fill form on mobile
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')

    // Verify inputs are not obscured
    const emailInput = page.locator('input[name="email"]')
    expect(await emailInput.isVisible()).toBeTruthy()
  })
})

// Error handling
test.describe('Error Handling', () => {
  test('shows 404 page for invalid routes', async ({ page }) => {
    await page.goto('/this-page-does-not-exist')

    await expect(page.locator('text=404')).toBeVisible()
    await expect(page.locator('text=Page not found')).toBeVisible()
  })

  test('handles network errors gracefully', async ({ page }) => {
    // Simulate offline
    await page.context().setOffline(true)

    await page.goto('/')

    // Should show error message
    await expect(page.locator('text=Network error')).toBeVisible()

    // Go back online
    await page.context().setOffline(false)
  })
})
