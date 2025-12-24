# NestJS Billing Module

Billing module for applying coupon discounts to subscriptions. Built with NestJS following QuestionPro's backend stack rules.

## Quick Start

```bash
npm install
npm run start:seed   # first time, seeds test data
npm run start:dev    # regular dev mode
```

Need MySQL running locally. Create the database first:
```bash
mysql -u root -e "CREATE DATABASE billing;"
```

Or just use Docker:
```bash
docker-compose up -d
```

App runs on http://localhost:3000

## Project Structure

```
src/
├── modules/
│   ├── billing/
│   │   ├── application/     # controllers, services, dtos, utils
│   │   └── domain/          # entities, repositories
│   └── health/
├── database/
│   └── seeds/               # seed data for testing
├── common/                  # shared stuff (error handling, response service)
└── config/
```

## API

### POST /billing/apply-discount

Apply a coupon to get discounted price.

```bash
curl -X POST http://localhost:3000/billing/apply-discount \
  -H "Content-Type: application/json" \
  -d '{
    "user": {"id": "1", "assignedCouponCodes": ["SAVE10"]},
    "coupon": {"code": "SAVE10", "discountAmount": 10, "expiryDate": "2099-12-31"},
    "originalSubscriptionPrice": 100
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "finalPrice": 90,
    "originalPrice": 100,
    "discountApplied": 10,
    "couponCode": "SAVE10"
  }
}
```

### GET /health

Health check endpoint. Returns DB status.

### GET /metrics

Prometheus metrics.

## Test Data

Run `npm run start:seed` to get some test data:

**Users:** john@example.com (id: 1), jane@example.com (id: 2), bob@example.com (id: 3)

**Coupons:**
- SAVE10, SAVE20, SUMMER50 - valid coupons
- EXPIRED10 - expired coupon for testing
- MAXUSED - coupon with no uses left
- THIRDPARTY25 - third-party validated coupon

John has most coupons assigned for testing different scenarios.

## Environment Variables

Copy `.env.example` to `.env` and update as needed:

```
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_DATABASE=billing
SEED_DATA=false
```

## Testing

```bash
npm run test:e2e
```

## Docker

```bash
docker-compose up -d      # start
docker-compose down       # stop
docker-compose down -v    # stop and wipe data
docker-compose logs -f    # logs
```
