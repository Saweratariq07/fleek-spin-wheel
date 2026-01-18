import rateLimit from "express-rate-limit";

export const spinLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 1,
  message: "You can spin only once per day",
});
