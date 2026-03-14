# 🚀 GrowIQ Backend API

> All-in-One Digital Marketing Business Platform

## Quick Start

### Prerequisites
- Node.js 20+ (`node --version`)
- PostgreSQL (local or cloud free tier)
- Redis (optional — works without it)

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Create environment file
copy .env.example .env

# 3. Start development server
npm run dev
```

### Available Scripts

| Command | Description |
|---------|------------|
| `npm run dev` | Start dev server with hot reload (nodemon) |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm test` | Run tests |

### API Endpoints

Base URL: `http://localhost:5000/api/v1`

| Method | Endpoint | Description | Sprint |
|--------|----------|-------------|--------|
| GET | `/health` | Health check | 1 ✅ |
| GET | `/api/v1` | API info | 1 ✅ |
| POST | `/api/v1/auth/register` | Register agency | 2 |
| POST | `/api/v1/auth/login` | Login | 2 |
| GET | `/api/v1/clients` | List clients | 3 |
| POST | `/api/v1/clients` | Create client | 3 |
| GET | `/api/v1/campaigns` | List campaigns | 5-6 |
| GET | `/api/v1/insights/:clientId` | AI insights | 9 |
| GET | `/api/v1/invoices` | List invoices | 11 |
| GET | `/api/v1/reports/:clientId` | List reports | 12 |
| GET | `/api/v1/seo/:clientId/keywords` | SEO keywords | 13 |
| GET | `/api/v1/analytics/revenue` | Revenue analytics | 15 |

### Project Structure

```
growiq-backend/
├── src/
│   ├── config/          # Database, Redis, env config
│   ├── middleware/       # Auth, rate limit, validation, errors
│   ├── routes/           # Express route definitions
│   ├── controllers/      # Request handlers (Sprint 2+)
│   ├── services/         # Business logic layer
│   ├── integrations/     # External API modules (Meta, Google, etc.)
│   ├── jobs/             # Cron jobs (sync, AI, reports)
│   ├── mocks/            # Mock data for free development
│   ├── utils/            # Logger, file storage, prompts
│   ├── app.js            # Express app setup
│   └── server.js         # Server entry point
├── uploads/              # Local file storage (replaces S3)
├── logs/                 # Application logs
├── tests/                # Test files
├── .env.example          # Environment template
└── package.json
```

### Environment Toggle

All paid services have free alternatives toggled via `.env`:

```
AI_SERVICE_MODE=mock      # 'mock' = free, 'live' = Claude API
USE_MOCK_APIS=true        # true = sample data, false = real APIs
USE_S3=false              # false = local files, true = AWS S3
EMAIL_SERVICE=ethereal    # 'ethereal' = free fake inbox
RAZORPAY_MODE=test        # 'test' = free test mode
WHATSAPP_MODE=mock        # 'mock' = console.log only
```
