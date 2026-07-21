"""Request ID context management for distributed tracing."""

from contextvars import ContextVar
from uuid import uuid4

request_id_ctx: ContextVar[str | None] = ContextVar("request_id", default=None)


def generate_request_id() -> str:
    """Generate a unique request identifier."""
    return str(uuid4())


def get_request_id() -> str | None:
    """Return the current request ID from context."""
    return request_id_ctx.get()


def set_request_id(request_id: str | None = None) -> str:
    """Set request ID in context; generates one if not provided."""
    value = request_id or generate_request_id()
    request_id_ctx.set(value)
    return value
