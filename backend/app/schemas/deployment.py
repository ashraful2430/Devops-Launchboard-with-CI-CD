from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, HttpUrl

DeploymentStatus = Literal["healthy", "degraded", "failed", "progressing"]
Environment = Literal["development", "staging", "production"]
Tier = Literal["frontend", "backend", "database", "worker"]


class ServiceCreate(BaseModel):
    name: str = Field(min_length=3, max_length=80)
    owner: str = Field(min_length=2, max_length=80)
    tier: Tier
    runtime: str = Field(min_length=2, max_length=80)
    repository_url: HttpUrl
    health_endpoint: str = Field(pattern=r"^/.*")


class ServiceRead(ServiceCreate):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}


class DeploymentCreate(BaseModel):
    service_id: int
    environment: Environment
    version: str = Field(pattern=r"^v?\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?$")
    status: DeploymentStatus
    replicas: int = Field(ge=1, le=20)
    cpu_request: str = Field(pattern=r"^\d+m?$")
    memory_request: str = Field(pattern=r"^\d+(Mi|Gi)$")
    latency_ms: int = Field(ge=1, le=5000)
    error_rate: float = Field(ge=0, le=100)
    deployed_by: str = Field(min_length=2, max_length=80)


class DeploymentRead(DeploymentCreate):
    id: int
    created_at: datetime
    service: ServiceRead

    model_config = {"from_attributes": True}


class DeploymentSummary(BaseModel):
    total_services: int
    total_deployments: int
    healthy: int
    degraded: int
    failed: int
    progressing: int
    average_latency_ms: float
    average_error_rate: float
