# EduFund — Smart Education Loan Application Platform

A full-stack education loan application system with intelligent lead scoring and dead lead detection.

## 🏗️ Architecture Overview

```
┌──────────────────────┐     HTTP/REST      ┌──────────────────────┐
│   Next.js Frontend   │ ◄────────────────► │   NestJS Backend     │
│   (TypeScript)       │                    │   (TypeScript)       │
│                      │                    │                      │
│  • Landing Page      │                    │  • Application CRUD  │
│  • Multi-step Form   │                    │  • Lead Scoring      │
│  • Status Tracking   │                    │  • Dead Lead Detect  │
│  • Admin Dashboard   │                    │  • Status Management │
└──────────────────────┘                    └──────────┬───────────┘
                                                       │
                                                       │ TypeORM
                                                       ▼
                                            ┌──────────────────────┐
                                            │   PostgreSQL         │
                                            │                      │
                                            │  • applications      │
                                            │  • status_history    │
                                            │  • documents         │
                                            └──────────────────────┘
```

## 🔑 Key Features

### For Students
- **Multi-step Application Form** with real-time validation and auto-save
- **Application Tracking** via human-readable application number (EL-2026-XXXXX)
- **Transparent Process** with status timeline and student-friendly messages

### For Business (Admin)
- **Lead Quality Scoring** (0-100) across 8 dimensions:
  - Admission Status (25 pts) — strongest conversion predictor
  - University Tier (15 pts) — auto-detected from university name
  - Academic Performance (15 pts)
  - Income Eligibility (15 pts) — income-to-loan ratio analysis
  - Co-applicant Availability (10 pts)
  - Document Completeness (10 pts)
  - Loan Reasonableness (5 pts) — loan vs fee sanity check
  - Profile Completeness (5 pts)

- **Dead Lead Detection** with 11 automated rules:
  - Disposable email domains (35+ known providers)
  - Invalid phone patterns (repeating digits)
  - Duplicate PAN / contact detection
  - Age eligibility checks
  - Bot detection (form completion speed)
  - Gibberish name/email detection
  - Data mismatch signals
  - And more...

- **Admin Dashboard** with stats, filterable table, and score breakdown

### Smart Design Decisions
- Dead leads are **never rejected outright** — marked "Under Review" internally to avoid false positive friction
- Score breakdown includes **human-readable explanations** for every factor
- Student-facing responses **never expose internal scoring language**
- Application number is human-readable (EL-2026-XXXXX) not UUID

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 + TypeScript |
| Backend | NestJS + TypeScript |
| Database | PostgreSQL 16 |
| ORM | TypeORM |
| Validation | class-validator (backend), custom (frontend) |
| Styling | Vanilla CSS with design tokens |

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+
- Docker (for PostgreSQL) OR a PostgreSQL instance
- npm

### 1. Start the Database

```bash
# Using Docker (recommended)
docker-compose up -d

# OR connect to an existing PostgreSQL and update backend/.env
```

### 2. Start the Backend

```bash
cd backend
cp .env.example .env    # Edit DB credentials if needed
npm install
npm run start:dev       # Runs on http://localhost:3001
```

The database tables are auto-created via TypeORM synchronize (dev mode).

### 3. Start the Frontend

```bash
cd frontend
npm install
npm run dev             # Runs on http://localhost:3000
```

### 4. Access the Application

| Page | URL |
|------|-----|
| Landing Page | http://localhost:3000 |
| Apply for Loan | http://localhost:3000/apply |
| Track Application | http://localhost:3000/track |
| Admin Dashboard | http://localhost:3000/admin |

## 📁 Project Structure

```
├── frontend/                   # Next.js app
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx        # Landing page
│   │   │   ├── apply/          # Multi-step form
│   │   │   ├── track/          # Status tracking
│   │   │   ├── success/        # Post-submission
│   │   │   └── admin/          # Admin dashboard
│   │   └── lib/
│   │       ├── api.ts          # API client
│   │       └── types.ts        # Shared types
│   └── ...
├── backend/                    # NestJS app
│   ├── src/
│   │   ├── applications/       # Core CRUD module
│   │   │   ├── entities/       # TypeORM entities
│   │   │   ├── dto/            # Validation DTOs
│   │   │   ├── *.service.ts
│   │   │   └── *.controller.ts
│   │   ├── scoring/            # Lead scoring engine
│   │   │   ├── scoring.service.ts
│   │   │   └── scoring.constants.ts
│   │   ├── dead-lead/          # Dead lead detection
│   │   │   ├── dead-lead.service.ts
│   │   │   └── dead-lead.constants.ts
│   │   └── config/
│   └── ...
├── docker-compose.yml
└── README.md
```

## 🧪 API Endpoints

### Student-Facing
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/applications | Submit loan application |
| GET | /api/applications/track/:appNo | Track by application number |

### Admin-Facing
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/applications | List all (paginated, filterable) |
| GET | /api/admin/dashboard/stats | Dashboard statistics |
| GET | /api/admin/dead-leads | List flagged dead leads |
| GET | /api/applications/:id/score | Detailed score breakdown |
| PATCH | /api/applications/:id/status | Update status |

## 📐 Database Schema

Three core tables:
- **applications** — All applicant data + scoring results + dead lead flags
- **application_status_history** — Audit trail of every status change
- **application_documents** — File upload metadata

Key design decisions:
- UUID primary keys for security (no sequential ID guessing)
- JSONB for score breakdown (flexible, queryable)
- Unique constraint on PAN for duplicate detection
- Indexes on searchable fields (email, phone, status, category)
