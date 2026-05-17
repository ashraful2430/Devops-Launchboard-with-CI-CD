# DevOps LaunchBoard Teaching Guide

This guide turns the same application into several deployment lessons. The goal is to teach real production ideas without drowning students in platform details on day one.

## Lesson 1: Bare Metal

Use this lesson to explain processes, ports, environment files, database migrations, and CORS.

Architecture:

```text
Browser -> Vite dev server -> FastAPI -> PostgreSQL
```

Student tasks:

- Install Python, Node.js, and PostgreSQL.
- Copy `backend/.env.example` to `backend/.env`.
- Copy `frontend/.env.example` to `frontend/.env`.
- Run `alembic upgrade head`.
- Start the API with `uvicorn`.
- Start the UI with `npm run dev`.
- Change `SEED_DEMO_DATA=false` and observe an empty database after a reset.

Important discussion points:

- The backend owns the database schema.
- The frontend never connects directly to PostgreSQL.
- Secrets belong in environment variables, not source code.
- `/health` means the process is alive; `/ready` also checks the database.

## Lesson 2: Docker

Use this lesson to explain images, containers, networks, volumes, and health checks.

Architecture:

```text
Browser -> Nginx frontend container -> FastAPI container -> PostgreSQL container volume
```

Run:

```powershell
copy .env.example .env
docker compose up --build
```

Student tasks:

- Inspect `backend/Dockerfile`.
- Inspect `frontend/Dockerfile`.
- Change `FRONTEND_PORT` in root `.env`.
- Run `docker compose ps`.
- Run `docker compose logs backend`.
- Delete and recreate the stack with `docker compose down -v`.

Important discussion points:

- Compose service names become DNS names, so the API uses `postgres` as the database host.
- The frontend build receives `VITE_API_URL` at build time.
- PostgreSQL data survives container recreation because of the named volume.

## Lesson 3: Kubernetes

Use this lesson to explain Deployments, Services, ConfigMaps, Secrets, PVCs, probes, and Ingress.

Architecture:

```text
Ingress -> frontend Service -> frontend Pods
Ingress /api -> backend Service -> backend Pod -> postgres Service -> postgres Pod + PVC
```

Build local images:

```powershell
docker build -t launchboard-api:local .\backend
docker build --build-arg VITE_API_URL=http://localhost:8000 -t launchboard-web:local .\frontend
```

Deploy:

```powershell
kubectl apply -k deploy/kubernetes/base
kubectl get pods -n launchboard
kubectl get svc -n launchboard
```

Student tasks:

- Change replicas in `frontend.yaml`.
- Break the database password and watch readiness fail.
- Read logs with `kubectl logs`.
- Describe pods with `kubectl describe pod`.
- Replace the in-cluster PostgreSQL database with an external RDS endpoint.
- Rebuild the frontend with `--build-arg VITE_API_URL=/api` when using the `launchboard.local` Ingress route.

Important discussion points:

- ConfigMaps are for non-secret configuration.
- Secrets are still not magic; production clusters should integrate with a real secret manager.
- Readiness controls traffic. Liveness controls restart behavior.
- Persistent storage in Kubernetes is different from a Docker volume.

## Lesson 4: AWS VPC, RDS, and S3

Recommended teaching architecture:

```text
Route 53 / CloudFront
        |
        +-> S3 static frontend
        |
        +-> Load Balancer -> backend service on EC2/ECS/EKS
                                |
                                +-> RDS PostgreSQL in private subnets
```

What changes in the app:

- Set backend `DATABASE_URL` to the RDS PostgreSQL endpoint.
- Set backend `CORS_ORIGINS` to the real frontend domain.
- Build frontend with `VITE_API_URL` pointing to the backend URL or `/api` if using one domain.
- Upload `frontend/dist` to S3 when teaching static hosting.

Suggested VPC layout:

- 2 public subnets for load balancers and NAT gateways.
- 2 private app subnets for backend compute.
- 2 private database subnets for RDS.
- Security group allowing database traffic only from the backend security group.

## Lesson 5: Terraform

Keep Terraform as a separate lab so students first understand the resources manually.

Good first modules:

- `network`: VPC, subnets, route tables, internet gateway, NAT gateway.
- `database`: RDS subnet group, security group, PostgreSQL instance.
- `storage`: S3 bucket for frontend assets.
- `compute`: EC2, ECS, or EKS depending on class level.

Variables students should expose:

```text
project_name
aws_region
vpc_cidr
database_name
database_username
frontend_domain
```

## Lesson 6: Ansible

Use Ansible after bare-metal deployment so students understand what it automates.

Good playbook goals:

- Install Python, Node.js, Nginx, and system packages.
- Create a Linux service user.
- Upload backend code and install dependencies.
- Render a backend `.env` from Ansible variables.
- Run Alembic migrations.
- Configure Nginx as a reverse proxy.
- Start the backend with a systemd service.

## Minimal Production Checklist

- Use strong database passwords.
- Disable `SEED_DEMO_DATA` outside demos.
- Restrict `CORS_ORIGINS` to trusted domains.
- Run migrations before serving traffic.
- Store secrets in a secret manager.
- Add API and frontend access logs.
- Put the database in private networking.
- Back up PostgreSQL before upgrades.
