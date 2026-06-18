const rateLimit = require("express-rate-limit");

// General limiter — applies to all routes as a baseline safety net
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // allow 200 requests per IP in that window
  message: { message: "Too many requests, please try again later." },
  standardHeaders: true, // sends rate limit info back in response headers
  legacyHeaders: false,
});

// Stricter limiter specifically for login/register — these are the
// most sensitive routes since they're the ones attackers target most
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // only 10 attempts per IP in that window
  message: { message: "Too many attempts. Please try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { generalLimiter, authLimiter };
