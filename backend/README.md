# SentinelAI — Adaptive Fraud Intelligence Platform

> **Economic Times AI Hackathon 2026**
> Production-ready backend foundation for AI-powered fraud detection and threat intelligence.

---

## Project Overview

**SentinelAI** is an adaptive fraud intelligence platform designed to detect, analyze, and evolve against emerging scam patterns. This repository contains the **backend foundation** — a modular, production-grade architecture that will host future AI modules including threat ingestion, OCR, Gemini extraction, knowledge graphs, similarity engines, and evolution detection.

This phase establishes:

- Clean architecture with clear separation of concerns
- Centralized configuration via Pydantic Settings
- Structured logging with Loguru (console + rotating files)
- PostgreSQL (SQLAlchemy 2) and Neo4j connection managers
- FastAPI with health checks, middleware, and exception handling
- Docker Compose for local and deployment environments
- Alembic migration scaffolding

**No business logic or AI pipelines are implemented in this phase.**

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        API Layer                            │
│              FastAPI · Routers · Schemas                    │
├─────────────────────────────────────────────────────────────┤
│                     Middleware Layer                        │
│         Request ID · Logging · CORS · Exception Handlers    │
├─────────────────────────────────────────────────────────────┤
│                    Dependency Injection                     │
│           Settings · DB Session · Neo4j Manager             │
├─────────────────────────────────────────────────────────────┤
│                      Service Layer                          │
│              (Future: AI & Business Logic)                  │
├─────────────────────────────────────────────────────────────┤
│                    Repository Layer                         │
│              (Future: Data Access Abstractions)             │
├─────────────────────────────────────────────────────────────┤
│                     Data Layer                              │
│         PostgreSQL (SQLAlchemy) · Neo4j (Graph DB)          │
└─────────────────────────────────────────────────────────────┘
```

### Design Decisions

| Decision | Rationale |
|---|---|
| **Application Factory** (`app/factory.py`) | Enables testability, multiple app instances, and clean lifespan management |
| **Pydantic Settings singleton** | Type-safe, validated configuration from environment variables |
| **Repository pattern (scaffolded)** | Decouples business logic from data access for future modules |
| **Request ID via ContextVar** | Propagates trace IDs through logs without passing them explicitly |
| **Layered middleware** | CORS → Logging → Request ID (outermost) for proper request/response wrapping |
| **Alembic from day one** | Schema migrations ready before any models are defined |

---

## Folder Structure

```
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── endpoints/
│   │       │   └── health.py          # Root, health, version endpoints
│   │       └── router.py              # v1 router aggregation
│   ├── core/
│   │   ├── config.py                  # Pydantic Settings
│   │   ├── logging.py                 # Loguru configuration
│   │   ├── security.py                # Security utilities (foundation)
│   │   ├── exceptions.py              # Custom API exceptions
│   │   └── handlers.py                # Global exception handlers
│   ├── database/
│   │   ├── session.py                 # SQLAlchemy engine & session
│   │   ├── neo4j.py                   # Neo4j connection manager
│   │   ├── models/
│   │   │   └── base.py                # Declarative base + mixins
│   │   └── repositories/              # Data access (future)
│   ├── schemas/
│   │   └── common.py                  # Shared Pydantic schemas
│   ├── services/                      # Business logic (future)
│   ├── prompts/                       # LLM prompts (future)
│   ├── dependencies/
│   │   └── __init__.py                # FastAPI DI providers
│   ├── middleware/
│   │   └── request.py                 # Request ID & logging middleware
│   ├── utils/
│   │   └── request_id.py              # ContextVar request tracing
│   └── factory.py                     # Application factory
├── alembic/                           # Database migrations
├── scripts/
│   └── setup_dev.py                   # Dev environment setup
├── tests/
│   ├── conftest.py
│   └── test_health.py
├── main.py                            # Application entry point
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── alembic.ini
└── pytest.ini
```

---

## Installation

### Prerequisites

- Python 3.12+
- Docker & Docker Compose (for containerized setup)
- PostgreSQL 16+ and Neo4j 5+ (if running locally without Docker)

### Local Setup

```bash
# 1. Navigate to backend
cd backend

# 2. Create virtual environment
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment
cp .env.example .env
# Edit .env with your values

# 5. (Optional) Run setup script
python scripts/setup_dev.py
```

---

## Run Commands

### Development (local)

```bash
# Start with hot-reload
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Or via entry point
python main.py
```

### Docker Compose (recommended)

```bash
# Start full stack (PostgreSQL + Neo4j + Backend)
docker compose up --build

# Run in background
docker compose up -d --build

# View logs
docker compose logs -f backend

# Stop stack
docker compose down
```

### Database Migrations

```bash
# Generate a new migration (after models are added)
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head
```

### Testing

```bash
pytest -v
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/` | API welcome message |
| `GET` | `/api/v1/health` | Health check with dependency status |
| `GET` | `/api/v1/version` | Application version info |
| `GET` | `/docs` | Swagger UI documentation |
| `GET` | `/redoc` | ReDoc documentation |
| `GET` | `/openapi.json` | OpenAPI schema |

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `APP_NAME` | Application name | `SentinelAI` |
| `APP_VERSION` | Application version | `0.1.0` |
| `ENVIRONMENT` | `development` / `staging` / `production` | `development` |
| `DEBUG` | Enable debug mode | `false` |
| `HOST` | Server bind host | `0.0.0.0` |
| `PORT` | Server bind port | `8000` |
| `POSTGRES_URL` | PostgreSQL connection URL | — |
| `NEO4J_URI` | Neo4j bolt URI | `bolt://localhost:7687` |
| `NEO4J_USERNAME` | Neo4j username | `neo4j` |
| `NEO4J_PASSWORD` | Neo4j password | — |
| `GEMINI_API_KEY` | Google Gemini API key (future) | — |
| `SECRET_KEY` | Application secret key | — |
| `LOG_LEVEL` | Logging level | `INFO` |

---

## Future Modules

The following modules will be built on this foundation:

| Module | Layer | Description |
|---|---|---|
| **Threat Intelligence Ingestion** | Service | Ingest fraud signals from multiple sources |
| **OCR Pipeline** | Service | Extract text from images and documents |
| **Gemini Extraction** | Service | Structured entity extraction via Gemini |
| **Scam DNA Generator** | Service | Generate canonical scam pattern signatures |
| **Knowledge Graph** | Service + Neo4j | Build and query fraud relationship graphs |
| **Similarity Engine** | Service + FAISS | Vector similarity search for scam patterns |
| **Evolution Detection Engine** | Service | Detect scam pattern mutations over time |
| **Threat Scoring** | Service | Composite risk scoring model |
| **REST APIs** | API | Expose all capabilities via versioned endpoints |

Each module will follow the established patterns:

```
api/v1/endpoints/ → services/ → repositories/ → database/
```

---

## Logging

Logs are written to:

- **Console** — colored, structured output
- **`logs/sentinelai.log`** — rotating general log (10 MB, 30-day retention)
- **`logs/error.log`** — ERROR-level only (10 MB, 60-day retention)

Every log entry includes a **request ID** (`X-Request-ID` header) for distributed tracing.

---

## License

Proprietary — Economic Times AI Hackathon 2026
