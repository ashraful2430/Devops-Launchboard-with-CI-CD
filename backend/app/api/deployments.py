from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import Select, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_session
from app.models.deployment import Deployment, Service
from app.schemas.deployment import (
    DeploymentCreate,
    DeploymentRead,
    DeploymentSummary,
    Environment,
    ServiceCreate,
    ServiceRead,
)

router = APIRouter(prefix="/api", tags=["launchboard"])


@router.get("/services", response_model=list[ServiceRead])
async def list_services(session: AsyncSession = Depends(get_session)) -> list[Service]:
    result = await session.scalars(select(Service).order_by(Service.name))
    return list(result)


@router.post("/services", response_model=ServiceRead, status_code=status.HTTP_201_CREATED)
async def create_service(payload: ServiceCreate, session: AsyncSession = Depends(get_session)) -> Service:
    service = Service(**payload.model_dump(mode="json"))
    session.add(service)
    await session.commit()
    await session.refresh(service)
    return service


@router.get("/deployments", response_model=list[DeploymentRead])
async def list_deployments(
    environment: Environment | None = Query(default=None),
    status_filter: str | None = Query(default=None, alias="status"),
    session: AsyncSession = Depends(get_session),
) -> list[Deployment]:
    query: Select[tuple[Deployment]] = select(Deployment).order_by(Deployment.created_at.desc())
    if environment:
        query = query.where(Deployment.environment == environment)
    if status_filter:
        query = query.where(Deployment.status == status_filter)

    result = await session.scalars(query)
    return list(result)


@router.post("/deployments", response_model=DeploymentRead, status_code=status.HTTP_201_CREATED)
async def create_deployment(
    payload: DeploymentCreate,
    session: AsyncSession = Depends(get_session),
) -> Deployment:
    service = await session.get(Service, payload.service_id)
    if service is None:
        raise HTTPException(status_code=404, detail="Service not found")

    deployment = Deployment(**payload.model_dump())
    session.add(deployment)
    await session.commit()
    await session.refresh(deployment, attribute_names=["service"])
    return deployment


@router.get("/summary", response_model=DeploymentSummary)
async def deployment_summary(session: AsyncSession = Depends(get_session)) -> DeploymentSummary:
    total_services = await session.scalar(select(func.count(Service.id))) or 0
    total_deployments = await session.scalar(select(func.count(Deployment.id))) or 0
    avg_latency = await session.scalar(select(func.avg(Deployment.latency_ms))) or 0
    avg_error = await session.scalar(select(func.avg(Deployment.error_rate))) or 0

    counts = dict.fromkeys(["healthy", "degraded", "failed", "progressing"], 0)
    rows = await session.execute(select(Deployment.status, func.count()).group_by(Deployment.status))
    for deployment_status, count in rows:
        counts[deployment_status] = count

    return DeploymentSummary(
        total_services=total_services,
        total_deployments=total_deployments,
        healthy=counts["healthy"],
        degraded=counts["degraded"],
        failed=counts["failed"],
        progressing=counts["progressing"],
        average_latency_ms=round(float(avg_latency), 2),
        average_error_rate=round(float(avg_error), 2),
    )

