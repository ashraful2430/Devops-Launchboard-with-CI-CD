# DevOps LaunchBoard

An intermediate 3-tier teaching application for DevOps deployment classes.

- **Frontend:** React + TypeScript + Vite
- **Backend:** Python + FastAPI + SQLAlchemy async
- **Database:** PostgreSQL

The project intentionally does **not** include Docker, Compose, Kubernetes, CI/CD, or cloud manifests. Those are left for students to create during deployment lessons.

## What Students Can Practice

- Connecting a frontend to a backend through environment configuration
- Running database-backed APIs with PostgreSQL
- Managing runtime variables without hardcoding secrets
- Applying database migrations with Alembic
- Deploying three separate tiers independently
- Adding health checks, readiness checks, logs, and release automation

## Project Structure

```text
backend/
  app/
    api/              FastAPI route modules
    core/             settings and app config
    models/           SQLAlchemy database models
    schemas/          Pydantic request/response schemas
    services/         seed data and business helpers
  alembic/            database migrations
frontend/
  src/
    components/       React UI components
    lib/              API client and types
    styles/           application CSS
```

## Backend Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -e .
copy .env.example .env
```

Update `backend/.env` with your PostgreSQL connection string, then run:

```bash
alembic upgrade head
uvicorn app.main:app --reload
```

API docs are available at:

```text
http://localhost:8000/docs
```

## Frontend Setup

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Open:

```text
http://localhost:5173
```

## Default API URL

The frontend reads:

```text
VITE_API_URL=http://localhost:8000
```

Change this when students deploy the API to another host.

