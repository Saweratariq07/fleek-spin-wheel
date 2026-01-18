# Spin Wheel Backend - Complete Implementation Guide

A Shopify spin wheel app backend with email validation, discount code generation, and admin dashboard.

## 📁 Project Structure

```
spin-wheel-backend/
├── src/
│   ├── controllers/
│   │   ├── spin.controller.js       # Spin wheel logic
│   │   ├── campaign.controller.js   # Campaign CRUD
│   │   ├── prize.controller.js      # Prize management
│   │   └── analytics.controller.js  # Analytics data
│   ├── services/
│   │   ├── email.service.js         # Email sending
│   │   └── discount.service.js      # Code generation
│   ├── routes/
│   │   ├── spin.routes.js           # Spin endpoints
│   │   └── admin.routes.js          # Admin endpoints
│   ├── utils/
│   │   ├── emailValidator.js        # Email validation
│   │   └── rateLimiter.js          # Rate limiting
│   └── config/
│       └── db.js                    # Database connection
├── prisma/
│   ├── schema.prisma                # Database schema
│   └── migrations/                  # Database migrations
├── admin/                            # React admin dashboard
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx       # Campaign management
│   │   │   └── PrizeManager.jsx    # Prize editor
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── index.html
├── index.js                         # Server entry point
├── package.json
└── .env                             # Environment variables
```

##  Quick Start

### 1. Backend Setup

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your credentials:
# - DATABASE_URL (PostgreSQL)
# - SENDGRID_API_KEY
# - SENDER_EMAIL
# - PORT (default: 5000)

# Run database migrations
npx prisma migrate dev --name init

# Start backend
npm run dev
```

### 2. Admin Dashboard Setup

```bash
cd admin

# Install dependencies
npm install

# Start development server
npm run dev
# Opens at http://localhost:3000
```

## 📡 API Endpoints

### Spin Wheel
- **POST** `/api/spin` - User spins the wheel
  ```json
  {
    "email": "user@example.com",
    "campaignId": "campaign-123"
  }
  ```

### Admin - Campaigns
- **GET** `/api/admin/shops/:shopId/campaigns` - List campaigns
- **POST** `/api/admin/shops/:shopId/campaigns` - Create campaign
- **GET** `/api/admin/campaigns/:campaignId` - Get campaign details
- **PUT** `/api/admin/campaigns/:campaignId` - Update campaign
- **DELETE** `/api/admin/campaigns/:campaignId` - Delete campaign

### Admin - Prizes
- **GET** `/api/admin/campaigns/:campaignId/prizes` - List prizes
- **POST** `/api/admin/campaigns/:campaignId/prizes` - Create prize
- **PUT** `/api/admin/prizes/:prizeId` - Update prize
- **DELETE** `/api/admin/prizes/:prizeId` - Delete prize

### Admin - Analytics
- **GET** `/api/admin/campaigns/:campaignId/analytics?days=30` - Campaign analytics
- **GET** `/api/admin/shops/:shopId/analytics` - Shop analytics

## 🗂️ Database Schema

### Shop
```prisma
model Shop {
  id          String     @id
  domain      String     @unique
  accessToken String
  plan        String     @default("free")
  campaigns   Campaign[]
  createdAt   DateTime   @default(now())
}
```

### Campaign
```prisma
model Campaign {
  id            String         @id @default(cuid())
  shopId        String
  shop          Shop           @relation(fields: [shopId], references: [id])
  name          String
  active        Boolean        @default(true)
  prizes        Prize[]
  discountCodes DiscountCode[]
  spins         Spin[]
  settings      Json
  createdAt     DateTime       @default(now())
}
```

### Prize
```prisma
model Prize {
  id         String   @id @default(cuid())
  campaignId String
  campaign   Campaign @relation(fields: [campaignId], references: [id])
  label      String   # e.g., "20% Off"
  value      Float    # e.g., 20
  type       String   # e.g., "discount"
  probability Float   # Weight for random selection
  color      String   # Hex color
}
```

### DiscountCode
```prisma
model DiscountCode {
  id         String   @id @default(cuid())
  code       String   @unique
  email      String?
  claimed    Boolean  @default(false)
  claimedAt  DateTime?
  campaign   Campaign @relation(fields: [campaignId], references: [id])
  campaignId String
  expiresAt  DateTime
}
```

### Spin
```prisma
model Spin {
  id         String   @id @default(cuid())
  email      String
  prizeWon   String
  code       String?
  campaign   Campaign @relation(fields: [campaignId], references: [id])
  campaignId String
  createdAt  DateTime @default(now())
}
```

## 🔧 Key Features

### Spin Wheel Endpoint
- ✅ Email validation (regex + format)
- ✅ Probability-weighted prize selection
- ✅ Automatic discount code generation
- ✅ Email delivery via SendGrid
- ✅ Error handling & logging
- ✅ Rate limiting (1 spin per 24h per IP)

### Admin Dashboard
- ✅ Campaign CRUD
- ✅ Prize management with colors
- ✅ Analytics & metrics
- ✅ Responsive UI (Tailwind CSS)
- ✅ Real-time updates

### Email Service
- ✅ HTML email templates
- ✅ Prize information included
- ✅ Expiration countdown
- ✅ SendGrid integration

## 📊 Sample Data Creation

```bash
# Create a shop
curl -X POST http://localhost:5000/api/admin/shops/shop-123/campaigns \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Summer Sale Wheel",
    "active": true
  }'

# Add prizes to campaign
curl -X POST http://localhost:5000/api/admin/campaigns/CAMPAIGN_ID/prizes \
  -H "Content-Type: application/json" \
  -d '{
    "label": "20% Off",
    "value": 20,
    "type": "discount",
    "probability": 2,
    "color": "#667eea"
  }'

# Spin the wheel
curl -X POST http://localhost:5000/api/spin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "campaignId": "CAMPAIGN_ID"
  }'
```

## 🔐 Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/spin_wheel"

# Email
SENDGRID_API_KEY="SG.xxxxxxxxxxxxx"
SENDER_EMAIL="noreply@yourdomain.com"

# Server
PORT=5000
NODE_ENV=development
```

## 🚢 Deployment

### Render.com
```bash
# Push to GitHub
git push origin main

# Connect repository to Render
# Add environment variables in Render dashboard
# Deploy automatically on push
```

### Heroku (Alternative)
```bash
heroku login
heroku create your-app-name
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main
```

## 📋 Admin Dashboard Usage

### Create Campaign
1. Click "New Campaign"
2. Enter campaign name
3. Toggle "Active" status
4. Click "Create"

### Manage Prizes
1. Click "View Details" on campaign
2. Click "Add Prize"
3. Set label, value, probability, color
4. Click "Add"

### View Analytics
1. Open campaign details
2. View spins, codes, conversion rate
3. See top-winning prizes

## 🛡️ Security Features

- ✅ Email validation
- ✅ Rate limiting (1 spin/24h)
- ✅ CORS protection
- ✅ Input validation
- ✅ Error handling (no sensitive data exposed)
- ✅ Database relationships enforced

## 🔄 Next Steps (Optional Enhancements)

1. **Shopify API Integration**
   - Create real discount codes in Shopify
   - Track usage in Shopify dashboard

2. **Theme App Extension**
   - Frontend spin wheel component
   - App block for theme editor

3. **Advanced Analytics**
   - Conversion tracking
   - Revenue attribution
   - Email campaign metrics

4. **Fraud Prevention**
   - IP tracking
   - Browser fingerprinting
   - reCAPTCHA integration

5. **Additional Features**
   - Wheel customization (colors, fonts)
   - A/B testing
   - Email template editor
   - Webhook support

## 📞 Support

For issues or questions, check the database logs:
```bash
npx prisma studio  # Visual database explorer
npm run dev        # Start with debug logging
```

## 📝 License

MIT License
