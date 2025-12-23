import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  randToCents,
  centsToRand,
  getYocoUrls,
  isYocoConfigured,
} from '@/lib/yoco'

describe('Yoco Integration', () => {
  describe('randToCents', () => {
    it('converts rand to cents correctly', () => {
      expect(randToCents(100)).toBe(10000)
      expect(randToCents(99.99)).toBe(9999)
      expect(randToCents(0.01)).toBe(1)
      expect(randToCents(0)).toBe(0)
    })

    it('rounds cents correctly', () => {
      expect(randToCents(100.005)).toBe(10001)
      expect(randToCents(100.004)).toBe(10000)
    })
  })

  describe('centsToRand', () => {
    it('converts cents to rand correctly', () => {
      expect(centsToRand(10000)).toBe(100)
      expect(centsToRand(9999)).toBe(99.99)
      expect(centsToRand(1)).toBe(0.01)
      expect(centsToRand(0)).toBe(0)
    })
  })

  describe('getYocoUrls', () => {
    beforeEach(() => {
      vi.stubEnv('NEXT_PUBLIC_URL', 'https://blaqmart.co.za')
    })

    it('generates correct URLs for an order', () => {
      const urls = getYocoUrls('order-123')

      expect(urls.successUrl).toBe('https://blaqmart.co.za/orders/order-123/success?payment=yoco')
      expect(urls.cancelUrl).toBe('https://blaqmart.co.za/checkout?cancelled=true')
      expect(urls.failureUrl).toBe('https://blaqmart.co.za/checkout?payment_failed=true')
    })

    it('uses localhost when NEXT_PUBLIC_URL is not set', () => {
      vi.stubEnv('NEXT_PUBLIC_URL', '')

      const urls = getYocoUrls('order-456')

      expect(urls.successUrl).toContain('localhost:3000')
    })
  })

  describe('isYocoConfigured', () => {
    it('returns true when both keys are set', () => {
      vi.stubEnv('YOCO_SECRET_KEY', 'sk_test_123')
      vi.stubEnv('YOCO_PUBLIC_KEY', 'pk_test_456')

      expect(isYocoConfigured()).toBe(true)
    })

    it('returns false when secret key is missing', () => {
      vi.stubEnv('YOCO_SECRET_KEY', '')
      vi.stubEnv('YOCO_PUBLIC_KEY', 'pk_test_456')

      expect(isYocoConfigured()).toBe(false)
    })

    it('returns false when public key is missing', () => {
      vi.stubEnv('YOCO_SECRET_KEY', 'sk_test_123')
      vi.stubEnv('YOCO_PUBLIC_KEY', '')

      expect(isYocoConfigured()).toBe(false)
    })
  })
})

describe('Yoco Checkout Creation', () => {
  it('throws error when secret key is not configured', async () => {
    vi.stubEnv('YOCO_SECRET_KEY', '')

    const { createYocoCheckout } = await import('@/lib/yoco')

    await expect(
      createYocoCheckout({
        amount: 10000,
        currency: 'ZAR',
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
        failureUrl: 'https://example.com/failure',
      })
    ).rejects.toThrow('YOCO_SECRET_KEY is not configured')
  })
})
