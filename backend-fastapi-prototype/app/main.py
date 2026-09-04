from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.db.database import Base, engine
from app.api.routes import transactions


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield

    await engine.dispose()


app = FastAPI(
    title="Autonomous Financial Control Tower",
    description=(
        "AI-powered financial monitoring, "
        "fraud detection and autonomous risk control"
    ),
    version="0.1.0",
    lifespan=lifespan,
)


app.include_router(
    transactions.router,
    prefix="/api/v1/transactions",
    tags=["Transactions"],
)


@app.get("/health", tags=["System"])
async def health_check():
    return {
        "status": "healthy",
        "service": "financial-control-tower",
        "version": "0.1.0",
    }