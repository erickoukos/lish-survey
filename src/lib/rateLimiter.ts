import { RateLimiterMemory } from 'rate-limiter-flexible'

// In-memory rate limiter for serverless functions
// In production, consider using Redis for persistence across function invocations
const rateLimiter = new RateLimiterMemory({
  keyPrefix: 'middleware',
  points: 5, // Number of requests
  duration: 60, // Per 60 seconds
})

export const checkRateLimit = async (key: string): Promise<boolean> => {
  try {
    await rateLimiter.consume(key)
    return true
  } catch (rejRes) {
    return false
  }
}
