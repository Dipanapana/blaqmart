/**
 * Simple in-memory rate limiter
 * For production, use Redis or a dedicated rate limiting service
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetAt: number;
  };
}

const store: RateLimitStore = {};

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (store[key].resetAt < now) {
      delete store[key];
    }
  });
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  interval: number; // Time window in milliseconds
  maxRequests: number; // Max requests per interval
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (e.g., IP address, user ID)
 * @param config - Rate limit configuration
 * @returns Result with success status and headers info
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const key = `ratelimit:${identifier}`;

  // Get or create entry
  let entry = store[key];

  if (!entry || entry.resetAt < now) {
    // Create new entry or reset expired one
    entry = {
      count: 0,
      resetAt: now + config.interval,
    };
    store[key] = entry;
  }

  // Increment count
  entry.count++;

  const remaining = Math.max(0, config.maxRequests - entry.count);
  const success = entry.count <= config.maxRequests;

  return {
    success,
    limit: config.maxRequests,
    remaining,
    reset: entry.resetAt,
  };
}

/**
 * Preset rate limit configurations
 */
export const RateLimitPresets = {
  // Very strict - for sensitive operations (login, password reset)
  strict: {
    interval: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
  },
  // Auth operations
  auth: {
    interval: 60 * 60 * 1000, // 1 hour
    maxRequests: 20,
  },
  // Standard API requests
  standard: {
    interval: 60 * 1000, // 1 minute
    maxRequests: 60,
  },
  // Generous - for read-only operations
  generous: {
    interval: 60 * 1000, // 1 minute
    maxRequests: 120,
  },
};

/**
 * Get client identifier from request
 * Uses IP address or user ID if authenticated
 */
export function getClientIdentifier(request: Request, userId?: string): string {
  if (userId) {
    return `user:${userId}`;
  }

  // Get IP from various headers (Cloudflare, nginx, etc.)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');

  const ip = cfConnectingIp || forwarded?.split(',')[0] || realIp || 'unknown';

  return `ip:${ip}`;
}

/**
 * Apply rate limit to a request
 * Returns null if allowed, or a Response if rate limited
 */
export function applyRateLimit(
  request: Request,
  userId: string | undefined,
  config: RateLimitConfig
): Response | null {
  const identifier = getClientIdentifier(request, userId);
  const result = checkRateLimit(identifier, config);

  // Add rate limit headers to help clients
  const headers = {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString(),
  };

  if (!result.success) {
    // Rate limit exceeded
    return new Response(
      JSON.stringify({
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.ceil((result.reset - Date.now()) / 1000),
      }),
      {
        status: 429,
        headers: {
          ...headers,
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  // Request allowed - return null and let handler add headers
  return null;
}

/**
 * Example usage in API route:
 *
 * import { applyRateLimit, RateLimitPresets, getClientIdentifier } from '@/lib/rate-limit';
 *
 * export async function POST(request: NextRequest) {
 *   // Check rate limit
 *   const rateLimitResponse = applyRateLimit(request, undefined, RateLimitPresets.auth);
 *   if (rateLimitResponse) {
 *     return rateLimitResponse;
 *   }
 *
 *   // Continue with normal request handling...
 * }
 */
