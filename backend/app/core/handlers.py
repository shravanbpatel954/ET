"""Global exception handlers for the FastAPI application."""

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from loguru import logger
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.exceptions import SentinelAPIException
from app.schemas.common import ErrorResponse
from app.utils.request_id import get_request_id


def _build_error_response(
    request: Request,
    error_code: str,
    message: str,
    status_code: int,
    details: dict | None = None,
) -> JSONResponse:
    """Build a standardized JSON error response."""
    request_id = getattr(request.state, "request_id", None) or get_request_id()
    body = ErrorResponse(
        error_code=error_code,
        message=message,
        details=details or {},
        request_id=request_id,
    )
    return JSONResponse(status_code=status_code, content=body.model_dump())


def register_exception_handlers(app: FastAPI) -> None:
    """Register all custom exception handlers on the application."""

    @app.exception_handler(SentinelAPIException)
    async def sentinel_api_exception_handler(
        request: Request,
        exc: SentinelAPIException,
    ) -> JSONResponse:
        logger.warning(
            "API exception | code={} | message={}",
            exc.error_code,
            exc.message,
        )
        return _build_error_response(
            request=request,
            error_code=exc.error_code,
            message=exc.message,
            status_code=exc.status_code,
            details=exc.details,
        )

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(
        request: Request,
        exc: StarletteHTTPException,
    ) -> JSONResponse:
        return _build_error_response(
            request=request,
            error_code="HTTP_ERROR",
            message=str(exc.detail),
            status_code=exc.status_code,
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        request: Request,
        exc: RequestValidationError,
    ) -> JSONResponse:
        return _build_error_response(
            request=request,
            error_code="REQUEST_VALIDATION_ERROR",
            message="Request validation failed",
            status_code=422,
            details={"errors": exc.errors()},
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(
        request: Request,
        exc: Exception,
    ) -> JSONResponse:
        logger.exception("Unhandled exception: {}", exc)
        return _build_error_response(
            request=request,
            error_code="INTERNAL_ERROR",
            message="An unexpected error occurred",
            status_code=500,
        )
