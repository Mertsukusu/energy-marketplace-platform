# Energy Contract Marketplace

A production-ready full-stack energy contract trading platform built with FastAPI (Python) and Next.js (React/TypeScript).

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Frontend Structure](#frontend-structure)
- [Testing](#testing)
- [Deployment](#deployment)
- [Design Decisions](#design-decisions)

---

## Overview

This marketplace allows energy traders to:
- Browse available energy supply contracts (Solar, Wind, Nuclear, Hydro, Natural Gas, Coal)
- Filter contracts by multiple criteria
- Build a portfolio of contracts
- View portfolio metrics and energy mix visualization

---

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Docker Compose                          │
├─────────────────┬─────────────────────┬─────────────────────────┤
│                 │                     │                         │
│   Frontend      │     Backend         │      Database           │
│   (Next.js)     │     (FastAPI)       │      (PostgreSQL)       │
│   Port: 3000    │     Port: 8000      │      Port: 5432         │
│                 │                     │                         │
│  ┌───────────┐  │  ┌───────────────┐  │  ┌─────────────────┐    │
│  │ Dashboard │  │  │ /health       │  │  │ contracts       │    │
│  │ Contracts │──┼──│ /contracts    │──┼──│ portfolio_items │    │
│  │ Portfolio │  │  │ /portfolio    │  │  └─────────────────┘    │
│  └───────────┘  │  └───────────────┘  │                         │
│                 │                     │                         │
└─────────────────┴─────────────────────┴─────────────────────────┘
```

### Request Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Browser │────▶│ Next.js  │────▶│ FastAPI  │────▶│ Service  │────▶│ Postgres │
│          │     │ Frontend │     │  Routes  │     │  Layer   │     │    DB    │
└──────────┘     └──────────┘     └──────────┘     └──────────┘     └──────────┘
                      │                │                │
                      │           Pydantic          SQLAlchemy
                      │           Validation       ORM Models
                      │                │                │
                 React Hooks      HTTP Status      Async Queries
                 + API Client     Codes (201,     with Filtering
                                  404, 409)
```

### Backend Architecture

```
backend/
├── app/
│   ├── main.py                 # FastAPI app factory, CORS, routers
│   ├── api/
│   │   ├── routes_contracts.py # CRUD + filtering endpoints
│   │   └── routes_portfolio.py # Portfolio management endpoints
│   ├── core/
│   │   ├── config.py           # Pydantic Settings (env vars)
│   │   └── db.py               # SQLAlchemy async engine, session
│   ├── models/
│   │   ├── contract.py         # Contract SQLAlchemy model
│   │   └── portfolio.py        # PortfolioItem model with FK
│   ├── schemas/
│   │   ├── contract.py         # Pydantic request/response schemas
│   │   └── portfolio.py        # Portfolio schemas with metrics
│   ├── services/
│   │   ├── contract_service.py # Business logic for contracts
│   │   └── portfolio_service.py# Portfolio logic + metrics calc
│   └── seed.py                 # Database seeding script
├── alembic/                    # Database migrations
├── tests/                      # Pytest unit tests
├── Dockerfile
└── pyproject.toml              # Dependencies
```

### Frontend Architecture

```
frontend/
├── app/
│   ├── layout.tsx              # Root layout with navigation
│   ├── page.tsx                # Redirect to /dashboard
│   ├── dashboard/
│   │   └── page.tsx            # Dashboard with stats & charts
│   ├── contracts/
│   │   └── page.tsx            # Contract listing with filters
│   ├── portfolio/
│   │   └── page.tsx            # Portfolio management
│   ├── components/
│   │   ├── ContractCard.tsx    # Contract display card
│   │   ├── FilterPanel.tsx     # Multi-criteria filter UI
│   │   ├── MetricsCard.tsx     # Portfolio metrics display
│   │   ├── PieChart.tsx        # Energy mix visualization
│   │   └── Toast.tsx           # Notification system
│   └── lib/
│       ├── api.ts              # Typed API client (fetch)
│       └── types.ts            # TypeScript interfaces
├── Dockerfile
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

---

## Features

### Contract Management
- **CRUD Operations**: Create, read, update, delete contracts
- **Multi-criteria Filtering**: Energy type, price range, quantity, location, delivery dates
- **Sorting**: By price, quantity, or delivery date (asc/desc)
- **Pagination**: Configurable limit/offset

### Portfolio Builder
- **Add/Remove Contracts**: Only "Available" contracts can be added
- **Status Transitions**: Available → Reserved (on add) → Available (on remove)
- **Real-time Metrics**:
  - Total contracts count
  - Total capacity (MWh)
  - Total cost (USD)
  - Weighted average price per MWh
  - Breakdown by energy type

### Dashboard
- Portfolio overview with key metrics
- Marketplace statistics
- Energy mix bar chart
- Recent activity feed

### UI/UX
- Responsive design (mobile-friendly)
- Toast notifications for actions
- Loading states and error handling
- Visual feedback for added contracts

---

## Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| **Backend** | FastAPI | 0.109+ |
| | SQLAlchemy | 2.0+ (async) |
| | Alembic | 1.13+ |
| | Pydantic | 2.5+ |
| | PostgreSQL | 15 |
| | Python | 3.11+ |
| **Frontend** | Next.js | 14.1 |
| | React | 18.2 |
| | TypeScript | 5.3 |
| | Tailwind CSS | 3.4 |
| **Infrastructure** | Docker Compose | 2.0+ |
| | GitHub Actions | CI/CD |

---

## Getting Started

### Prerequisites

- Docker Desktop (includes Docker Compose)
- Git

### Quick Start (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd energy-marketplace-platform

# Start all services
docker compose up --build

# Wait for services to be ready (~30 seconds)
# Backend runs migrations and seeds data automatically
```

**Access the application:**

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | Web application |
| API Docs | http://localhost:8000/docs | Swagger UI |
| Health Check | http://localhost:8000/health | API status |

### Local Development (Without Docker)

#### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or: venv\Scripts\activate  # Windows

# Install dependencies
pip install -e ".[dev]"

# Start PostgreSQL (required)
# Option 1: Use Docker
docker run -d --name postgres -p 5432:5432 \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=energy_marketplace \
  postgres:15-alpine

# Run migrations
alembic upgrade head

# Seed database
python -m app.seed

# Start development server
uvicorn app.main:app --reload --port 8000
```

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Start development server
npm run dev
```

### Environment Variables

#### Backend (`backend/.env`)

```env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/energy_marketplace
CORS_ORIGINS=["http://localhost:3000"]
DEBUG=false
```

#### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## API Documentation

### Endpoints Overview

| Method | Endpoint | Description | Status Codes |
|--------|----------|-------------|--------------|
| GET | `/health` | Health check | 200 |
| **Contracts** |
| POST | `/contracts` | Create contract | 201, 422 |
| GET | `/contracts` | List with filters | 200 |
| GET | `/contracts/{id}` | Get by ID | 200, 404 |
| PUT | `/contracts/{id}` | Update contract | 200, 404, 422 |
| DELETE | `/contracts/{id}` | Delete contract | 204, 404, 409 |
| **Portfolio** |
| GET | `/portfolio` | Get portfolio + metrics | 200 |
| POST | `/portfolio/items` | Add contract | 201, 404, 409 |
| DELETE | `/portfolio/items/{id}` | Remove contract | 204, 404 |

### Filter Parameters

```
GET /contracts?energy_type=Solar&energy_type=Wind&price_min=30&price_max=50&qty_min=100&location=Texas&delivery_start_min=2026-01-01&delivery_end_max=2026-12-31&status=Available&limit=20&offset=0&sort_by=price_per_mwh&sort_dir=asc
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `energy_type` | string[] | Filter by energy types (repeatable) |
| `price_min` | decimal | Minimum price per MWh |
| `price_max` | decimal | Maximum price per MWh |
| `qty_min` | decimal | Minimum quantity (MWh) |
| `qty_max` | decimal | Maximum quantity (MWh) |
| `location` | string | Location (partial match) |
| `delivery_start_min` | date | Earliest delivery start |
| `delivery_end_max` | date | Latest delivery end |
| `status` | string | Contract status (default: Available) |
| `limit` | int | Results per page (1-100, default: 20) |
| `offset` | int | Pagination offset (default: 0) |
| `sort_by` | string | Sort field: `price_per_mwh`, `quantity_mwh`, `delivery_start`, `id` |
| `sort_dir` | string | Sort direction: `asc`, `desc` |

### Response Examples

#### Contract Object

```json
{
  "id": 1,
  "energy_type": "Solar",
  "quantity_mwh": "500.00",
  "price_per_mwh": "45.50",
  "delivery_start": "2026-03-01",
  "delivery_end": "2026-05-31",
  "location": "California",
  "status": "Available",
  "created_at": "2026-02-06T19:43:43.168117",
  "updated_at": "2026-02-06T19:43:43.168119"
}
```

#### Portfolio Response

```json
{
  "items": [
    {
      "id": 1,
      "contract_id": 1,
      "added_at": "2026-02-06T20:00:00.000000",
      "contract": { /* Contract object */ }
    }
  ],
  "metrics": {
    "total_contracts": 2,
    "total_capacity_mwh": "1700.00",
    "total_cost": "69475.00",
    "weighted_avg_price_per_mwh": "40.87",
    "breakdown_by_energy_type": [
      {
        "energy_type": "Solar",
        "count": 1,
        "total_mwh": "500.00",
        "total_cost": "22750.00"
      }
    ]
  }
}
```

---

## Database Schema

### Entity Relationship Diagram

```
┌─────────────────────────────────────┐
│             contracts               │
├─────────────────────────────────────┤
│ id              SERIAL PRIMARY KEY  │
│ energy_type     VARCHAR(50) NOT NULL│
│ quantity_mwh    NUMERIC(12,2)       │
│ price_per_mwh   NUMERIC(10,2)       │
│ delivery_start  DATE NOT NULL       │
│ delivery_end    DATE NOT NULL       │
│ location        VARCHAR(100)        │
│ status          ENUM (Available,    │
│                       Reserved,     │
│                       Sold)         │
│ created_at      TIMESTAMP           │
│ updated_at      TIMESTAMP           │
├─────────────────────────────────────┤
│ INDEXES:                            │
│  - ix_contracts_energy_type         │
│  - ix_contracts_location            │
│  - ix_contracts_delivery_start      │
│  - ix_contracts_status              │
└─────────────────────────────────────┘
              │
              │ FK (contract_id)
              │ ON DELETE RESTRICT
              ▼
┌─────────────────────────────────────┐
│          portfolio_items            │
├─────────────────────────────────────┤
│ id              SERIAL PRIMARY KEY  │
│ contract_id     INTEGER UNIQUE      │
│ added_at        TIMESTAMP           │
└─────────────────────────────────────┘
```

### Migrations

```bash
cd backend

# Apply all migrations
alembic upgrade head

# Create new migration
alembic revision --autogenerate -m "description"

# Rollback one migration
alembic downgrade -1
```

---

## Frontend Structure

### Pages

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `page.tsx` | Redirects to `/dashboard` |
| `/dashboard` | `dashboard/page.tsx` | Portfolio overview + market stats |
| `/contracts` | `contracts/page.tsx` | Contract listing with filters |
| `/portfolio` | `portfolio/page.tsx` | Portfolio management |

### Components

| Component | Purpose |
|-----------|---------|
| `ContractCard` | Displays contract details with add/remove actions |
| `FilterPanel` | Multi-criteria filter form |
| `MetricsCard` | Portfolio metrics summary |
| `PieChart` | Energy mix visualization (SVG) |
| `Toast` | Notification system |

### State Management

- **React Hooks**: `useState`, `useEffect`, `useCallback`
- **No external state library**: Simple prop drilling for this scope
- **API Client**: Typed fetch wrapper in `lib/api.ts`

---

## Testing

### Backend Tests (10 tests)

```bash
cd backend
pytest -v
```

#### Test Coverage

| Test File | Tests | Description |
|-----------|-------|-------------|
| `test_contracts.py` | 5 | Contract CRUD and filtering |
| `test_portfolio.py` | 5 | Portfolio operations and metrics |

#### Test Cases

**Contract Tests:**
1. `test_create_contract_valid` - Valid contract creation (201)
2. `test_create_contract_invalid_dates` - Date validation (422)
3. `test_filter_by_energy_type_and_price` - Combined filters
4. `test_filter_multiple_energy_types` - Multi-select energy type
5. `test_contract_not_found` - 404 handling

**Portfolio Tests:**
1. `test_add_to_portfolio` - Add contract, verify Reserved status
2. `test_cannot_add_reserved_contract` - Conflict handling (409)
3. `test_portfolio_metrics_weighted_avg` - Weighted average calculation
4. `test_remove_from_portfolio` - Remove and verify Available status
5. `test_cannot_delete_contract_in_portfolio` - Delete protection (409)

### Frontend Checks

```bash
cd frontend

# Linting
npm run lint

# Type checking
npm run typecheck

# Production build
npm run build
```

### CI Pipeline

GitHub Actions runs on every PR and push to `main`:

```yaml
Jobs:
  backend:
    - Setup Python 3.11
    - Install dependencies
    - Run ruff check (linting)
    - Run ruff format --check
    - Run pytest

  frontend:
    - Setup Node 20
    - npm ci
    - npm run lint
    - npm run typecheck
    - npm run build

  docker:
    - Build backend image
    - Build frontend image
```

---

## Deployment

### Docker Compose (Production-like)

```bash
# Build and start all services
docker compose up --build -d

# View logs
docker compose logs -f

# Stop services
docker compose down

# Reset database (removes volume)
docker compose down -v
```

### Services

| Service | Image | Port | Depends On |
|---------|-------|------|------------|
| `db` | postgres:15-alpine | 5432 | - |
| `backend` | Custom (Python 3.11) | 8000 | db (healthy) |
| `frontend` | Custom (Node 20) | 3000 | backend |

### Health Checks

- **PostgreSQL**: `pg_isready` every 5 seconds
- **Backend**: Waits for DB, runs migrations, seeds data
- **Frontend**: Waits for backend to start

---

## Design Decisions

### 1. Contract Deletion Protection

**Decision**: Reject deletion if contract is in portfolio (409 Conflict)

**Rationale**: Safer than cascade delete; prevents accidental data loss

**Alternative**: Could cascade delete portfolio item, but requires explicit user action

### 2. Status Transitions

```
Available ──(add to portfolio)──▶ Reserved
    ▲                                │
    └────(remove from portfolio)─────┘
```

**Rationale**: Prevents double-booking; clear ownership model

### 3. Single User Portfolio

**Decision**: No authentication; single implicit user

**Rationale**: Simplifies MVP; extensible via `user_id` FK

**Extension Point**: Add `user_id` to `portfolio_items` table

### 4. Weighted Average Price

**Formula**: `sum(quantity × price) / sum(quantity)`

**Example**:
- Contract A: 100 MWh × $50 = $5,000
- Contract B: 200 MWh × $40 = $8,000
- Weighted Avg: $13,000 / 300 MWh = **$43.33/MWh**

### 5. Filter Logic

- **Between filters**: AND logic
- **Within energy_type**: OR logic

**Example**: `energy_type=Solar&energy_type=Wind&price_max=50`
→ (Solar OR Wind) AND price ≤ 50

### 6. Decimal Precision

- **quantity_mwh**: NUMERIC(12,2) - up to 9,999,999,999.99 MWh
- **price_per_mwh**: NUMERIC(10,2) - up to 99,999,999.99 $/MWh

---

## Known Limitations

- Single user portfolio (no authentication)
- No real-time updates (requires page refresh)
- No contract comparison feature
- No export functionality (CSV/PDF)
- No price history or trends

## Future Improvements

- [ ] JWT authentication with user management
- [ ] WebSocket for real-time updates
- [ ] Contract comparison (side-by-side)
- [ ] Export portfolio to CSV/PDF
- [ ] Price history charts
- [ ] Email notifications
- [ ] Admin dashboard

---

## License

MIT License - See LICENSE file for details.
