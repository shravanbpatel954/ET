"""Application entry point for SentinelAI backend."""

import uvicorn

from app.core.config import get_settings
from app.factory import create_app

settings = get_settings()
app = create_app(settings)


def main() -> None:
    """Run the application with Uvicorn."""
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.is_development,
        log_level=settings.log_level.lower(),
    )


if __name__ == "__main__":
    main()
