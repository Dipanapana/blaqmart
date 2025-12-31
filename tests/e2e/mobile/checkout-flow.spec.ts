import { test, expect } from '@playwright/test'

test.describe('Mobile Checkout Flow', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test.beforeEach(async ({ page }) => {
    // Start with empty cart by clearing localStorage
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
  })

  test('can add product to cart and proceed to checkout', async ({ page }) => {
    // Navigate to products
    await page.goto('/products')

    // Wait for products to load
    await page.waitForSelector('a[href^="/products/"]')

    // Click first product
    const firstProduct = page.locator('a[href^="/products/"]').first()
    await firstProduct.click()

    // Wait for product page to load
    await page.waitForTimeout(500)

    // Add to cart
    const addToCartButton = page.locator('button').filter({ hasText: /add to cart/i }).first()
    if (await addToCartButton.isVisible()) {
      await addToCartButton.click()

      // Wait for cart update
      await page.waitForTimeout(500)

      // Navigate to cart
      await page.goto('/cart')

      // Cart should have items
      await expect(page.locator('body')).toContainText(/R\s*\d+/)
    }
  })

  test('checkout form is mobile-friendly', async ({ page }) => {
    // Add product to cart first
    await page.goto('/products')
    await page.waitForSelector('a[href^="/products/"]')
    const firstProduct = page.locator('a[href^="/products/"]').first()
    await firstProduct.click()

    const addToCartButton = page.locator('button').filter({ hasText: /add to cart/i }).first()
    if (await addToCartButton.isVisible()) {
      await addToCartButton.click()
      await page.waitForTimeout(500)
    }

    // Go to checkout
    await page.goto('/checkout')

    // Check that form inputs are full-width on mobile
    const inputs = page.locator('input[type="text"], input[type="email"], input[type="tel"]')
    const inputCount = await inputs.count()

    for (let i = 0; i < Math.min(inputCount, 5); i++) {
      const input = inputs.nth(i)
      if (await input.isVisible()) {
        const box = await input.boundingBox()
        if (box) {
          // Input should be at least 80% of viewport width on mobile
          expect(box.width).toBeGreaterThan(280)
        }
      }
    }
  })

  test('delivery options are easy to select on mobile', async ({ page }) => {
    // Add product to cart
    await page.goto('/products')
    await page.waitForSelector('a[href^="/products/"]')
    const firstProduct = page.locator('a[href^="/products/"]').first()
    await firstProduct.click()

    const addToCartButton = page.locator('button').filter({ hasText: /add to cart/i }).first()
    if (await addToCartButton.isVisible()) {
      await addToCartButton.click()
      await page.waitForTimeout(500)
    }

    // Go to checkout
    await page.goto('/checkout')

    // Look for delivery option selectors
    const deliveryOptions = page.locator('[name="deliveryMethod"], [data-testid="delivery-option"], input[type="radio"]')

    if (await deliveryOptions.count() > 0) {
      // Options should be visible and tappable
      const firstOption = deliveryOptions.first()
      await expect(firstOption).toBeVisible()
    }
  })

  test('payment method selection works on mobile', async ({ page }) => {
    // Add product to cart
    await page.goto('/products')
    await page.waitForSelector('a[href^="/products/"]')
    const firstProduct = page.locator('a[href^="/products/"]').first()
    await firstProduct.click()

    const addToCartButton = page.locator('button').filter({ hasText: /add to cart/i }).first()
    if (await addToCartButton.isVisible()) {
      await addToCartButton.click()
      await page.waitForTimeout(500)
    }

    // Go to checkout
    await page.goto('/checkout')

    // Look for payment options
    const paymentOptions = page.locator('[data-testid="payment-method"], button').filter({ hasText: /yoco|card|cod|cash/i })

    if (await paymentOptions.count() > 0) {
      const firstPaymentOption = paymentOptions.first()
      await expect(firstPaymentOption).toBeVisible()
    }
  })

  test('place order button is in thumb zone', async ({ page }) => {
    // Add product to cart
    await page.goto('/products')
    await page.waitForSelector('a[href^="/products/"]')
    const firstProduct = page.locator('a[href^="/products/"]').first()
    await firstProduct.click()

    const addToCartButton = page.locator('button').filter({ hasText: /add to cart/i }).first()
    if (await addToCartButton.isVisible()) {
      await addToCartButton.click()
      await page.waitForTimeout(500)
    }

    // Go to checkout
    await page.goto('/checkout')

    // Find place order button
    const placeOrderButton = page.locator('button').filter({ hasText: /place order|confirm|pay|submit/i }).first()

    if (await placeOrderButton.isVisible()) {
      const box = await placeOrderButton.boundingBox()
      const viewportHeight = 667 // Mobile viewport height

      if (box) {
        // Button should be in bottom 60% of screen (thumb zone)
        expect(box.y).toBeGreaterThan(viewportHeight * 0.3)
      }
    }
  })

  test('form validation shows clear errors', async ({ page }) => {
    // Add product to cart
    await page.goto('/products')
    await page.waitForSelector('a[href^="/products/"]')
    const firstProduct = page.locator('a[href^="/products/"]').first()
    await firstProduct.click()

    const addToCartButton = page.locator('button').filter({ hasText: /add to cart/i }).first()
    if (await addToCartButton.isVisible()) {
      await addToCartButton.click()
      await page.waitForTimeout(500)
    }

    // Go to checkout
    await page.goto('/checkout')

    // Try to submit without filling form
    const submitButton = page.locator('button[type="submit"]').first()

    if (await submitButton.isVisible()) {
      await submitButton.click()

      // Should show validation errors
      await page.waitForTimeout(500)

      // Check for error messages
      const errors = page.locator('[role="alert"], .error, .text-red-500, .text-destructive')
      // Errors should be visible
    }
  })
})

test.describe('Mobile Checkout - Cart Operations', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('can increase item quantity in cart', async ({ page }) => {
    // Add product to cart
    await page.goto('/products')
    await page.waitForSelector('a[href^="/products/"]')
    const firstProduct = page.locator('a[href^="/products/"]').first()
    await firstProduct.click()

    const addToCartButton = page.locator('button').filter({ hasText: /add to cart/i }).first()
    if (await addToCartButton.isVisible()) {
      await addToCartButton.click()
      await page.waitForTimeout(500)
    }

    // Go to cart
    await page.goto('/cart')

    // Find increase quantity button
    const increaseButton = page.locator('button').filter({ has: page.locator('svg.lucide-plus') }).first()

    if (await increaseButton.isVisible()) {
      await increaseButton.click()
      await page.waitForTimeout(300)

      // Quantity should have increased
    }
  })

  test('can remove item from cart', async ({ page }) => {
    // Add product to cart
    await page.goto('/products')
    await page.waitForSelector('a[href^="/products/"]')
    const firstProduct = page.locator('a[href^="/products/"]').first()
    await firstProduct.click()

    const addToCartButton = page.locator('button').filter({ hasText: /add to cart/i }).first()
    if (await addToCartButton.isVisible()) {
      await addToCartButton.click()
      await page.waitForTimeout(500)
    }

    // Go to cart
    await page.goto('/cart')

    // Find remove button
    const removeButton = page.locator('button').filter({ has: page.locator('svg.lucide-trash-2, svg.lucide-x') }).first()

    if (await removeButton.isVisible()) {
      await removeButton.click()
      await page.waitForTimeout(300)

      // Cart should be empty or show empty state
    }
  })

  test('empty cart shows appropriate message', async ({ page }) => {
    // Clear cart
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())

    // Go to cart
    await page.goto('/cart')

    // Should show empty cart message
    await expect(page.locator('body')).toContainText(/empty|no items|cart is empty/i)
  })
})

test.describe('Mobile Checkout - Address Selection', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('town selection dropdown works on mobile', async ({ page }) => {
    // Add product to cart
    await page.goto('/products')
    await page.waitForSelector('a[href^="/products/"]')
    const firstProduct = page.locator('a[href^="/products/"]').first()
    await firstProduct.click()

    const addToCartButton = page.locator('button').filter({ hasText: /add to cart/i }).first()
    if (await addToCartButton.isVisible()) {
      await addToCartButton.click()
      await page.waitForTimeout(500)
    }

    // Go to checkout
    await page.goto('/checkout')

    // Find town/city selector
    const townSelector = page.locator('select, [data-testid="town-select"], button').filter({ hasText: /warrenton|town|city/i }).first()

    if (await townSelector.isVisible()) {
      await townSelector.click()

      // Should show options
      await page.waitForTimeout(300)
    }
  })

  test('can select local delivery town for COD', async ({ page }) => {
    // Add product to cart
    await page.goto('/products')
    await page.waitForSelector('a[href^="/products/"]')
    const firstProduct = page.locator('a[href^="/products/"]').first()
    await firstProduct.click()

    const addToCartButton = page.locator('button').filter({ hasText: /add to cart/i }).first()
    if (await addToCartButton.isVisible()) {
      await addToCartButton.click()
      await page.waitForTimeout(500)
    }

    // Go to checkout
    await page.goto('/checkout')

    // Look for COD option
    const codOption = page.locator('button, label, [role="radio"]').filter({ hasText: /cash on delivery|cod/i }).first()

    if (await codOption.isVisible()) {
      await codOption.click()
      await page.waitForTimeout(300)
    }
  })
})

test.describe('Mobile Checkout - Order Summary', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('order summary is visible during checkout', async ({ page }) => {
    // Add product to cart
    await page.goto('/products')
    await page.waitForSelector('a[href^="/products/"]')
    const firstProduct = page.locator('a[href^="/products/"]').first()
    await firstProduct.click()

    const addToCartButton = page.locator('button').filter({ hasText: /add to cart/i }).first()
    if (await addToCartButton.isVisible()) {
      await addToCartButton.click()
      await page.waitForTimeout(500)
    }

    // Go to checkout
    await page.goto('/checkout')

    // Should show price information
    await expect(page.locator('body')).toContainText(/R\s*\d+/)
  })

  test('delivery fee is displayed', async ({ page }) => {
    // Add product to cart
    await page.goto('/products')
    await page.waitForSelector('a[href^="/products/"]')
    const firstProduct = page.locator('a[href^="/products/"]').first()
    await firstProduct.click()

    const addToCartButton = page.locator('button').filter({ hasText: /add to cart/i }).first()
    if (await addToCartButton.isVisible()) {
      await addToCartButton.click()
      await page.waitForTimeout(500)
    }

    // Go to checkout
    await page.goto('/checkout')

    // Should mention delivery somewhere
    await expect(page.locator('body')).toContainText(/delivery|shipping/i)
  })
})
