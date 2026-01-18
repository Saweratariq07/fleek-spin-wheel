import prisma from "../../prismaClient.js";


const ipSpinCache = new Map();
const emailSpinCache = new Map();

const CACHE_TTL = 24 * 60 * 60 * 1000;


export function getClientIP(req) {
 
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
   
    return forwarded.split(",")[0].trim();
  }

  return (
    req.headers["x-real-ip"] ||
    req.headers["cf-connecting-ip"] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.ip ||
    "unknown"
  );
}


export async function hasIPSpunToday(ip, campaignId = null) {
  const cacheKey = `${ip}:${campaignId || "global"}`;

 
  const cached = ipSpinCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return true;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const spinCount = await prisma.spin.count({
      where: {
        createdAt: { gte: today },
        ...(campaignId && { campaignId }),
      },
    });

    return spinCount > 0;
  } catch (error) {
    console.error("Error checking IP spin:", error);
    return false;
  }
}

export async function hasEmailSpun(email, campaignId = null) {
  const cacheKey = `${email}:${campaignId || "global"}`;

  
  const cached = emailSpinCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return true;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const existingSpin = await prisma.spin.findFirst({
      where: {
        email: email.toLowerCase(),
        createdAt: { gte: today },
        ...(campaignId && { campaignId }),
      },
    });

    if (existingSpin) {
     
      emailSpinCache.set(cacheKey, { timestamp: Date.now() });
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error checking email spin:", error);
    return false;
  }
}


export function recordSpinAttempt(ip, email, campaignId = null) {
  const ipKey = `${ip}:${campaignId || "global"}`;
  const emailKey = `${email}:${campaignId || "global"}`;

  ipSpinCache.set(ipKey, { timestamp: Date.now() });
  emailSpinCache.set(emailKey, { timestamp: Date.now() });
}


export function cleanupCache() {
  const now = Date.now();

  for (const [key, value] of ipSpinCache.entries()) {
    if (now - value.timestamp >= CACHE_TTL) {
      ipSpinCache.delete(key);
    }
  }

  for (const [key, value] of emailSpinCache.entries()) {
    if (now - value.timestamp >= CACHE_TTL) {
      emailSpinCache.delete(key);
    }
  }
}


setInterval(cleanupCache, 60 * 60 * 1000);


export function fraudDetectionMiddleware(req, res, next) {
  const ip = getClientIP(req);
  req.clientIP = ip;

  console.log(`[Fraud Check] IP: ${ip}, Path: ${req.path}`);

  next();
}


export function checkSuspiciousActivity(ip, email, userAgent) {
  if (!userAgent || userAgent.length < 10) {
    return { suspicious: true, reason: "Invalid user agent" };
  }

  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python-requests/i,
  ];

  for (const pattern of botPatterns) {
    if (pattern.test(userAgent)) {
      return { suspicious: true, reason: "Bot detected" };
    }
  }

  return { suspicious: false };
}
