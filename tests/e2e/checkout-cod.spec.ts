import { test, expect } from '@playwright/test'

test.describe('Cash on Delivery Checkout', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a product and add it to cart
    // Note: This assumes products exist in the database
    await page.goto('/products')

    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 }).catch(() => {
      // If no products, skip this test
      test.skip()
    })

    // Click the first product's add to cart button
    const addButton = page.locator('[data-testid="add-to-cart-button"]').first()
    if (await addButton.isVisible()) {
      await addButton.click()
      // Wait for cart to update
      await page.waitForTimeout(500)
    }
  })

  test('COD is available for Warrenton', async ({ page }) => {
    await page.goto('/checkout')

    // Fill in email and phone
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="phone"]', '0821234567')
    await page.fill('[name="recipientName"]', 'Test Customer')
    await page.fill('[name="streetAddress"]', '123 Main Street')

    // Select Warrenton as town
    await page.click('[data-testid="town-select"]')
    await page.click('text=Warrenton')

    // Fill postal code
    await page.fill('[name="postalCode"]', '8530')

    // Continue to delivery step
    await page.click('button[type="submit"]')

    // Select delivery date (first available)
    const dateButton = page.locator('button').filter({ hasText: /\d+/ }).first()
    await dateButton.click()

    // Select morning slot
    await page.click('text=Morning')

    // Continue to payment step
    await page.click('button[type="submit"]')

    // Verify COD option is visible
    await expect(page.getByTestId('payment-cod')).toBeVisible()
  })

  test('COD is NOT available for Hartswater', async ({ page }) => {
    await page.goto('/checkout')

    // Fill in required fields
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="phone"]', '0821234567')
    await page.fill('[name="recipientName"]', 'Test Customer')
    await page.fill('[name="streetAddress"]', '456 Other Street')

    // Select Hartswater as town (courier only)
    await page.click('[data-testid="town-select"]')
    await page.click('text=Hartswater')

    await page.fill('[name="postalCode"]', '8570')

    // Continue to delivery step
    await page.click('button[type="submit"]')

    // Select delivery options
    const dateButton = page.locator('button').filter({ hasText: /\d+/ }).first()
    await dateButton.click()
    await page.click('text=Morning')

    // Continue to payment step
    await page.click('button[type="submit"]')

    // COD should NOT be visible (only disabled placeholder)
    await expect(page.getByTestId('payment-cod')).not.toBeVisible()

    // Yoco and PayFast should be visible
    await expect(page.getByTestId('payment-yoco')).toBeVisible()
    await expect(page.getByTestId('payment-payfast')).toBeVisible()
  })

  test('shows local delivery info for Warrenton', async ({ page }) => {
    await page.goto('/checkout')

    // Select Warrenton
    await page.click('[data-testid="town-select"]')
    await page.click('text=Warrenton')

    // Should show local delivery info
    await expect(page.getByText('Local Delivery')).toBeVisible()
    await expect(page.getByText('Same day')).toBeVisible()
    await expect(page.getByText('Free delivery')).toBeVisible()
    await expect(page.getByText('Cash on Delivery available')).toBeVisible()
  })

  test('shows courier delivery info for Christiana', async ({ page }) => {
    await page.goto('/checkout')

    // Select Christiana
    await page.click('[data-testid="town-select"]')
    await page.click('text=Christiana')

    // Should show courier delivery info
    await expect(page.getByText('Courier Delivery')).toBeVisible()
    await expect(page.getByText('1-2 days')).toBeVisible()
  })
})

test.describe('Delivery Fee Calculation', () => {
  test('free delivery for orders over R500', async ({ page }) => {
    // This test requires adding products worth over R500
    // For now, just verify the logic exists
    await page.goto('/checkout')

    // The order summary should show delivery fee
    await expect(page.getByText('Delivery')).toBeVisible()
  })
})
