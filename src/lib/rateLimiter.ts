import 'server-only';
import { AUTH_CONSTANTS } from './constants';

/**
 * In-memory rate limiter for authentication endpoints
 * For production, consider Redis or a dedicated rate limiting service
 */

interface RateLimitEntry {
  attempts: number;
  windowStart: number;
  lastAttempt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up old entries every hour
setInterval(() => {
  const now = Date.now();
  const expiredThreshold = now - AUTH_CONSTANTS.RATE_LIMIT_WINDOW_MS * 2;

  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.lastAttempt < expiredThreshold) {
      rateLimitStore.delete(key);
    }
  }
}, 60 * 60 * 1000);

/**
 * Check if an identifier (email or IP) has exceeded rate limits
 * @param identifier - Email address or IP address
 * @returns Object with isLimited flag and remaining attempts
 */
export function checkRateLimit(identifier: string): {
  isLimited: boolean;
  remainingAttempts: number;
  resetTime: Date | null;
} {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry) {
    return {
      isLimited: false,
      remainingAttempts: AUTH_CONSTANTS.MAX_LOGIN_ATTEMPTS,
      resetTime: null,
    };
  }

  const windowElapsed = now - entry.windowStart;

  // Reset window if it has expired
  if (windowElapsed >= AUTH_CONSTANTS.RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.delete(identifier);
    return {
      isLimited: false,
      remainingAttempts: AUTH_CONSTANTS.MAX_LOGIN_ATTEMPTS,
      resetTime: null,
    };
  }

  // Check if limit exceeded
  if (entry.attempts >= AUTH_CONSTANTS.MAX_LOGIN_ATTEMPTS) {
    const resetTime = new Date(entry.windowStart + AUTH_CONSTANTS.RATE_LIMIT_WINDOW_MS);
    return {
      isLimited: true,
      remainingAttempts: 0,
      resetTime,
    };
  }

  return {
    isLimited: false,
    remainingAttempts: AUTH_CONSTANTS.MAX_LOGIN_ATTEMPTS - entry.attempts,
    resetTime: null,
  };
}

/**
 * Record an authentication attempt
 * @param identifier - Email address or IP address
 */
export function recordAttempt(identifier: string): void {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry) {
    rateLimitStore.set(identifier, {
      attempts: 1,
      windowStart: now,
      lastAttempt: now,
    });
    return;
  }

  const windowElapsed = now - entry.windowStart;

  // Start new window if current one expired
  if (windowElapsed >= AUTH_CONSTANTS.RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(identifier, {
      attempts: 1,
      windowStart: now,
      lastAttempt: now,
    });
    return;
  }

  // Increment attempts in current window
  entry.attempts++;
  entry.lastAttempt = now;
}

/**
 * Reset rate limit for an identifier (e.g., after successful login)
 * @param identifier - Email address or IP address
 */
export function resetRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}

/**
 * Add artificial delay to normalize timing and prevent timing attacks
 * @param baseDelay - Base delay in milliseconds (default from constants)
 */
export async function addTimingDelay(
  baseDelay: number = AUTH_CONSTANTS.AUTH_TIMING_DELAY_MS
): Promise<void> {
  // Add small random variation to prevent pattern detection
  const jitter = Math.random() * 50; // 0-50ms random jitter
  const totalDelay = baseDelay + jitter;

  await new Promise(resolve => setTimeout(resolve, totalDelay));
}

/**
 * Get client identifier from request headers
 * Uses IP address or forwarded IP for rate limiting
 */
export function getClientIdentifier(headers: Headers): string {
  // Check for forwarded IP (when behind proxy)
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    // Take first IP if multiple are listed
    return forwardedFor.split(',')[0].trim();
  }

  // Check for real IP header
  const realIp = headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback to a generic identifier if no IP available
  return 'unknown-client';
}
