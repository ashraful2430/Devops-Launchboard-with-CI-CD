from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.deployment import Deployment, Service


async def seed_demo_data(session: AsyncSession) -> None:
    existing = await session.scalar(select(Service.id).limit(1))
    if existing:
        return

    api = Service(
        name="student-portal-api",
        owner="Platform Team",
        tier="backend",
        runtime="Python 3.12 / FastAPI",
        repository_url="https://example.com/devops/student-portal-api",
        health_endpoint="/health",
    )
    web = Service(
        name="student-portal-web",
        owner="Frontend Guild",
        tier="frontend",
        runtime="React / Vite",
        repository_url="https://example.com/devops/student-portal-web",
        health_endpoint="/",
    )
    db = Service(
        name="launchboard-postgres",
        owner="Data Ops",
        tier="database",
        runtime="PostgreSQL",
        repository_url="https://example.com/devops/database-config",
        health_endpoint="/ready",
    )

    session.add_all([api, web, db])
    await session.flush()

    session.add_all(
        [
            Deployment(
                service_id=api.id,
                environment="production",
                version="v2.4.1",
                status="healthy",
                replicas=4,
                cpu_request="250m",
                memory_request="512Mi",
                latency_ms=96,
                error_rate=0.18,
                deployed_by="Ayesha",
            ),
            Deployment(
                service_id=web.id,
                environment="staging",
                version="v2.5.0-rc.2",
                status="progressing",
                replicas=3,
                cpu_request="100m",
                memory_request="256Mi",
                latency_ms=72,
                error_rate=0.06,
                deployed_by="Rahim",
            ),
            Deployment(
                service_id=db.id,
                environment="production",
                version="v15.7.0",
                status="degraded",
                replicas=1,
                cpu_request="500m",
                memory_request="2Gi",
                latency_ms=188,
                error_rate=1.45,
                deployed_by="Nadia",
            ),
        ]
    )
    await session.commit()

