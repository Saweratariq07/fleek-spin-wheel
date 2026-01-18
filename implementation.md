# Spin Wheel Shopify App - Implementation Summary

## Overview

A gamified spin wheel application that integrates with Shopify to generate real discount codes. Users enter their email, spin the wheel, and receive discount codes via email only (not displayed on screen for security).

---

## Tech Stack

- **Backend:** Node.js, Express.js, Prisma ORM, PostgreSQL
- **Frontend:** React, Vite, Tailwind CSS, Framer Motion
- **Shopify:** @shopify/shopify-api v12.3.0, GraphQL Admin API
- **Email:** Nodemailer with Gmail SMTP

---

## 1. Shopify Integration

### OAuth Flow

- `GET /api/shopify/auth?shop=store.myshopify.com` - Initiates OAuth
- `GET /api/shopify/auth/callback` - Handles callback, stores access token
- Stores shop credentials in database for later API calls

### Discount Creation (GraphQL)

- **Percentage discounts:** `discountCodeBasicCreate` mutation
- **Fixed amount discounts:** `discountCodeBasicCreate` with fixed value
- **Free shipping:** `discountCodeFreeShippingCreate` mutation
- Each code is unique, tied to customer email, and has configurable expiry

### Files Created

- `src/config/shopify.js` - API configuration
- `src/services/shopify.service.js` - OAuth & shop management
- `src/services/discount.service.js` - Real Shopify discount creation
- `src/routes/shopify.routes.js` - OAuth routes

---

## 2. Backend API

### Spin Endpoint (`POST /api/spin`)

```json
Request: { "email": "user@example.com", "campaignId": "xxx" }
Response: { "success": true, "prizeWon": "20% OFF", "message": "Code sent to email!" }
```

### Workflow

1. Validate email format (regex + disposable email blocking)
2. Check fraud indicators (IP tracking, bot detection)
3. Verify email hasn't already spun (1 spin per email per campaign)
4. Select prize using weighted probability
5. Create real Shopify discount via GraphQL API
6. Send code via email (never shown on screen)
7. Log spin to database for analytics

### Other Endpoints

- `GET /api/prizes/:campaignId` - Get wheel prizes
- `POST /api/otp/send` - Send OTP for verification
- `POST /api/otp/verify` - Verify OTP code
- `GET /api/admin/campaigns` - List campaigns
- `POST /api/admin/campaigns` - Create campaign
- `GET /api/admin/analytics` - Dashboard stats

---

## 3. Security Features

### Email Validation

- Regex format validation
- Disposable email domain blocking (100+ domains)
- MX record verification

### Fraud Prevention

- IP-based tracking (max spins per IP per 24h)
- Bot detection via user-agent analysis
- Suspicious pattern flagging
- Stored in database for audit

### Rate Limiting

- General: 100 requests/15 minutes
- Spin: 3 attempts/24 hours per IP
- OTP: 5 requests/15 minutes
- Admin: 50 requests/15 minutes

### Security Headers

- Helmet.js for HTTP headers
- CORS configuration
- Error handling middleware

### Files Created

- `src/utils/emailValidator.js` - Email validation with disposable blocking
- `src/utils/fraudPrevention.js` - IP tracking, bot detection
- `src/middleware/security.js` - Rate limiters, headers

---

## 4. Database (Prisma + PostgreSQL)

### Models

- **Shop** - Connected Shopify stores with access tokens
- **Campaign** - Wheel configurations with prizes
- **Prize** - Individual prizes with probability weights
- **SpinLog** - All spin attempts with results
- **DiscountCode** - Generated codes with claim status
- **OtpCode** - Email verification codes
- **FraudLog** - Suspicious activity tracking

### Connection

- Prisma Data Platform (PostgreSQL)
- Retry logic for intermittent connectivity (3 attempts, 3s delays)

---

## 5. Frontend

### Components

- **SpinWheel.tsx** - Main wheel with SVG-based rendering
  - Framer Motion for spin animation
  - Proper pie-chart segments via SVG paths
  - Responsive sizing
- **LandingPage.tsx** - Email entry and OTP verification
- **AdminDashboard.tsx** - Campaign management interface
- **ShopifySettings.tsx** - Connect/disconnect Shopify stores

### Wheel Features

- SVG-based rendering (replaced broken CSS clip-path)
- Weighted probability prize selection
- Smooth spin animation with easing
- Center sparkle icon
- Top pointer indicator

---

## 6. Admin Dashboard

### Tabs

1. **Analytics** - Spin stats, conversion rates, charts
2. **Campaigns** - Create/edit wheel campaigns
3. **Prizes** - Configure prizes with probabilities
4. **Shopify Settings** - Connect store via OAuth

---

## 7. Email System

### Templates

- OTP verification email
- Discount code delivery email (includes code, expiry, terms)

### Configuration

- Gmail SMTP via Nodemailer
- Environment variables for credentials

---

## API Quick Reference

| Endpoint                     | Method   | Description           |
| ---------------------------- | -------- | --------------------- |
| `/api/spin`                  | POST     | Spin wheel, get prize |
| `/api/prizes/:id`            | GET      | Get campaign prizes   |
| `/api/otp/send`              | POST     | Send email OTP        |
| `/api/otp/verify`            | POST     | Verify OTP            |
| `/api/shopify/auth`          | GET      | Start OAuth           |
| `/api/shopify/auth/callback` | GET      | OAuth callback        |
| `/api/admin/campaigns`       | GET/POST | Manage campaigns      |
| `/api/admin/analytics`       | GET      | Dashboard stats       |

---

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://...

# Shopify
SHOPIFY_CLIENT_ID=3c840cbc8d081b088f2fa75208beebf0
SHOPIFY_CLIENT_SECRET=shpss_xxx
SHOPIFY_SCOPES=write_discounts,read_discounts

# Email
SMTP_HOST=smtp.gmail.com
SMTP_USER=your@gmail.com
SMTP_PASS=app-password

# App
PORT=5000
FRONTEND_URL=http://localhost:3000
```

---

## Summary

✅ Shopify OAuth & API integration  
✅ Real discount code creation via GraphQL  
✅ Email-only code delivery (not shown on screen)  
✅ Email validation with disposable blocking  
✅ Fraud prevention & rate limiting  
✅ Admin dashboard with analytics  
✅ SVG-based spin wheel with animations  
✅ OTP email verification  
✅ Database logging for all activities
