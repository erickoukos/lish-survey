"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRateLimit = void 0;
const rate_limiter_flexible_1 = require("rate-limiter-flexible");
// In-memory rate limiter for serverless functions
// In production, consider using Redis for persistence across function invocations
const rateLimiter = new rate_limiter_flexible_1.RateLimiterMemory({
    keyPrefix: 'middleware',
    points: 5, // Number of requests
    duration: 60, // Per 60 seconds
});
const checkRateLimit = async (key) => {
    try {
        await rateLimiter.consume(key);
        return true;
    }
    catch (rejRes) {
        return false;
    }
};
exports.checkRateLimit = checkRateLimit;
