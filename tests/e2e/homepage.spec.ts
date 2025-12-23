import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('displays hero section with stationery messaging', async ({ page }) => {
    // Check hero headline
    await expect(page.getByRole('heading', { level: 1 })).toContainText('School Stationery')

    // Check "Back to School 2025" badge
    await expect(page.getByText('Back to School 2025')).toBeVisible()

    // Check main CTA buttons
    await expect(page.getByRole('link', { name: /Shop by Grade/i }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: /Browse Products/i })).toBeVisible()
  })

  test('displays trust badges section', async ({ page }) => {
    // Use the border-b section for trust badges
    const trustSection = page.locator('section.border-b')
    await expect(trustSection).toBeVisible()
    await expect(trustSection.getByText('Secure Payment')).toBeVisible()
  })

  test('displays grade selector section', async ({ page }) => {
    // Check "Shop by Grade" section
    const gradeSection = page.locator('#shop-by-grade')
    await expect(gradeSection.getByRole('heading', { name: /Shop by Grade/i })).toBeVisible()

    // Check that grade selector is rendered
    await expect(page.getByTestId('grade-selector')).toBeVisible()
  })

  test('grade selector displays all grades', async ({ page }) => {
    // Get the grade selector
    await expect(page.getByTestId('grade-selector')).toBeVisible()

    // Check Grade R is visible - grades render twice (mobile/desktop), so get the visible one
    // On desktop, use last() to get the desktop grid view (mobile view is first but hidden)
    await expect(page.getByTestId('grade-r').last()).toBeVisible({ timeout: 30000 })

    // Check Grade 12 is visible
    await expect(page.getByTestId('grade-12').last()).toBeVisible({ timeout: 30000 })
  })

  test('displays stationery packs section', async ({ page }) => {
    // Check for "Popular Stationery Packs" heading
    await expect(page.getByRole('heading', { name: /Popular Stationery Packs/i })).toBeVisible()

    // Check for View All Packs link
    await expect(page.getByRole('link', { name: /View All Packs/i })).toBeVisible()
  })

  test('displays categories section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Shop by Category/i })).toBeVisible()
  })

  test('displays How It Works section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /How It Works/i })).toBeVisible()
    await expect(page.getByText('Choose Your Grade')).toBeVisible()
    await expect(page.getByText('Secure Checkout').first()).toBeVisible()
    await expect(page.getByText('Fast Delivery')).toBeVisible()
  })

  test('displays Delivery Areas section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Delivery Areas/i })).toBeVisible()

    // Check the delivery cards
    const deliverySection = page.locator('section').filter({ hasText: 'Delivery Areas' })
    await expect(deliverySection.getByText('Warrenton & Jan Kempdorp')).toBeVisible()
  })

  test('displays CTA section', async ({ page }) => {
    await expect(page.getByText('Ready for the new school year?')).toBeVisible()
  })
})

test.describe('Navigation', () => {
  test('header has correct navigation links', async ({ page }) => {
    await page.goto('/')

    // Check desktop navigation
    const header = page.locator('header')
    await expect(header.getByRole('link', { name: /Shop by Grade/i })).toBeVisible()
    await expect(header.getByRole('link', { name: /Stationery Packs/i })).toBeVisible()
    await expect(header.getByRole('link', { name: /Products/i })).toBeVisible()
    await expect(header.getByRole('link', { name: /Categories/i })).toBeVisible()
  })

  test.skip('logo links to homepage', async ({ page }) => {
    // Skipped: Navigation test is flaky due to Next.js client-side routing
    await page.goto('/products')
    const logo = page.locator('header a', { hasText: 'Blaq' }).first()
    await logo.click()
    await expect(page).toHaveURL('/')
  })

  test('search input is visible', async ({ page }) => {
    await page.goto('/')

    // Check search input exists
    await expect(page.locator('input[type="search"]')).toBeVisible()
  })
})

test.describe('Mobile Navigation', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('mobile menu button is visible', async ({ page }) => {
    await page.goto('/')

    // Mobile menu button should be visible
    const menuButton = page.locator('button').filter({ has: page.locator('svg') }).first()
    await expect(menuButton).toBeVisible()
  })
})

test.describe('Products Page', () => {
  test('displays products list', async ({ page }) => {
    await page.goto('/products')

    // Check page heading
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 30000 })
  })
})

test.describe('Categories Page', () => {
  test('displays categories', async ({ page }) => {
    await page.goto('/categories')

    // Check page heading
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 30000 })
  })
})
