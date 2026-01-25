# Data Service API

A FastAPI-based data service layer for the AI Foraging project. This service manages projects, researchers, knowledge sources, and knowledge artifacts, and provides connectors to AI microservices.

## Quick Start

```bash
# Install dependencies
pip install fastapi uvicorn sqlalchemy pydantic pydantic-settings httpx

# Run the server
python3 main.py
```

**API Documentation**: http://127.0.0.1:8000/docs

## Project Structure

```
data-service/
├── main.py              # FastAPI app entry point
├── config.py            # Centralized configuration
├── database.py          # Database setup and session
├── models.py            # SQLAlchemy ORM models
├── schemas.py           # Pydantic request/response schemas
├── routes/              # API endpoints
│   ├── researchers.py
│   ├── projects.py
│   ├── knowledge_sources.py
│   ├── knowledge_artifacts.py
│   └── ai.py            # AI microservice endpoints
└── services/            # External microservice clients
    ├── base.py          # Base HTTP client
    ├── semantic_search.py
    └── llm_service.py
```

## Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | SQLite database path | `sqlite:///./database.db` |
| `SEMANTIC_SEARCH_URL` | Semantic search service URL | `http://localhost:8001` |
| `LLM_SERVICE_URL` | LLM service URL | `http://localhost:8002` |
| `SEMANTIC_SEARCH_ENABLED` | Enable semantic search | `false` |
| `LLM_ENABLED` | Enable LLM integration | `false` |

## API Endpoints

### Core CRUD
- `GET/POST /researchers/` - Manage researchers
- `GET/POST/PUT /projects/` - Manage projects
- `GET/POST/PUT /knowledge-sources/` - Manage knowledge sources
- `GET/POST/PUT /knowledge-artifacts/` - Manage artifacts
- `POST /projects/{id}/download-paper` - Download and add paper to project

### AI Services (when enabled)
- `POST /ai/search` - Semantic search across knowledge sources
- `POST /ai/extract-artifacts` - Extract artifacts using LLM
- `POST /ai/chat` - Chat with LLM about knowledge sources
- `POST /ai/summarize` - Generate summaries
- `GET /ai/health` - Check AI services status

## Microservice Integration

The `services/` directory contains HTTP client connectors for external microservices. Enable services by setting environment variables:

```bash
SEMANTIC_SEARCH_ENABLED=true
LLM_ENABLED=true
```

When disabled, AI endpoints return a graceful "service unavailable" response instead of errors.
