# NestJS Billing Module

NestJS application implementing a billing module with coupon discount functionality.

## Overview

This project implements a billing system that applies coupon discounts to subscription prices, following QuestionPro's Backend (NestJS) Rules.

### Features

- Defensive programming with validation
- Modular architecture
- Global exception handling with error logging
- Health checks and Prometheus metrics
- Unit and e2e tests
- CI/CD pipeline configuration

## Architecture

### Directory Structure

```
src/
├── modules/
│   └── billing/
│       ├── application/
│       │   ├── controllers/
│       │   │   └── BillingController.ts
│       │   ├── services/
│       │   │   ├── PricingService.ts
│       │   │   └── __tests__/
│       │   │       └── PricingService.spec.ts
│       │   └── dtos/
│       │       ├── UserDto.ts
│       │       ├── CouponDto.ts
│       │       └── ApplyDiscountDto.ts
│       └── BillingModule.ts
├── common/
│   ├── entities/
│   │   └── ErrorLogEntity.ts
│   ├── services/
│   │   ├── ErrorLogService.ts
│   │   └── ResponseService.ts
│   ├── filters/
│   │   └── AllExceptionsFilter.ts
│   └── exceptions/
│       └── ValidationException.ts
├── config/
│   ├── VendorConfig.ts
│   └── DatabaseConfig.ts
├── health/
│   └── HealthController.ts
├── tests/
│   └── billing/
│       └── BillingController.e2e.ts
├── AppModule.ts
└── main.ts
```

## Getting Started

### Prerequisites

- Node.js 18+
- MySQL 8.0

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd nestjs-assignment-1
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment**

```bash
cp .env.example .env
# Edit .env with your MySQL credentials
```

4. **Create database**

```bash
mysql -u root -e "CREATE DATABASE IF NOT EXISTS billing;"
```

5. **Start the application**

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | `development` |
| `PORT` | Application port | `3000` |
| `DB_HOST` | MySQL host | `localhost` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_USERNAME` | Database username | `root` |
| `DB_PASSWORD` | Database password | `password` |
| `DB_DATABASE` | Database name | `billing` |
| `DB_SYNCHRONIZE` | Auto-sync schema (dev only) | `true` |
| `DB_LOGGING` | Enable query logging | `true` |
| `VENDOR_API_URL` | Third-party vendor API URL | `https://vendor.example.com` |
| `VENDOR_TIMEOUT_MS` | Vendor API timeout | `5000` |
| `VENDOR_VERIFY_PATH` | Vendor verify endpoint | `/api/verify` |

## API Documentation

### Postman Collection

Import `Billing-API.postman_collection.json` into Postman to test all endpoints.

**Included requests:**
- Valid coupon discount
- Coupon not assigned to user
- Expired coupon
- Large discount (no negative price)
- Validation errors
- Invalid discount amount
- Case-insensitive coupon codes
- Health check
- Prometheus metrics

### Apply Discount

**POST** `/billing/apply-discount`

Applies a coupon discount to a subscription price.

**Request Body:**

```json
{
  "user": {
    "id": "user123",
    "assignedCouponCodes": ["SAVE10", "SUMMER20"]
  },
  "coupon": {
    "code": "SAVE10",
    "discountAmount": 10,
    "expiryDate": "2099-12-31",
    "isThirdParty": false
  },
  "originalSubscriptionPrice": 100
}
```

**Response:**

```json
{
  "finalPrice": 90
}
```

**Business Logic:**

1. Validates coupon structure and values
2. Checks if coupon is assigned to user
3. Verifies coupon expiry date
4. For third-party coupons, validates with external API
5. Calculates final price (never negative)

### Health Check

**GET** `/health`

Returns application health status including database and vendor API connectivity.

**Response:**

```json
{
  "status": "ok",
  "info": {
    "database": {
      "status": "up"
    },
    "vendor-api": {
      "status": "up"
    }
  }
}
```

### Metrics

**GET** `/metrics`

Returns Prometheus-compatible metrics for monitoring.

## Testing

### Unit Tests

```bash
# Run all unit tests
npm test

# Run with coverage
npm run test:cov

# Watch mode
npm run test:watch
```

### E2E Tests

```bash
# Run e2e tests
npm run test:e2e

# Run with coverage
npm run test:e2e:ci
```

### CI/CD Scripts

```bash
# Format check
npm run format:ci

# Lint check
npm run lint:ci

# All CI checks
npm run test:ci
npm run test:e2e:ci
```

## Code Quality

### Formatting

```bash
# Format code
npm run format

# Check formatting
npm run format:ci
```

### Linting

```bash
# Lint code
npm run lint

# Lint check (CI)
npm run lint:ci
```

## Backend Rules Compliance

This project follows QuestionPro Backend (NestJS) Rules:

**Module Structure**
- Organized under `src/modules/billing/`
- Separated `application/` and `domain/` layers

**Naming Conventions**
- PascalCase for files
- Services suffixed with `Service`
- DTOs suffixed with `Dto`
- Controllers suffixed with `Controller`

**Dependency Management**
- Constructor injection
- ConfigService for environment variables
- Proper module exports

**Error Handling**
- Global exception filter
- Database error logging
- No redundant try-catch blocks

**Logging**
- NestJS Logger
- Error logging to database

**Testing**
- Unit tests in `__tests__/` directories
- E2E tests in `src/tests/`

**Configuration**
- Config files in `src/config/`
- Environment-based configuration

**Monitoring**
- `/health` endpoint
- `/metrics` endpoint (Prometheus)

## Production Deployment

### Build for Production

```bash
npm run build
npm run start:prod
```

## Monitoring & Observability

### Metrics

Prometheus metrics are exposed at `/metrics`:

- HTTP request duration
- HTTP request count by status
- Database query count
- Memory usage
- CPU usage

### Health Checks

Database connectivity check via `/health` endpoint.

### Logging

- Application logs: `/app/logs/`
- Error logs: `error_logs` table
- Request/response logging

## Troubleshooting

### Common Issues

**Database Connection Error**

```bash
# Check if MySQL is running
mysql -u root -p -e "SELECT 1"
```

**Port Already in Use**

```bash
# Change port in .env
PORT=3001

# Or kill process using port 3000
lsof -ti:3000 | xargs kill -9
```

**Tests Failing**

```bash
# Run tests with verbose output
npm test -- --verbose
```

## License

UNLICENSED
