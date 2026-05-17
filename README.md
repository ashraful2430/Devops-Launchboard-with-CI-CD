# DevOps LaunchBoard

DevOps LaunchBoard is a mid-level 3-tier teaching application for deployment classes.

- **Frontend:** React, TypeScript, Vite, Three.js, Nginx
- **Backend:** Python, FastAPI, SQLAlchemy async, Alembic
- **Database:** PostgreSQL
- **Deployment labs:** bare metal, Docker Compose, Kubernetes, and cloud extension notes for VPC, RDS, S3, Terraform, and Ansible

## Project Structure

```text
backend/                  FastAPI API, models, schemas, migrations
frontend/                 React UI, API client, 3D status scene
deploy/kubernetes/base/   Starter Kubernetes manifests
docs/deployment-guide.md  Teaching guide for bare metal, Docker, K8s, and AWS labs
docker-compose.yml        Local container stack
```

## Run Locally: Bare Metal

### 1. Start PostgreSQL

Create a local PostgreSQL database named `launchboard`.

Example connection used by the app:

```text
postgresql+asyncpg://postgres:postgres@localhost:5432/launchboard
```

### 2. Configure Backend Environment

```powershell
cd backend
copy .env.example .env
```

Edit `backend/.env` only if your database credentials are different.

### 3. Run Backend

```powershell
python -m venv .venv
.\.venv\Scripts\activate
pip install -e .
alembic upgrade head
uvicorn app.main:app --reload
```

Backend URLs:

```text
API:  http://localhost:8000
Docs: http://localhost:8000/docs
Health: http://localhost:8000/health
Ready:  http://localhost:8000/ready
```

### 4. Configure Frontend Environment

Open a new terminal:

```powershell
cd frontend
copy .env.example .env
```

Keep this for local development:

```text
VITE_API_URL=http://localhost:8000
```

### 5. Run Frontend

```powershell
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

## Run With Docker Compose

From the project root:

```powershell
copy .env.example .env
docker compose up --build
```

Open:

```text
Frontend: http://localhost:8080
Backend:  http://localhost:8000/docs
```

Stop the stack:

```powershell
docker compose down
```

Remove the database volume when you want a clean class reset:

```powershell
docker compose down -v
```

## Run On Kubernetes

Build local images:

```powershell
docker build -t launchboard-api:local .\backend
docker build --build-arg VITE_API_URL=http://localhost:8000 -t launchboard-web:local .\frontend
```

Apply manifests:

```powershell
kubectl apply -k deploy/kubernetes/base
kubectl get pods -n launchboard
```

For local clusters without Ingress configured, port-forward:

```powershell
kubectl port-forward -n launchboard svc/launchboard-web 8080:80
kubectl port-forward -n launchboard svc/launchboard-api 8000:8000
```

Open:

```text
Frontend: http://localhost:8080
Backend:  http://localhost:8000/docs
```

When teaching Ingress with `launchboard.local`, rebuild the frontend with `--build-arg VITE_API_URL=/api` so browser API calls flow through the Ingress `/api` route.

More teaching notes are in [docs/deployment-guide.md](docs/deployment-guide.md).

## Environment Variables

Backend variables live in `backend/.env` for bare metal and container/Kubernetes environment settings for deployments:

```text
APP_NAME=DevOps LaunchBoard API
APP_ENV=local
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/launchboard
CORS_ORIGINS=http://localhost:5173
SEED_DEMO_DATA=true
```

Frontend variables live in `frontend/.env`:

```text
VITE_API_URL=http://localhost:8000
```

When moving to RDS, change only `DATABASE_URL`. When hosting the frontend behind one domain and routing `/api` to the backend, use `VITE_API_URL=/api`.

## Useful Commands

```powershell
# Backend checks
cd backend
ruff check .
alembic current

# Frontend checks
cd frontend
npm run lint
npm run build
```
