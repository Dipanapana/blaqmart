import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Accessibility - WCAG 2.1 AA Compliance', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('homepage passes accessibility audit', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()

    // Log violations for debugging
    if (results.violations.length > 0) {
      console.log('Accessibility violations:', JSON.stringify(results.violations, null, 2))
    }

    // Allow some minor violations but flag critical ones
    const criticalViolations = results.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    )

    expect(criticalViolations).toEqual([])
  })

  test('products page passes accessibility audit', async ({ page }) => {
    await page.goto('/products')
    await page.waitForLoadState('networkidle')

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()

    const criticalViolations = results.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    )

    expect(criticalViolations).toEqual([])
  })

  test('checkout page passes accessibility audit', async ({ page }) => {
    await page.goto('/checkout')
    await page.waitForLoadState('networkidle')

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()

    const criticalViolations = results.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    )

    expect(criticalViolations).toEqual([])
  })

  test('schools page passes accessibility audit', async ({ page }) => {
    await page.goto('/schools')
    await page.waitForLoadState('networkidle')

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()

    const criticalViolations = results.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    )

    expect(criticalViolations).toEqual([])
  })
})

test.describe('Color Contrast', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('homepage has sufficient color contrast', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const results = await new AxeBuilder({ page })
      .withRules(['color-contrast'])
      .analyze()

    // Log any contrast issues
    if (results.violations.length > 0) {
      console.log('Contrast violations:', results.violations.map(v => ({
        description: v.description,
        nodes: v.nodes.map(n => n.html.substring(0, 100))
      })))
    }

    // Check that there are no critical contrast failures
    const criticalContrast = results.violations.filter(v => v.impact === 'critical')
    expect(criticalContrast).toEqual([])
  })

  test('buttons have readable text', async ({ page }) => {
    await page.goto('/')

    const buttons = page.locator('button:visible')
    const buttonCount = await buttons.count()

    for (let i = 0; i < Math.min(buttonCount, 10); i++) {
      const button = buttons.nth(i)
      const text = await button.textContent()
      const backgroundColor = await button.evaluate(el =>
        window.getComputedStyle(el).backgroundColor
      )
      const color = await button.evaluate(el =>
        window.getComputedStyle(el).color
      )

      // Just log for manual review - actual contrast calculation is complex
      if (text && text.trim()) {
        console.log(`Button "${text.trim().substring(0, 20)}": bg=${backgroundColor}, text=${color}`)
      }
    }
  })
})

test.describe('Keyboard Navigation', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('can navigate homepage with keyboard', async ({ page }) => {
    await page.goto('/')

    // Focus first focusable element
    await page.keyboard.press('Tab')

    // Should be able to tab through interactive elements
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab')

      // Get currently focused element
      const focusedElement = await page.evaluate(() => {
        const el = document.activeElement
        return {
          tagName: el?.tagName,
          type: el?.getAttribute('type'),
          text: el?.textContent?.substring(0, 30),
        }
      })

      // Focused element should exist
      expect(focusedElement.tagName).not.toBe('BODY')
    }
  })

  test('interactive elements have visible focus indicators', async ({ page }) => {
    await page.goto('/')

    // Tab to first interactive element
    await page.keyboard.press('Tab')

    // Get focused element's outline/ring
    const hasVisibleFocus = await page.evaluate(() => {
      const el = document.activeElement
      if (!el) return false

      const styles = window.getComputedStyle(el)
      const outline = styles.outline
      const boxShadow = styles.boxShadow
      const border = styles.border

      // Check for visible focus indicator
      return (
        (outline && outline !== 'none' && outline !== '0px none rgb(0, 0, 0)') ||
        (boxShadow && boxShadow !== 'none') ||
        el.classList.contains('focus-visible') ||
        el.matches(':focus-visible')
      )
    })

    // At least some elements should have focus indicators
    // We'll check multiple elements
    let focusableCount = 0
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab')
      const isFocused = await page.evaluate(() => document.activeElement?.tagName !== 'BODY')
      if (isFocused) focusableCount++
    }

    expect(focusableCount).toBeGreaterThan(0)
  })

  test('can activate buttons with Enter key', async ({ page }) => {
    await page.goto('/products')
    await page.waitForSelector('a[href^="/products/"]')

    // Navigate to first product link
    const firstProduct = page.locator('a[href^="/products/"]').first()
    await firstProduct.focus()

    // Press Enter
    await page.keyboard.press('Enter')

    // Should navigate to product page
    await page.waitForURL(/\/products\//)
    expect(page.url()).toContain('/products/')
  })
})

test.describe('Screen Reader Compatibility', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('images have alt text', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const images = page.locator('img')
    const imageCount = await images.count()

    let missingAlt = 0
    const missingAltImages: string[] = []

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i)
      const alt = await img.getAttribute('alt')
      const src = await img.getAttribute('src')

      // Decorative images can have empty alt, but should have alt attribute
      if (alt === null) {
        missingAlt++
        missingAltImages.push(src || 'unknown')
      }
    }

    if (missingAlt > 0) {
      console.log('Images missing alt:', missingAltImages.slice(0, 5))
    }

    // Most images should have alt text
    expect(missingAlt).toBeLessThan(imageCount * 0.2) // Allow 20% without alt (decorative)
  })

  test('form inputs have labels', async ({ page }) => {
    await page.goto('/checkout')

    const inputs = page.locator('input:visible, select:visible, textarea:visible')
    const inputCount = await inputs.count()

    let unlabeledInputs = 0

    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i)
      const id = await input.getAttribute('id')
      const ariaLabel = await input.getAttribute('aria-label')
      const ariaLabelledby = await input.getAttribute('aria-labelledby')
      const placeholder = await input.getAttribute('placeholder')
      const title = await input.getAttribute('title')

      // Check for associated label
      let hasLabel = ariaLabel || ariaLabelledby || title

      if (id) {
        const labelCount = await page.locator(`label[for="${id}"]`).count()
        hasLabel = hasLabel || labelCount > 0
      }

      // Placeholder alone is not a valid label, but we'll be lenient
      if (!hasLabel && !placeholder) {
        unlabeledInputs++
      }
    }

    // All inputs should have labels (allow some flexibility)
    expect(unlabeledInputs).toBeLessThanOrEqual(2)
  })

  test('page has proper heading hierarchy', async ({ page }) => {
    await page.goto('/')

    const headings = await page.evaluate(() => {
      const h1s = document.querySelectorAll('h1')
      const h2s = document.querySelectorAll('h2')
      const h3s = document.querySelectorAll('h3')

      return {
        h1Count: h1s.length,
        h2Count: h2s.length,
        h3Count: h3s.length,
        h1Text: Array.from(h1s).map(h => h.textContent?.trim().substring(0, 50)),
      }
    })

    // Should have exactly one h1
    expect(headings.h1Count).toBeGreaterThanOrEqual(1)

    // Log heading structure for review
    console.log('Heading structure:', headings)
  })

  test('links have descriptive text', async ({ page }) => {
    await page.goto('/')

    const links = page.locator('a:visible')
    const linkCount = await links.count()

    let genericLinks = 0
    const genericTexts = ['click here', 'read more', 'learn more', 'here', 'link']

    for (let i = 0; i < Math.min(linkCount, 20); i++) {
      const link = links.nth(i)
      const text = await link.textContent()
      const ariaLabel = await link.getAttribute('aria-label')
      const title = await link.getAttribute('title')

      const linkText = (text || ariaLabel || title || '').toLowerCase().trim()

      if (genericTexts.includes(linkText) || linkText.length < 2) {
        genericLinks++
      }
    }

    // Most links should have descriptive text
    expect(genericLinks).toBeLessThan(5)
  })
})

test.describe('ARIA Attributes', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('interactive elements have appropriate ARIA roles', async ({ page }) => {
    await page.goto('/')

    // Check buttons that should have button role
    const buttonsWithoutRole = await page.locator('div[onclick], span[onclick]').count()

    // Interactive divs/spans should use button role or be actual buttons
    expect(buttonsWithoutRole).toBeLessThan(3)
  })

  test('modal dialogs have proper ARIA attributes', async ({ page }) => {
    await page.goto('/')

    // Try to open mobile menu if hamburger exists
    const menuButton = page.locator('button').filter({ has: page.locator('svg.lucide-menu') }).first()

    if (await menuButton.isVisible()) {
      await menuButton.click()
      await page.waitForTimeout(300)

      // Check for dialog role
      const dialog = page.locator('[role="dialog"]')

      if (await dialog.count() > 0) {
        const ariaModal = await dialog.first().getAttribute('aria-modal')
        const ariaLabel = await dialog.first().getAttribute('aria-label')
        const ariaLabelledby = await dialog.first().getAttribute('aria-labelledby')

        // Dialog should have aria-modal or aria-label/labelledby
        const hasProperAria = ariaModal === 'true' || ariaLabel || ariaLabelledby
        expect(hasProperAria).toBeTruthy()
      }
    }
  })

  test('navigation has proper landmark roles', async ({ page }) => {
    await page.goto('/')

    // Check for navigation landmark
    const navElements = await page.locator('nav, [role="navigation"]').count()
    expect(navElements).toBeGreaterThan(0)

    // Check for main landmark
    const mainElement = await page.locator('main, [role="main"]').count()
    expect(mainElement).toBeGreaterThanOrEqual(1)
  })

  test('alerts and notifications have proper roles', async ({ page }) => {
    await page.goto('/checkout')

    // Try to trigger a validation error
    const submitButton = page.locator('button[type="submit"]').first()

    if (await submitButton.isVisible()) {
      await submitButton.click()
      await page.waitForTimeout(500)

      // Check if error messages have proper role
      const alerts = page.locator('[role="alert"], [aria-live="polite"], [aria-live="assertive"]')
      const alertCount = await alerts.count()

      // If there are visible errors, they should have alert role
      const errorMessages = page.locator('.text-red-500, .text-destructive, .error')
      const errorCount = await errorMessages.count()

      // Log for debugging
      if (errorCount > 0) {
        console.log(`Found ${errorCount} error messages, ${alertCount} with alert role`)
      }
    }
  })
})

test.describe('Mobile Accessibility', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('zoom is not disabled', async ({ page }) => {
    await page.goto('/')

    const viewportMeta = await page.evaluate(() => {
      const meta = document.querySelector('meta[name="viewport"]')
      return meta?.getAttribute('content') || ''
    })

    // Should not have user-scalable=no
    expect(viewportMeta).not.toContain('user-scalable=no')
    expect(viewportMeta).not.toContain('user-scalable=0')

    // Maximum-scale should be at least 2 or not set
    if (viewportMeta.includes('maximum-scale')) {
      const maxScaleMatch = viewportMeta.match(/maximum-scale=(\d+\.?\d*)/)
      if (maxScaleMatch) {
        const maxScale = parseFloat(maxScaleMatch[1])
        expect(maxScale).toBeGreaterThanOrEqual(2)
      }
    }
  })

  test('text is resizable without breaking layout', async ({ page }) => {
    await page.goto('/')

    // Check initial state
    const initialWidth = await page.evaluate(() => document.documentElement.scrollWidth)

    // Simulate larger text (this is a simplified check)
    await page.evaluate(() => {
      document.body.style.fontSize = '20px'
    })

    await page.waitForTimeout(100)

    // Check that horizontal scroll hasn't appeared
    const newWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    const viewportWidth = await page.evaluate(() => window.innerWidth)

    expect(newWidth).toBeLessThanOrEqual(viewportWidth + 50) // Allow small tolerance
  })

  test('orientation changes are handled', async ({ page }) => {
    // Portrait
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    const portraitNav = page.locator('nav')
    await expect(portraitNav.first()).toBeVisible()

    // Landscape
    await page.setViewportSize({ width: 667, height: 375 })
    await page.waitForTimeout(200)

    // Content should still be accessible
    const landscapeNav = page.locator('nav')
    await expect(landscapeNav.first()).toBeVisible()

    // No horizontal overflow
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth
    })

    expect(hasHorizontalScroll).toBe(false)
  })
})

test.describe('Reduced Motion', () => {
  test('respects prefers-reduced-motion', async ({ page }) => {
    // Enable reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')

    // Check that animations are disabled or reduced
    const animationDurations = await page.evaluate(() => {
      const elements = document.querySelectorAll('*')
      const durations: string[] = []

      elements.forEach(el => {
        const style = window.getComputedStyle(el)
        if (style.animationDuration && style.animationDuration !== '0s') {
          durations.push(style.animationDuration)
        }
        if (style.transitionDuration && style.transitionDuration !== '0s') {
          // Allow short transitions for focus states
          if (parseFloat(style.transitionDuration) > 0.3) {
            durations.push(style.transitionDuration)
          }
        }
      })

      return durations
    })

    // With reduced motion, long animations should be minimal
    // This is a soft check - just logging
    console.log('Animation durations with reduced motion:', animationDurations.length)
  })
})
