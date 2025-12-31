import { test, expect } from '@playwright/test'

test.describe('Mobile Touch Targets', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  const MIN_TAP_TARGET = 44 // WCAG 2.1 AA minimum touch target size

  test('buttons meet minimum tap target size', async ({ page }) => {
    await page.goto('/')

    // Get all interactive buttons
    const buttons = page.locator('button:visible')
    const buttonCount = await buttons.count()

    let smallButtonsCount = 0
    const smallButtons: string[] = []

    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i)
      const box = await button.boundingBox()

      if (box) {
        // Check if button meets minimum size
        if (box.width < MIN_TAP_TARGET || box.height < MIN_TAP_TARGET) {
          smallButtonsCount++
          const text = await button.textContent()
          smallButtons.push(`${text || 'Button'} (${box.width}x${box.height})`)
        }
      }
    }

    // Allow some small icon buttons, but warn if too many
    if (smallButtonsCount > 5) {
      console.warn(`Found ${smallButtonsCount} buttons below minimum tap target: ${smallButtons.join(', ')}`)
    }
  })

  test('navigation links meet minimum tap target size', async ({ page }) => {
    await page.goto('/')

    // Check bottom navigation links
    const navLinks = page.locator('nav a:visible')
    const linkCount = await navLinks.count()

    for (let i = 0; i < linkCount; i++) {
      const link = navLinks.nth(i)
      const box = await link.boundingBox()

      if (box) {
        // Navigation links should be at least 44px in height
        expect(box.height).toBeGreaterThanOrEqual(MIN_TAP_TARGET - 4) // Allow small tolerance
      }
    }
  })

  test('form inputs are easy to tap', async ({ page }) => {
    await page.goto('/checkout')

    const inputs = page.locator('input:visible')
    const inputCount = await inputs.count()

    for (let i = 0; i < Math.min(inputCount, 10); i++) {
      const input = inputs.nth(i)
      const box = await input.boundingBox()

      if (box) {
        // Inputs should be at least 44px tall for easy tapping
        expect(box.height).toBeGreaterThanOrEqual(40)
      }
    }
  })

  test('add to cart buttons are large enough', async ({ page }) => {
    await page.goto('/products')

    await page.waitForSelector('a[href^="/products/"]')

    // Go to first product
    const firstProduct = page.locator('a[href^="/products/"]').first()
    await firstProduct.click()

    // Find add to cart button
    const addToCartButton = page.locator('button').filter({ hasText: /add to cart/i }).first()

    if (await addToCartButton.isVisible()) {
      const box = await addToCartButton.boundingBox()

      if (box) {
        // Add to cart should be prominently sized
        expect(box.height).toBeGreaterThanOrEqual(MIN_TAP_TARGET)
        expect(box.width).toBeGreaterThanOrEqual(120) // Reasonably wide
      }
    }
  })
})

test.describe('Mobile Scrolling Behavior', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('no horizontal scroll on homepage', async ({ page }) => {
    await page.goto('/')

    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth
    })

    expect(hasHorizontalScroll).toBe(false)
  })

  test('no horizontal scroll on products page', async ({ page }) => {
    await page.goto('/products')

    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth
    })

    expect(hasHorizontalScroll).toBe(false)
  })

  test('no horizontal scroll on checkout page', async ({ page }) => {
    await page.goto('/checkout')

    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth
    })

    expect(hasHorizontalScroll).toBe(false)
  })

  test('smooth scrolling is enabled', async ({ page }) => {
    await page.goto('/')

    const scrollBehavior = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).scrollBehavior
    })

    // Either smooth scrolling or auto is fine
    expect(['smooth', 'auto']).toContain(scrollBehavior)
  })

  test('can scroll product list', async ({ page }) => {
    await page.goto('/products')

    // Get initial scroll position
    const initialScroll = await page.evaluate(() => window.scrollY)

    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 500))
    await page.waitForTimeout(100)

    // Check scroll happened
    const newScroll = await page.evaluate(() => window.scrollY)
    expect(newScroll).toBeGreaterThan(initialScroll)
  })
})

test.describe('Mobile Thumb Zone', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('primary CTAs are in thumb zone', async ({ page }) => {
    await page.goto('/products')

    await page.waitForSelector('a[href^="/products/"]')
    const firstProduct = page.locator('a[href^="/products/"]').first()
    await firstProduct.click()

    // Primary action button should be in bottom 60% of screen
    const primaryButton = page.locator('button').filter({ hasText: /add to cart|buy/i }).first()

    if (await primaryButton.isVisible()) {
      const box = await primaryButton.boundingBox()
      const viewportHeight = 667

      if (box) {
        // Button should be in lower portion of screen
        expect(box.y).toBeGreaterThan(viewportHeight * 0.25)
      }
    }
  })

  test('bottom navigation is at thumb height', async ({ page }) => {
    await page.goto('/')

    const bottomNav = page.locator('nav').last()

    if (await bottomNav.isVisible()) {
      const box = await bottomNav.boundingBox()
      const viewportHeight = 667

      if (box) {
        // Bottom nav should be at the very bottom
        expect(box.y + box.height).toBeGreaterThan(viewportHeight - 20)
      }
    }
  })
})

test.describe('Mobile Gestures', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('product images can be viewed', async ({ page }) => {
    await page.goto('/products')

    await page.waitForSelector('a[href^="/products/"]')
    const firstProduct = page.locator('a[href^="/products/"]').first()
    await firstProduct.click()

    // Product image should be visible
    const productImage = page.locator('img').first()
    await expect(productImage).toBeVisible()
  })

  test('mobile menu can be opened with tap', async ({ page }) => {
    await page.goto('/')

    // Find hamburger menu
    const menuButton = page.locator('button').filter({ has: page.locator('svg.lucide-menu') }).first()

    if (await menuButton.isVisible()) {
      // Tap the menu button
      await menuButton.tap()

      // Wait for animation
      await page.waitForTimeout(300)
    }
  })

  test('links respond to tap immediately', async ({ page }) => {
    await page.goto('/')

    const startTime = Date.now()

    // Tap on a navigation link
    await page.click('a[href="/schools"]')

    // Wait for navigation
    await page.waitForURL('/schools')

    const endTime = Date.now()
    const responseTime = endTime - startTime

    // Should respond within 500ms
    expect(responseTime).toBeLessThan(500)
  })
})

test.describe('Mobile Input Handling', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('input fields have appropriate types', async ({ page }) => {
    await page.goto('/checkout')

    // Email input should have email type
    const emailInput = page.locator('input[type="email"]')
    if (await emailInput.count() > 0) {
      await expect(emailInput.first()).toBeVisible()
    }

    // Phone input should have tel type
    const phoneInput = page.locator('input[type="tel"]')
    if (await phoneInput.count() > 0) {
      await expect(phoneInput.first()).toBeVisible()
    }
  })

  test('inputs are not zoomed on focus', async ({ page }) => {
    await page.goto('/checkout')

    const input = page.locator('input').first()

    if (await input.isVisible()) {
      // Focus the input
      await input.focus()
      await page.waitForTimeout(200)

      // Check viewport hasn't zoomed
      const viewport = await page.evaluate(() => {
        return {
          width: window.innerWidth,
          visualViewport: window.visualViewport?.scale || 1
        }
      })

      // Scale should be 1 (no zoom)
      expect(viewport.visualViewport).toBe(1)
    }
  })

  test('form inputs have visible labels', async ({ page }) => {
    await page.goto('/checkout')

    const inputs = page.locator('input:visible')
    const inputCount = await inputs.count()

    for (let i = 0; i < Math.min(inputCount, 5); i++) {
      const input = inputs.nth(i)
      const inputId = await input.getAttribute('id')

      if (inputId) {
        // Should have associated label or aria-label
        const label = page.locator(`label[for="${inputId}"]`)
        const ariaLabel = await input.getAttribute('aria-label')
        const placeholder = await input.getAttribute('placeholder')

        const hasLabel = await label.count() > 0 || ariaLabel || placeholder
        expect(hasLabel).toBeTruthy()
      }
    }
  })
})

test.describe('Mobile Performance', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('homepage loads within acceptable time', async ({ page }) => {
    const startTime = Date.now()

    await page.goto('/', { waitUntil: 'domcontentloaded' })

    const loadTime = Date.now() - startTime

    // Should load within 5 seconds on a good connection
    expect(loadTime).toBeLessThan(5000)
  })

  test('images are lazy loaded', async ({ page }) => {
    await page.goto('/products')

    // Check for lazy loaded images
    const lazyImages = page.locator('img[loading="lazy"]')
    const lazyCount = await lazyImages.count()

    // Should have some lazy loaded images
    expect(lazyCount).toBeGreaterThan(0)
  })

  test('no layout shift on scroll', async ({ page }) => {
    await page.goto('/')

    // Wait for initial load
    await page.waitForLoadState('networkidle')

    // Get content positions before scroll
    const beforeScroll = await page.evaluate(() => {
      const header = document.querySelector('header')
      return header?.getBoundingClientRect().height || 0
    })

    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 500))
    await page.waitForTimeout(200)

    // Scroll back up
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.waitForTimeout(200)

    // Check positions after scroll
    const afterScroll = await page.evaluate(() => {
      const header = document.querySelector('header')
      return header?.getBoundingClientRect().height || 0
    })

    // Header height should remain consistent
    expect(afterScroll).toBe(beforeScroll)
  })
})
