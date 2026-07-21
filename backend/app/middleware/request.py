"""HTTP middleware for request tracing and observability."""

import time
from collections.abc import Callable

from fastapi import Request, Response
from loguru import logger
from starlette.middleware.base import BaseHTTPMiddleware

from app.utils.request_id import generate_request_id, request_id_ctx


class RequestIDMiddleware(BaseHTTPMiddleware):
    """Attach a unique request ID to every incoming request."""

    HEADER_NAME = "X-Request-ID"

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        incoming_id = request.headers.get(self.HEADER_NAME)
        request_id = incoming_id or generate_request_id()
        request_id_ctx.set(request_id)

        request.state.request_id = request_id
        response = await call_next(request)
        response.headers[self.HEADER_NAME] = request_id
        return response


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Log request/response metadata for observability."""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        start = time.perf_counter()
        response = await call_next(request)
        duration_ms = (time.perf_counter() - start) * 1000

        logger.bind(request_id=getattr(request.state, "request_id", "-")).info(
            "{method} {path} -> {status} ({duration:.2f}ms)",
            method=request.method,
            path=request.url.path,
            status=response.status_code,
            duration=duration_ms,
        )
        return response
