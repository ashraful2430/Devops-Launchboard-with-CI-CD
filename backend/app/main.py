from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import deployments, health
from app.core.config import settings
from app.db import AsyncSessionLocal
from app.services.seed import seed_demo_data


@asynccontextmanager
async def lifespan(app: FastAPI):
    if settings.seed_demo_data:
        async with AsyncSessionLocal() as session:
            await seed_demo_data(session)
    yield


app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description="Intermediate 3-tier DevOps teaching API backed by PostgreSQL.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(deployments.router)

