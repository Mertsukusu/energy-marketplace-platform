# Energy Contract Marketplace

A production-ready full-stack energy contract trading platform built with FastAPI (Python) and Next.js (React/TypeScript).

## Table of Contents

- [Overview](#overview)
- [System Design Architecture](#system-design-architecture)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
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

## System Design Architecture

### High-Level System Architecture

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                              ENERGY MARKETPLACE                                 │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  ┌─────────────┐      ┌─────────────────────────────────────────────────────┐  │
│  │   Client    │      │                  Docker Compose                     │  │
│  │  (Browser)  │      │  ┌─────────────────────────────────────────────┐   │  │
│  │             │      │  │              Frontend Container              │   │  │
│  │  ┌───────┐  │ HTTP │  │  ┌─────────────────────────────────────┐   │   │  │
│  │  │ React │  │◄────►│  │  │         Next.js 14 (App Router)     │   │   │  │
│  │  │  App  │  │:3000 │  │  │  ┌─────────┐ ┌─────────┐ ┌───────┐  │   │   │  │
│  │  └───────┘  │      │  │  │  │Dashboard│ │Contracts│ │Portfol│  │   │   │  │
│  └─────────────┘      │  │  │  └────┬────┘ └────┬────┘ └───┬───┘  │   │   │  │
│                       │  │  │       │           │          │      │   │   │  │
│                       │  │  │  ┌────▼───────────▼──────────▼───┐  │   │   │  │
│                       │  │  │  │      API Client (lib/api.ts)  │  │   │   │  │
│                       │  │  │  └───────────────┬───────────────┘  │   │   │  │
│                       │  │  └─────────────────┬┼──────────────────┘   │   │  │
│                       │  └────────────────────┼┼──────────────────────┘   │  │
│                       │                       ││                          │  │
│                       │                       ││ HTTP :8000               │  │
│                       │                       ▼▼                          │  │
│                       │  ┌─────────────────────────────────────────────┐  │  │
│                       │  │              Backend Container              │  │  │
│                       │  │  ┌─────────────────────────────────────┐   │  │  │
│                       │  │  │            FastAPI Server           │   │  │  │
│                       │  │  │  ┌─────────────────────────────┐   │   │  │  │
│                       │  │  │  │     API Routes (Endpoints)   │   │   │  │  │
│                       │  │  │  │  /health  /contracts  /port  │   │   │  │  │
│                       │  │  │  └──────────────┬────────────────┘   │   │  │  │
│                       │  │  │                 │                    │   │  │  │
│                       │  │  │  ┌──────────────▼────────────────┐   │   │  │  │
│                       │  │  │  │       Service Layer          │   │   │  │  │
│                       │  │  │  │  contract_service.py         │   │   │  │  │
│                       │  │  │  │  portfolio_service.py        │   │   │  │  │
│                       │  │  │  └──────────────┬────────────────┘   │   │  │  │
│                       │  │  │                 │                    │   │  │  │
│                       │  │  │  ┌──────────────▼────────────────┐   │   │  │  │
│                       │  │  │  │    SQLAlchemy 2.0 (Async)    │   │   │  │  │
│                       │  │  │  │  Models: Contract, Portfolio  │   │   │  │  │
│                       │  │  │  └──────────────┬────────────────┘   │   │  │  │
│                       │  │  └─────────────────┼────────────────────┘   │  │  │
│                       │  └────────────────────┼────────────────────────┘  │  │
│                       │                       │                           │  │
│                       │                       │ TCP :5432                 │  │
│                       │                       ▼                           │  │
│                       │  ┌─────────────────────────────────────────────┐  │  │
│                       │  │            Database Container               │  │  │
│                       │  │  ┌─────────────────────────────────────┐   │  │  │
│                       │  │  │         PostgreSQL 15              │   │  │  │
│                       │  │  │  ┌─────────────┐ ┌───────────────┐  │   │  │  │
│                       │  │  │  │  contracts  │ │portfolio_items│  │   │  │  │
│                       │  │  │  │   (table)   │ │    (table)    │  │   │  │  │
│                       │  │  │  └─────────────┘ └───────────────┘  │   │  │  │
│                       │  │  └─────────────────────────────────────┘   │  │  │
│                       │  └─────────────────────────────────────────────┘  │  │
│                       └───────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────────┘
```

### Request Flow Architecture

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                           REQUEST FLOW DIAGRAM                                │
└──────────────────────────────────────────────────────────────────────────────┘

  User Action                    Frontend                      Backend                       Database
      │                             │                             │                             │
      │  Click "Add to Portfolio"   │                             │                             │
      │────────────────────────────►│                             │                             │
      │                             │                             │                             │
      │                             │  POST /portfolio/items      │                             │
      │                             │  { contract_id: 1 }         │                             │
      │                             │────────────────────────────►│                             │
      │                             │                             │                             │
      │                             │                             │  Pydantic Validation        │
      │                             │                             │  PortfolioItemCreate        │
      │                             │                             │──────────┐                  │
      │                             │                             │          │                  │
      │                             │                             │◄─────────┘                  │
      │                             │                             │                             │
      │                             │                             │  SELECT * FROM contracts    │
      │                             │                             │  WHERE id = 1               │
      │                             │                             │────────────────────────────►│
      │                             │                             │                             │
      │                             │                             │  Contract { status: Avail } │
      │                             │                             │◄────────────────────────────│
      │                             │                             │                             │
      │                             │                             │  Business Logic Check:      │
      │                             │                             │  - Is status "Available"?   │
      │                             │                             │  - Already in portfolio?    │
      │                             │                             │──────────┐                  │
      │                             │                             │          │                  │
      │                             │                             │◄─────────┘                  │
      │                             │                             │                             │
      │                             │                             │  UPDATE contracts           │
      │                             │                             │  SET status = 'Reserved'    │
      │                             │                             │────────────────────────────►│
      │                             │                             │                             │
      │                             │                             │  INSERT INTO portfolio_items│
      │                             │                             │────────────────────────────►│
      │                             │                             │                             │
      │                             │                             │           OK                │
      │                             │                             │◄────────────────────────────│
      │                             │                             │                             │
      │                             │  201 Created                │                             │
      │                             │  { id, contract_id, ... }   │                             │
      │                             │◄────────────────────────────│                             │
      │                             │                             │                             │
      │                             │  Show Toast: "Added!"       │                             │
      │                             │  Update UI State            │                             │
      │                             │──────────┐                  │                             │
      │                             │          │                  │                             │
      │  Toast Notification         │◄─────────┘                  │                             │
      │  Card shows "✓ Added"       │                             │                             │
      │◄────────────────────────────│                             │                             │
      │                             │                             │                             │
```

### Data Flow Architecture

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                            DATA FLOW DIAGRAM                                  │
└──────────────────────────────────────────────────────────────────────────────┘

                              ┌─────────────────┐
                              │   User Input    │
                              │  (Filter Form)  │
                              └────────┬────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND LAYER                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         React State                                  │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │   │
│  │  │   filters    │  │   contracts  │  │   portfolio  │               │   │
│  │  │ {            │  │ {            │  │ {            │               │   │
│  │  │  energy_type │  │  items: []   │  │  items: []   │               │   │
│  │  │  price_min   │  │  total: 0    │  │  metrics: {} │               │   │
│  │  │  price_max   │  │  loading     │  │  loading     │               │   │
│  │  │  location    │  │ }            │  │ }            │               │   │
│  │  │ }            │  │              │  │              │               │   │
│  │  └──────┬───────┘  └──────▲───────┘  └──────▲───────┘               │   │
│  │         │                 │                 │                        │   │
│  │         │    ┌────────────┴─────────────────┴────────────┐          │   │
│  │         │    │              API Client                   │          │   │
│  │         │    │  ┌─────────────────────────────────────┐  │          │   │
│  │         └───►│  │  getContracts(filters)              │  │          │   │
│  │              │  │  getPortfolio()                     │  │          │   │
│  │              │  │  addToPortfolio(id)                 │  │          │   │
│  │              │  │  removeFromPortfolio(id)            │  │          │   │
│  │              │  └─────────────────────────────────────┘  │          │   │
│  │              └────────────────┬──────────────────────────┘          │   │
│  └───────────────────────────────┼──────────────────────────────────────┘   │
└──────────────────────────────────┼──────────────────────────────────────────┘
                                   │
                                   │ HTTP Request
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              BACKEND LAYER                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         API Routes                                   │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐      │   │
│  │  │ routes_contracts│  │ routes_portfolio│  │     /health     │      │   │
│  │  │  POST /         │  │  POST /items    │  │                 │      │   │
│  │  │  GET  /         │  │  DELETE /items  │  │                 │      │   │
│  │  │  GET  /{id}     │  │  GET  /         │  │                 │      │   │
│  │  │  PUT  /{id}     │  │                 │  │                 │      │   │
│  │  │  DELETE /{id}   │  │                 │  │                 │      │   │
│  │  └────────┬────────┘  └────────┬────────┘  └─────────────────┘      │   │
│  │           │                    │                                     │   │
│  │           └──────────┬─────────┘                                     │   │
│  │                      ▼                                               │   │
│  │  ┌─────────────────────────────────────────────────────────────┐    │   │
│  │  │                    Service Layer                             │    │   │
│  │  │  ┌─────────────────────┐  ┌─────────────────────────────┐   │    │   │
│  │  │  │  contract_service   │  │    portfolio_service        │   │    │   │
│  │  │  │  - create_contract  │  │  - add_to_portfolio         │   │    │   │
│  │  │  │  - get_contract     │  │  - remove_from_portfolio    │   │    │   │
│  │  │  │  - update_contract  │  │  - get_portfolio            │   │    │   │
│  │  │  │  - delete_contract  │  │  - calculate_metrics        │   │    │   │
│  │  │  │  - list_contracts   │  │    (weighted_avg, breakdown)│   │    │   │
│  │  │  └─────────────────────┘  └─────────────────────────────┘   │    │   │
│  │  └──────────────────────────────┬──────────────────────────────┘    │   │
│  │                                 │                                    │   │
│  │                                 ▼                                    │   │
│  │  ┌─────────────────────────────────────────────────────────────┐    │   │
│  │  │                    SQLAlchemy Models                         │    │   │
│  │  │  ┌─────────────────────┐  ┌─────────────────────────────┐   │    │   │
│  │  │  │      Contract       │  │      PortfolioItem          │   │    │   │
│  │  │  │  - id               │  │  - id                       │   │    │   │
│  │  │  │  - energy_type      │  │  - contract_id (FK)         │   │    │   │
│  │  │  │  - quantity_mwh     │  │  - added_at                 │   │    │   │
│  │  │  │  - price_per_mwh    │  │  - contract (relationship)  │   │    │   │
│  │  │  │  - delivery_start   │  │                             │   │    │   │
│  │  │  │  - delivery_end     │  │                             │   │    │   │
│  │  │  │  - location         │  │                             │   │    │   │
│  │  │  │  - status           │  │                             │   │    │   │
│  │  │  └─────────────────────┘  └─────────────────────────────┘   │    │   │
│  │  └─────────────────────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                   │
                                   │ SQL Queries
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                             DATABASE LAYER                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         PostgreSQL 15                                │   │
│  │                                                                      │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │                      contracts                               │   │   │
│  │  │  ┌────┬────────────┬────────────┬────────────┬────────────┐ │   │   │
│  │  │  │ id │energy_type │quantity_mwh│price_per_mwh│  status   │ │   │   │
│  │  │  ├────┼────────────┼────────────┼────────────┼────────────┤ │   │   │
│  │  │  │ 1  │ Solar      │ 500.00     │ 45.50      │ Available  │ │   │   │
│  │  │  │ 2  │ Wind       │ 1200.00    │ 38.75      │ Reserved   │ │   │   │
│  │  │  │ 3  │ Nuclear    │ 2000.00    │ 35.00      │ Available  │ │   │   │
│  │  │  └────┴────────────┴────────────┴────────────┴────────────┘ │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │                                                                      │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │                    portfolio_items                           │   │   │
│  │  │  ┌────┬─────────────┬─────────────────────────┐             │   │   │
│  │  │  │ id │ contract_id │        added_at         │             │   │   │
│  │  │  ├────┼─────────────┼─────────────────────────┤             │   │   │
│  │  │  │ 1  │      2      │ 2026-02-06 20:00:00     │             │   │   │
│  │  │  └────┴─────────────┴─────────────────────────┘             │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Component Architecture

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND COMPONENT TREE                               │
└──────────────────────────────────────────────────────────────────────────────┘

                              RootLayout
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
                    ▼             ▼             ▼
              DashboardPage  ContractsPage  PortfolioPage
                    │             │             │
        ┌───────────┼───────┐    │    ┌────────┼────────┐
        │           │       │    │    │        │        │
        ▼           ▼       ▼    │    ▼        ▼        ▼
   MetricsCard  EnergyMix  Recent│  MetricsCard PieChart ContractCard[]
   (Portfolio)  (BarChart) Activity    │                    │
        │           │       │    │    │                    │
        └───────────┼───────┘    │    └────────┬───────────┘
                    │            │             │
                    │            │             │
                    │    ┌───────┴───────┐     │
                    │    │               │     │
                    │    ▼               ▼     │
                    │  FilterPanel  ContractCard[]
                    │    │               │     │
                    │    │    ┌──────────┘     │
                    │    │    │                │
                    │    ▼    ▼                │
                    │  Toast Notifications     │
                    │    (Global)              │
                    └──────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                              COMPONENT DETAILS                                │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ContractCard                    FilterPanel                                 │
│  ┌────────────────────┐         ┌────────────────────┐                      │
│  │ ┌──────┐ ┌───────┐ │         │ Energy Type        │                      │
│  │ │Solar │ │Availab│ │         │ [Solar][Wind][Gas] │                      │
│  │ └──────┘ └───────┘ │         │                    │                      │
│  │                    │         │ Price Range        │                      │
│  │ Quantity: 500 MWh  │         │ [Min] - [Max]      │                      │
│  │ Price: $45.50/MWh  │         │                    │                      │
│  │ Total: $22,750     │         │ Quantity Range     │                      │
│  │ Location: CA       │         │ [Min] - [Max]      │                      │
│  │ Delivery: 03/01-05 │         │                    │                      │
│  │                    │         │ Location           │                      │
│  │ [Add to Portfolio] │         │ [Dropdown ▼]       │                      │
│  └────────────────────┘         │                    │                      │
│                                 │ Delivery Dates     │                      │
│  MetricsCard                    │ [Start] - [End]    │                      │
│  ┌────────────────────┐         │                    │                      │
│  │ Total    Total     │         │ ─────────────────  │                      │
│  │ Contracts Capacity │         │ 16 contracts found │                      │
│  │    2      1700 MWh │         └────────────────────┘                      │
│  │                    │                                                      │
│  │ Total    Weighted  │         PieChart                                    │
│  │ Cost     Avg Price │         ┌────────────────────┐                      │
│  │ $69,475  $40.87    │         │    ┌────────┐      │                      │
│  └────────────────────┘         │   /  Solar  \     │                      │
│                                 │  │   40%    │     │                      │
│                                 │  │  Wind    │     │                      │
│                                 │   \  60%   /      │                      │
│                                 │    └────────┘      │                      │
│                                 │ ● Solar  ● Wind   │                      │
│                                 └────────────────────┘                      │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Expected Results

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                            EXPECTED BEHAVIOR                                  │
└──────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ SCENARIO 1: User adds contract to portfolio                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  INPUT:                          OUTPUT:                                    │
│  ───────                         ────────                                   │
│  User clicks "Add to Portfolio"  1. Contract status: Available → Reserved   │
│  on Solar contract (id: 1)       2. Portfolio item created                  │
│                                  3. Toast: "Added Solar contract"           │
│                                  4. Card shows "✓ Added" badge              │
│                                  5. Contract disappears from Available list │
│                                                                             │
│  API Call:                       Response:                                  │
│  POST /portfolio/items           201 Created                                │
│  { "contract_id": 1 }            { "id": 1, "contract_id": 1, ... }        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ SCENARIO 2: User views portfolio metrics                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Portfolio Contents:             Calculated Metrics:                        │
│  ───────────────────             ────────────────────                       │
│  Contract A: 100 MWh × $50       total_contracts: 2                         │
│  Contract B: 200 MWh × $40       total_capacity_mwh: 300                    │
│                                  total_cost: $13,000                        │
│                                  weighted_avg_price: $43.33/MWh             │
│                                                                             │
│  Calculation:                                                               │
│  ────────────                                                               │
│  Total Cost = (100 × 50) + (200 × 40) = 5000 + 8000 = $13,000              │
│  Weighted Avg = 13000 / 300 = $43.33/MWh                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ SCENARIO 3: User filters contracts                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Filter Input:                   Expected Result:                           │
│  ─────────────                   ────────────────                           │
│  energy_type: [Solar, Wind]      Returns contracts where:                   │
│  price_max: 45                   - energy_type IN (Solar, Wind)             │
│  location: Texas                 - price_per_mwh <= 45                      │
│                                  - location ILIKE '%Texas%'                 │
│                                  - status = 'Available'                     │
│                                                                             │
│  API Call:                                                                  │
│  GET /contracts?energy_type=Solar&energy_type=Wind&price_max=45&location=TX │
│                                                                             │
│  Response:                                                                  │
│  { "items": [...], "total": 3, "limit": 20, "offset": 0 }                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ SCENARIO 4: Error handling                                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Action                          Expected Response                          │
│  ──────                          ─────────────────                          │
│  Add Reserved contract           409 Conflict                               │
│                                  "Contract is Reserved, only Available..."  │
│                                                                             │
│  Delete contract in portfolio    409 Conflict                               │
│                                  "Cannot delete contract in portfolio"      │
│                                                                             │
│  Get non-existent contract       404 Not Found                              │
│                                  "Contract not found"                       │
│                                                                             │
│  Invalid date range              422 Unprocessable Entity                   │
│  (end < start)                   "delivery_end must be >= delivery_start"   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
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

## CI/CD Pipeline

### GitHub Actions Setup

The CI pipeline is defined in `.github/workflows/ci.yml` and runs automatically on:
- Every push to `main` branch
- Every pull request to `main` branch

### Pipeline Architecture

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                          GITHUB ACTIONS CI PIPELINE                           │
└──────────────────────────────────────────────────────────────────────────────┘

  ┌─────────────────┐
  │  Push to main   │
  │       or        │
  │  Pull Request   │
  └────────┬────────┘
           │
           ▼
  ┌────────────────────────────────────────────────────────────────────────┐
  │                         PARALLEL EXECUTION                              │
  │  ┌─────────────────────────────┐  ┌─────────────────────────────────┐  │
  │  │      BACKEND JOB            │  │        FRONTEND JOB             │  │
  │  │      (ubuntu-latest)        │  │        (ubuntu-latest)          │  │
  │  │                             │  │                                 │  │
  │  │  ┌───────────────────────┐  │  │  ┌───────────────────────────┐  │  │
  │  │  │ 1. Checkout code      │  │  │  │ 1. Checkout code          │  │  │
  │  │  └───────────┬───────────┘  │  │  └───────────┬───────────────┘  │  │
  │  │              ▼              │  │              ▼                  │  │
  │  │  ┌───────────────────────┐  │  │  ┌───────────────────────────┐  │  │
  │  │  │ 2. Setup Python 3.11  │  │  │  │ 2. Setup Node.js 20       │  │  │
  │  │  └───────────┬───────────┘  │  │  └───────────┬───────────────┘  │  │
  │  │              ▼              │  │              ▼                  │  │
  │  │  ┌───────────────────────┐  │  │  ┌───────────────────────────┐  │  │
  │  │  │ 3. Install deps       │  │  │  │ 3. npm ci (with cache)    │  │  │
  │  │  │    pip install -e .[dev]│  │  │  └───────────┬───────────────┘  │  │
  │  │  └───────────┬───────────┘  │  │              ▼                  │  │
  │  │              ▼              │  │  ┌───────────────────────────┐  │  │
  │  │  ┌───────────────────────┐  │  │  │ 4. Lint (ESLint)          │  │  │
  │  │  │ 4. Lint (ruff check)  │  │  │  │    npm run lint           │  │  │
  │  │  └───────────┬───────────┘  │  │  └───────────┬───────────────┘  │  │
  │  │              ▼              │  │              ▼                  │  │
  │  │  ┌───────────────────────┐  │  │  ┌───────────────────────────┐  │  │
  │  │  │ 5. Format check       │  │  │  │ 5. Type check (tsc)       │  │  │
  │  │  │    ruff format --check│  │  │  │    npm run typecheck      │  │  │
  │  │  └───────────┬───────────┘  │  │  └───────────┬───────────────┘  │  │
  │  │              ▼              │  │              ▼                  │  │
  │  │  ┌───────────────────────┐  │  │  ┌───────────────────────────┐  │  │
  │  │  │ 6. Run tests          │  │  │  │ 6. Build (next build)     │  │  │
  │  │  │    pytest -v          │  │  │  │    npm run build          │  │  │
  │  │  │    (10 tests)         │  │  │  └───────────┬───────────────┘  │  │
  │  │  └───────────┬───────────┘  │  │              │                  │  │
  │  │              │              │  │              │                  │  │
  │  └──────────────┼──────────────┘  └──────────────┼──────────────────┘  │
  │                 │                                │                     │
  └─────────────────┼────────────────────────────────┼─────────────────────┘
                    │                                │
                    └───────────────┬────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │         DOCKER JOB            │
                    │    (needs: backend, frontend) │
                    │                               │
                    │  ┌─────────────────────────┐  │
                    │  │ 1. Checkout code        │  │
                    │  └───────────┬─────────────┘  │
                    │              ▼                │
                    │  ┌─────────────────────────┐  │
                    │  │ 2. Build backend image  │  │
                    │  │    docker build ./backend│  │
                    │  └───────────┬─────────────┘  │
                    │              ▼                │
                    │  ┌─────────────────────────┐  │
                    │  │ 3. Build frontend image │  │
                    │  │    docker build ./frontend│ │
                    │  └─────────────────────────┘  │
                    │                               │
                    └───────────────────────────────┘
                                    │
                                    ▼
                         ┌─────────────────┐
                         │   ✓ SUCCESS     │
                         │   or            │
                         │   ✗ FAILURE     │
                         └─────────────────┘
```

### Pipeline Coverage

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                            CI COVERAGE SUMMARY                                │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  BACKEND COVERAGE                                                            │
│  ────────────────                                                            │
│  ┌────────────────────┬──────────────────────────────────────────────────┐  │
│  │ Check              │ What it validates                                │  │
│  ├────────────────────┼──────────────────────────────────────────────────┤  │
│  │ ruff check         │ Python linting: unused imports, undefined vars,  │  │
│  │                    │ code style issues, potential bugs                │  │
│  ├────────────────────┼──────────────────────────────────────────────────┤  │
│  │ ruff format --check│ Code formatting: consistent indentation,         │  │
│  │                    │ line length, import sorting                      │  │
│  ├────────────────────┼──────────────────────────────────────────────────┤  │
│  │ pytest -v          │ Unit tests (10 tests):                           │  │
│  │                    │ - Contract CRUD operations                       │  │
│  │                    │ - Input validation (dates, required fields)      │  │
│  │                    │ - Filtering logic (combined filters)             │  │
│  │                    │ - Portfolio add/remove operations                │  │
│  │                    │ - Metrics calculation (weighted average)         │  │
│  │                    │ - Error handling (404, 409, 422)                 │  │
│  └────────────────────┴──────────────────────────────────────────────────┘  │
│                                                                              │
│  FRONTEND COVERAGE                                                           │
│  ─────────────────                                                           │
│  ┌────────────────────┬──────────────────────────────────────────────────┐  │
│  │ Check              │ What it validates                                │  │
│  ├────────────────────┼──────────────────────────────────────────────────┤  │
│  │ npm run lint       │ ESLint: React best practices, hooks rules,       │  │
│  │ (next lint)        │ accessibility, import errors                     │  │
│  ├────────────────────┼──────────────────────────────────────────────────┤  │
│  │ npm run typecheck  │ TypeScript: type safety, interface compliance,   │  │
│  │ (tsc --noEmit)     │ null checks, API response types                  │  │
│  ├────────────────────┼──────────────────────────────────────────────────┤  │
│  │ npm run build      │ Production build: compilation, optimization,     │  │
│  │ (next build)       │ static generation, bundle size                   │  │
│  └────────────────────┴──────────────────────────────────────────────────┘  │
│                                                                              │
│  DOCKER COVERAGE                                                             │
│  ───────────────                                                             │
│  ┌────────────────────┬──────────────────────────────────────────────────┐  │
│  │ Check              │ What it validates                                │  │
│  ├────────────────────┼──────────────────────────────────────────────────┤  │
│  │ docker build       │ Dockerfile syntax, dependency installation,      │  │
│  │ ./backend          │ Python package builds, image creation            │  │
│  ├────────────────────┼──────────────────────────────────────────────────┤  │
│  │ docker build       │ Multi-stage build, npm install, Next.js build,   │  │
│  │ ./frontend         │ standalone output, image creation                │  │
│  └────────────────────┴──────────────────────────────────────────────────┘  │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Test Results Example

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                         PYTEST OUTPUT (10 TESTS)                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  tests/test_contracts.py::test_create_contract_valid PASSED        [ 10%]   │
│  tests/test_contracts.py::test_create_contract_invalid_dates PASSED[ 20%]   │
│  tests/test_contracts.py::test_filter_by_energy_type_and_price PASSED[30%]  │
│  tests/test_contracts.py::test_filter_multiple_energy_types PASSED [ 40%]   │
│  tests/test_contracts.py::test_contract_not_found PASSED           [ 50%]   │
│  tests/test_portfolio.py::test_add_to_portfolio PASSED             [ 60%]   │
│  tests/test_portfolio.py::test_cannot_add_reserved_contract PASSED [ 70%]   │
│  tests/test_portfolio.py::test_portfolio_metrics_weighted_avg PASSED[80%]   │
│  tests/test_portfolio.py::test_remove_from_portfolio PASSED        [ 90%]   │
│  tests/test_portfolio.py::test_cannot_delete_contract_in_portfolio PASSED   │
│                                                                    [100%]   │
│                                                                              │
│  ========================= 10 passed in 0.21s ============================   │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### How to View CI Results

1. Go to repository on GitHub
2. Click **Actions** tab
3. Select the latest workflow run
4. View job logs for each step

```
GitHub Repository
      │
      └── Actions (tab)
            │
            └── CI (workflow)
                  │
                  ├── backend (job)
                  │     ├── ✓ Checkout
                  │     ├── ✓ Setup Python
                  │     ├── ✓ Install dependencies
                  │     ├── ✓ Lint with ruff
                  │     ├── ✓ Format check
                  │     └── ✓ Run tests
                  │
                  ├── frontend (job)
                  │     ├── ✓ Checkout
                  │     ├── ✓ Setup Node.js
                  │     ├── ✓ Install dependencies
                  │     ├── ✓ Lint
                  │     ├── ✓ Type check
                  │     └── ✓ Build
                  │
                  └── docker (job)
                        ├── ✓ Checkout
                        ├── ✓ Build backend image
                        └── ✓ Build frontend image
```

---

## Design Decisions

### 1. Contract Deletion Protection

**Decision**: Reject deletion if contract is in portfolio (409 Conflict)

**Rationale**: Safer than cascade delete; prevents accidental data loss

### 2. Status Transitions

```
Available ──(add to portfolio)──▶ Reserved
    ▲                                │
    └────(remove from portfolio)─────┘
```

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
