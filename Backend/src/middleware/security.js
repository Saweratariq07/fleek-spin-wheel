import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { getClientIP } from "../utils/fraudPrevention.js";


export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.shopify.com"],
    },
  },
  crossOriginEmbedderPolicy: false, 
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
});


export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many requests, please try again later",
  },
  keyGenerator: (req) => getClientIP(req),
  standardHeaders: true,
  legacyHeaders: false,
});


export const spinRateLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, 
  max: 3,
  message: {
    success: false,
    message: "You have already spun the wheel today. Come back tomorrow!",
  },
  keyGenerator: (req) => getClientIP(req),
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});


export const otpRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, 
  max: 5,
  message: {
    success: false,
    message: "Too many OTP requests. Please wait 10 minutes.",
  },
  keyGenerator: (req) => req.body?.email || getClientIP(req),
  standardHeaders: true,
  legacyHeaders: false,
});


export const adminRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 200,
  message: {
    success: false,
    message: "Too many admin requests, please slow down",
  },
  keyGenerator: (req) => getClientIP(req),
  standardHeaders: true,
  legacyHeaders: false,
});


export const corsOptions = {
  origin: (origin, callback) => {
   
    if (!origin) {
      return callback(null, true);
    }

    if (origin.includes(".myshopify.com")) {
      return callback(null, true);
    }

    if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
      return callback(null, true);
    }

    
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    if (process.env.NODE_ENV !== "production") {
      return callback(null, true);
    }

    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};


export function requestLogger(req, res, next) {
  const start = Date.now();
  const ip = getClientIP(req);

  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms - IP: ${ip}`,
    );
  });

  next();
}


export function errorHandler(err, req, res, next) {
  console.error(`[Error] ${err.message}`, err.stack);

  const message =
    process.env.NODE_ENV === "production"
      ? "Something went wrong"
      : err.message;

  res.status(err.status || 500).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
}


export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
  });
}
