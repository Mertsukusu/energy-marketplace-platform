# Energy Contract Marketplace

A production-ready full-stack energy contract trading platform built with FastAPI (Python) and Next.js (React/TypeScript).

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [System Design Architecture](#system-design-architecture)
- [Features](#features)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Frontend Structure](#frontend-structure)
- [Testing](#testing)
- [CI/CD Pipeline](#cicd-pipeline)
- [Design Decisions](#design-decisions)

---

## Overview

This marketplace allows energy traders to:
- Browse available energy supply contracts (Solar, Wind, Nuclear, Hydro, Natural Gas, Coal)
- Filter contracts by multiple criteria
- Build a portfolio of contracts
- View portfolio metrics and energy mix visualization

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

## System Design Architecture

### High-Level System Architecture

```mermaid
flowchart TB
    subgraph Client
        Browser[Browser]
    end

    subgraph DockerCompose[Docker Compose]
        subgraph FrontendContainer[Frontend Container :3000]
            NextJS[Next.js 14]
            subgraph Pages
                Dashboard[Dashboard]
                Contracts[Contracts]
                Portfolio[Portfolio]
            end
            APIClient[API Client]
        end

        subgraph BackendContainer[Backend Container :8000]
            FastAPI[FastAPI Server]
            subgraph Routes
                HealthRoute[/health]
                ContractsRoute[/contracts]
                PortfolioRoute[/portfolio]
            end
            subgraph Services
                ContractService[contract_service]
                PortfolioService[portfolio_service]
            end
            subgraph Models
                ContractModel[Contract Model]
                PortfolioModel[PortfolioItem Model]
            end
        end

        subgraph DatabaseContainer[Database Container :5432]
            PostgreSQL[(PostgreSQL 15)]
            ContractsTable[contracts table]
            PortfolioTable[portfolio_items table]
        end
    end

    Browser -->|HTTP :3000| NextJS
    Dashboard --> APIClient
    Contracts --> APIClient
    Portfolio --> APIClient
    APIClient -->|HTTP :8000| FastAPI
    FastAPI --> Routes
    Routes --> Services
    Services --> Models
    Models -->|SQL| PostgreSQL
    PostgreSQL --> ContractsTable
    PostgreSQL --> PortfolioTable
```

### Request Flow - Add to Portfolio

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as FastAPI
    participant S as Service Layer
    participant D as PostgreSQL

    U->>F: Click "Add to Portfolio"
    F->>A: POST /portfolio/items<br/>{ contract_id: 1 }
    A->>A: Pydantic Validation
    A->>S: add_to_portfolio(contract_id)
    S->>D: SELECT * FROM contracts WHERE id=1
    D-->>S: Contract { status: Available }
    S->>S: Check: Is Available?
    S->>D: UPDATE contracts SET status='Reserved'
    S->>D: INSERT INTO portfolio_items
    D-->>S: OK
    S-->>A: PortfolioItem created
    A-->>F: 201 Created
    F->>F: Show Toast "Added!"
    F->>F: Update UI State
    F-->>U: Card shows "✓ Added"
```

### Data Flow Architecture

```mermaid
flowchart LR
    subgraph Frontend[Frontend Layer]
        subgraph State[React State]
            Filters[filters state]
            ContractsData[contracts state]
            PortfolioData[portfolio state]
        end
        subgraph Client[API Client]
            GetContracts[getContracts]
            GetPortfolio[getPortfolio]
            AddToPortfolio[addToPortfolio]
            RemoveFromPortfolio[removeFromPortfolio]
        end
    end

    subgraph Backend[Backend Layer]
        subgraph API[API Routes]
            ContractsAPI[routes_contracts.py]
            PortfolioAPI[routes_portfolio.py]
        end
        subgraph ServiceLayer[Service Layer]
            ContractSvc[contract_service.py]
            PortfolioSvc[portfolio_service.py]
        end
        subgraph ORM[SQLAlchemy Models]
            Contract[Contract]
            PortfolioItem[PortfolioItem]
        end
    end

    subgraph Database[Database Layer]
        PG[(PostgreSQL)]
    end

    Filters -->|trigger| GetContracts
    GetContracts -->|HTTP| ContractsAPI
    ContractsAPI --> ContractSvc
    ContractSvc --> Contract
    Contract -->|SQL| PG

    GetPortfolio -->|HTTP| PortfolioAPI
    PortfolioAPI --> PortfolioSvc
    PortfolioSvc --> PortfolioItem
    PortfolioItem -->|SQL| PG

    PG -->|results| ContractsData
    PG -->|results| PortfolioData
```

### Component Architecture

```mermaid
flowchart TB
    subgraph RootLayout[RootLayout]
        Nav[Navigation]
        Toast[ToastContainer]
    end

    RootLayout --> DashboardPage
    RootLayout --> ContractsPage
    RootLayout --> PortfolioPage

    subgraph DashboardPage[Dashboard Page]
        DMetrics[MetricsCard]
        DEnergyMix[EnergyMix Bar]
        DRecent[Recent Activity]
        DMarketStats[Market Stats]
    end

    subgraph ContractsPage[Contracts Page]
        FilterPanel[FilterPanel]
        ContractsList[ContractCard List]
        Pagination[Pagination]
    end

    subgraph PortfolioPage[Portfolio Page]
        PMetrics[MetricsCard]
        PPieChart[PieChart]
        PContractsList[ContractCard List]
    end

    FilterPanel -->|filters| ContractsList
    ContractsList -->|add action| Toast
    PContractsList -->|remove action| Toast
```

### Database Schema

```mermaid
erDiagram
    contracts {
        int id PK
        varchar energy_type
        numeric quantity_mwh
        numeric price_per_mwh
        date delivery_start
        date delivery_end
        varchar location
        enum status
        timestamp created_at
        timestamp updated_at
    }

    portfolio_items {
        int id PK
        int contract_id FK
        timestamp added_at
    }

    portfolio_items ||--o| contracts : "references"
```

### CI/CD Pipeline

```mermaid
flowchart TB
    subgraph Trigger[Trigger]
        Push[Push to main]
        PR[Pull Request]
    end

    Push --> Pipeline
    PR --> Pipeline

    subgraph Pipeline[GitHub Actions]
        subgraph BackendJob[Backend Job]
            B1[Checkout]
            B2[Setup Python 3.11]
            B3[Install deps]
            B4[ruff check - Lint]
            B5[ruff format - Format]
            B6[pytest - 10 Tests]
            B1 --> B2 --> B3 --> B4 --> B5 --> B6
        end

        subgraph FrontendJob[Frontend Job]
            F1[Checkout]
            F2[Setup Node 20]
            F3[npm ci]
            F4[ESLint - Lint]
            F5[tsc - Typecheck]
            F6[next build - Build]
            F1 --> F2 --> F3 --> F4 --> F5 --> F6
        end

        subgraph DockerJob[Docker Job]
            D1[Checkout]
            D2[Build Backend Image]
            D3[Build Frontend Image]
            D1 --> D2 --> D3
        end
    end

    BackendJob --> DockerJob
    FrontendJob --> DockerJob

    DockerJob --> Success[✓ Success]
```

### Status Transition Flow

```mermaid
stateDiagram-v2
    [*] --> Available: Contract Created
    Available --> Reserved: Add to Portfolio
    Reserved --> Available: Remove from Portfolio
    Available --> Sold: Mark as Sold
    Reserved --> Sold: Complete Purchase
    Sold --> [*]
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

---

## Design Decisions

### 1. Contract Deletion Protection

**Decision**: Reject deletion if contract is in portfolio (409 Conflict)

**Rationale**: Safer than cascade delete; prevents accidental data loss

### 2. Status Transitions

**Flow**: `Available → Reserved (on add) → Available (on remove)`

### 3. Single User Portfolio

**Decision**: No authentication; single implicit user

**Extension Point**: Add `user_id` to `portfolio_items` table

### 4. Weighted Average Price

**Formula**: `sum(quantity × price) / sum(quantity)`

### 5. Filter Logic

- **Between filters**: AND logic
- **Within energy_type**: OR logic

---

## Known Limitations

- Single user portfolio (no authentication)
- No real-time updates (requires page refresh)
- No contract comparison feature
- No export functionality (CSV/PDF)

## Future Improvements

- [ ] JWT authentication with user management
- [ ] WebSocket for real-time updates
- [ ] Contract comparison (side-by-side)
- [ ] Export portfolio to CSV/PDF
- [ ] Price history charts

---

## License

MIT License - See LICENSE file for details.
