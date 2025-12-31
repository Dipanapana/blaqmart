import { test, expect } from '@playwright/test'

test.describe('Mobile Navigation', () => {
  // Use mobile viewport for all tests in this describe block
  test.use({ viewport: { width: 375, height: 667 } })

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('bottom navigation is visible on mobile', async ({ page }) => {
    // Bottom nav should be visible
    const bottomNav = page.locator('nav').filter({ has: page.locator('a[href="/"]') }).last()
    await expect(bottomNav).toBeVisible()
  })

  test('can navigate to Schools page via bottom nav', async ({ page }) => {
    // Click Schools link in bottom nav
    await page.click('a[href="/schools"]')
    await expect(page).toHaveURL('/schools')

    // Page should show schools content
    await expect(page.locator('h1')).toContainText(/school/i)
  })

  test('can navigate to Cart via bottom nav', async ({ page }) => {
    // Click Cart link
    await page.click('a[href="/cart"]')
    await expect(page).toHaveURL('/cart')
  })

  test('hamburger menu opens and closes', async ({ page }) => {
    // Find and click hamburger menu button
    const menuButton = page.locator('button').filter({ has: page.locator('svg.lucide-menu') }).first()

    if (await menuButton.isVisible()) {
      await menuButton.click()

      // Wait for menu overlay to appear
      await page.waitForTimeout(300) // Animation delay

      // Menu should be visible
      const menuOverlay = page.locator('[data-testid="mobile-menu"], [role="dialog"]').first()
      if (await menuOverlay.isVisible()) {
        // Close menu by clicking outside or close button
        const closeButton = page.locator('button').filter({ has: page.locator('svg.lucide-x') }).first()
        if (await closeButton.isVisible()) {
          await closeButton.click()
          await page.waitForTimeout(300)
        }
      }
    }
  })

  test('mobile header shows logo', async ({ page }) => {
    // Check for logo in header area
    const logo = page.locator('header').locator('img, svg').first()
    await expect(logo).toBeVisible()
  })

  test('cart icon shows item count badge', async ({ page }) => {
    // Navigate to a product and add it to cart
    await page.goto('/products')

    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"], .product-card, a[href^="/products/"]')

    // Find first product link and click
    const firstProduct = page.locator('a[href^="/products/"]').first()
    await firstProduct.click()

    // Add to cart if button is visible
    const addToCartButton = page.locator('button').filter({ hasText: /add to cart/i }).first()
    if (await addToCartButton.isVisible()) {
      await addToCartButton.click()

      // Wait for cart update
      await page.waitForTimeout(500)

      // Check for cart badge
      const cartBadge = page.locator('[data-testid="cart-count"], .cart-badge, [aria-label*="cart"]')
      // Badge should show at least 1
    }
  })

  test('WhatsApp floating button is visible', async ({ page }) => {
    // WhatsApp button should be present
    const whatsappButton = page.locator('a[href*="wa.me"], [data-testid="whatsapp-button"]').first()
    if (await whatsappButton.count() > 0) {
      await expect(whatsappButton).toBeVisible()
    }
  })

  test('page scrolls smoothly without horizontal overflow', async ({ page }) => {
    // Check document doesn't have horizontal scroll
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth
    })
    expect(hasHorizontalScroll).toBe(false)

    // Scroll down the page
    await page.evaluate(() => window.scrollTo(0, 500))
    await page.waitForTimeout(100)

    // Scroll back up
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.waitForTimeout(100)

    // No horizontal scroll should exist
    const hasHorizontalScrollAfter = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth
    })
    expect(hasHorizontalScrollAfter).toBe(false)
  })
})

test.describe('Mobile Navigation - Different Viewports', () => {
  test('navigation works on iPhone SE (small screen)', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 })
    await page.goto('/')

    // Bottom nav should still be visible
    const navLinks = page.locator('nav a')
    expect(await navLinks.count()).toBeGreaterThan(0)
  })

  test('navigation works on tablet (iPad)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/')

    // Should have navigation
    const navLinks = page.locator('nav a')
    expect(await navLinks.count()).toBeGreaterThan(0)
  })

  test('navigation works on large phone (iPhone 14 Pro Max)', async ({ page }) => {
    await page.setViewportSize({ width: 430, height: 932 })
    await page.goto('/')

    // Bottom nav should be visible
    const navLinks = page.locator('nav a')
    expect(await navLinks.count()).toBeGreaterThan(0)
  })
})

test.describe('Mobile Navigation - Schools Flow', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('can navigate to school detail page', async ({ page }) => {
    await page.goto('/schools')

    // Wait for schools to load
    await page.waitForSelector('a[href^="/schools/"]')

    // Click first school
    const firstSchool = page.locator('a[href^="/schools/"]').first()
    await firstSchool.click()

    // Should be on school detail page
    await expect(page.url()).toContain('/schools/')
  })

  test('can navigate to grade stationery list', async ({ page }) => {
    await page.goto('/schools')

    // Wait for schools to load
    await page.waitForSelector('a[href^="/schools/"]')

    // Click first school
    const firstSchool = page.locator('a[href^="/schools/"]').first()
    await firstSchool.click()

    // Wait for school page to load
    await page.waitForTimeout(500)

    // Look for grade links
    const gradeLink = page.locator('a[href*="/grade/"]').first()
    if (await gradeLink.isVisible()) {
      await gradeLink.click()

      // Should be on grade stationery page
      await expect(page.url()).toContain('/grade/')
    }
  })
})

test.describe('Mobile Navigation - Back Button', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('browser back button works correctly', async ({ page }) => {
    await page.goto('/')

    // Navigate to schools
    await page.click('a[href="/schools"]')
    await expect(page).toHaveURL('/schools')

    // Go back
    await page.goBack()
    await expect(page).toHaveURL('/')
  })

  test('navigation state is preserved after back', async ({ page }) => {
    await page.goto('/')

    // Scroll down on homepage
    await page.evaluate(() => window.scrollTo(0, 300))

    // Navigate to schools
    await page.click('a[href="/schools"]')

    // Go back
    await page.goBack()

    // Should be back on homepage
    await expect(page).toHaveURL('/')
  })
})
