# DevOps LaunchBoard

A simple 3-tier learning project that shows how a React frontend, FastAPI backend, and PostgreSQL database work together.

## Tech Stack

- Frontend: React, TypeScript, Vite, Three.js
- Backend: Python, FastAPI, SQLAlchemy, Alembic
- Database: PostgreSQL

## Branches

- `main`: app code only, for students to run and learn from
- `deployment-labs`: Docker, Kubernetes, and deployment files

## Requirements

Install these first:

- Python 3.12 or newer
- Node.js 20 or newer
- PostgreSQL 15 or newer

## 1. Create The Database

Create a PostgreSQL database named:

```text
launchboard
```

Default backend database URL:

```text
postgresql+asyncpg://postgres:postgres@localhost:5432/launchboard
```

If your PostgreSQL username or password is different, edit `backend/.env`.

## 2. Run The Backend

Open a terminal in the project folder:

```bash
cd backend
cp .env.example .env
python -m venv .venv
source .venv/Scripts/activate
pip install -e .
alembic upgrade head
uvicorn app.main:app --host 127.0.0.1 --port 8001
```

Backend links:

```text
API Health: http://127.0.0.1:8001/health
API Docs:   http://127.0.0.1:8001/docs
```

## 3. Run The Frontend

Open a second terminal in the project folder:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open the app:

```text
http://localhost:5173
```

## Environment Files

Backend file: `backend/.env`

```env
APP_NAME=DevOps LaunchBoard API
APP_ENV=local
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/launchboard
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
SEED_DEMO_DATA=true
```

Frontend file: `frontend/.env`

```env
VITE_API_URL=http://127.0.0.1:8001
```

If you change an `.env` file, stop the running server and start it again.

## Useful Commands

Backend:

```bash
cd backend
source .venv/Scripts/activate
alembic upgrade head
uvicorn app.main:app --host 127.0.0.1 --port 8001
```

Frontend:

```bash
cd frontend
npm run dev
npm run build
```

## Deployment Files

Docker, Kubernetes, and deployment guide files are not kept on `main`.

To view them:

```bash
git checkout deployment-labs
```

To return to the student app branch:

```bash
git checkout main
```
