# DevOps LaunchBoard

DevOps LaunchBoard is a mid-level 3-tier teaching application for students learning how a frontend, backend, and database work together.

- **Frontend:** React, TypeScript, Vite, Three.js
- **Backend:** Python, FastAPI, SQLAlchemy async, Alembic
- **Database:** PostgreSQL

This branch contains only the application code needed to run the project locally or on a cloud server. Docker, Kubernetes, and extended deployment materials live on the `deployment-labs` branch.

## Project Structure

```text
backend/
  app/               FastAPI routes, settings, models, schemas, seed data
  alembic/           Database migrations
frontend/
  src/               React UI, API client, components, styles
```

## Prerequisites

Install these before running the project:

- Python 3.12 or newer
- Node.js 20 or newer
- PostgreSQL 15 or newer

## 1. Create The Database

Create a PostgreSQL database named `launchboard`.

The default local database URL is:

```text
postgresql+asyncpg://postgres:postgres@localhost:5432/launchboard
```

If your PostgreSQL username, password, host, port, or database name is different, update `backend/.env` in the next step.

## 2. Configure The Backend

```powershell
cd backend
copy .env.example .env
```

Default backend environment:

```text
APP_NAME=DevOps LaunchBoard API
APP_ENV=local
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/launchboard
CORS_ORIGINS=http://localhost:5173
SEED_DEMO_DATA=true
```

For a cloud server, change:

- `DATABASE_URL` to your managed PostgreSQL or cloud database connection string.
- `CORS_ORIGINS` to the real frontend URL.
- `SEED_DEMO_DATA=false` if you do not want demo records inserted automatically.

## 3. Run The Backend

```powershell
python -m venv .venv
.\.venv\Scripts\activate
pip install -e .
alembic upgrade head
uvicorn app.main:app --reload
```

Backend URLs:

```text
API:    http://localhost:8000
Docs:   http://localhost:8000/docs
Health: http://localhost:8000/health
Ready:  http://localhost:8000/ready
```

## 4. Configure The Frontend

Open a second terminal:

```powershell
cd frontend
copy .env.example .env
```

Default frontend environment:

```text
VITE_API_URL=http://localhost:8000
```

For a cloud server, change `VITE_API_URL` to the public backend URL.

## 5. Run The Frontend

```powershell
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

## Build For A Cloud Server

Build the frontend:

```powershell
cd frontend
npm run build
```

The static files will be created in:

```text
frontend/dist
```

Run the backend on a server:

```powershell
cd backend
pip install -e .
alembic upgrade head
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

In production, serve `frontend/dist` with a web server such as Nginx, Apache, or a cloud static hosting service, and run the backend behind a process manager or service manager.

## Useful Commands

```powershell
# Backend
cd backend
alembic upgrade head
alembic current

# Frontend
cd frontend
npm run lint
npm run build
```

## Branches

- `main`: application code only
- `deployment-labs`: Docker, Kubernetes, and extended deployment teaching materials
