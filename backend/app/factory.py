"""FastAPI application factory."""

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

from app.api.v1.router import api_v1_router
from app.core.config import Settings, get_settings
from app.core.handlers import register_exception_handlers
from app.core.logging import setup_logging
from app.database.neo4j import close_neo4j, get_neo4j_manager
from app.database.session import dispose_async_engine, init_db
from app.middleware import RequestIDMiddleware, RequestLoggingMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Manage application startup and shutdown lifecycle."""
    settings: Settings = app.state.settings

    setup_logging(settings)
    logger.info("Starting {} v{}", settings.app_name, settings.app_version)

    # Warm up database connections
    await init_db(settings)
    get_neo4j_manager(settings)

    logger.info("Application startup complete")
    yield

    logger.info("Shutting down application")
    close_neo4j()
    await dispose_async_engine()
    logger.info("Application shutdown complete")


def create_app(settings: Settings | None = None) -> FastAPI:
    """Create and configure the FastAPI application."""
    settings = settings or get_settings()

    app = FastAPI(
        title=settings.app_name,
        description=(
            "SentinelAI — AI Powered Digital Public Safety Platform. "
            "Threat Intelligence Core for adaptive fraud intelligence."
        ),
        version=settings.app_version,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        debug=settings.debug,
        lifespan=lifespan,
    )

    app.state.settings = settings

    # Middleware (order matters: first added = outermost)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"] if settings.is_development else [],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["X-Request-ID"],
    )
    app.add_middleware(RequestLoggingMiddleware)
    app.add_middleware(RequestIDMiddleware)

    register_exception_handlers(app)

    app.include_router(api_v1_router, prefix=settings.api_v1_prefix)

    return app
