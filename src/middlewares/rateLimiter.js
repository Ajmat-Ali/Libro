const rateLimit = require("express-rate-limit");

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    status: "error",
    message: "Too Many request, please try after 15 minutes",
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 6,
  message: {
    status: "error",
    message: "Rate limit exceed on auth, please try again after 15 minutes",
  },
});

module.exports = { globalLimiter, authLimiter };
