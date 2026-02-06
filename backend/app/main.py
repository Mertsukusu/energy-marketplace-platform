import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes_contracts import router as contracts_router
from app.api.routes_portfolio import router as portfolio_router
from app.core.config import get_settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Energy Marketplace API")
    yield
    logger.info("Shutting down Energy Marketplace API")


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title="Energy Contract Marketplace",
        description="API for browsing and managing energy supply contracts",
        version="1.0.0",
        lifespan=lifespan,
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(contracts_router, prefix="/contracts", tags=["contracts"])
    app.include_router(portfolio_router, prefix="/portfolio", tags=["portfolio"])

    @app.get("/health")
    async def health():
        return {"status": "ok"}

    return app


app = create_app()
