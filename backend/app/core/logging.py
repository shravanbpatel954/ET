"""Loguru logging configuration with request ID support."""

import sys
from pathlib import Path

from loguru import logger

from app.core.config import Settings
from app.utils.request_id import request_id_ctx

LOG_FORMAT = (
    "<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | "
    "<level>{level: <8}</level> | "
    "<cyan>{extra[request_id]}</cyan> | "
    "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | "
    "<level>{message}</level>"
)

ERROR_LOG_FORMAT = (
    "{time:YYYY-MM-DD HH:mm:ss.SSS} | "
    "{level: <8} | "
    "{extra[request_id]} | "
    "{name}:{function}:{line} | "
    "{message}"
)


def _inject_request_id(record: dict) -> bool:
    """Inject request ID from context into every log record."""
    record["extra"].setdefault("request_id", request_id_ctx.get() or "-")
    return True


def setup_logging(settings: Settings) -> None:
    """Configure Loguru sinks for console and rotating file output."""
    log_dir = Path("logs")
    log_dir.mkdir(parents=True, exist_ok=True)

    logger.remove()
    logger.configure(patcher=lambda record: _inject_request_id(record))

    # Console sink
    logger.add(
        sys.stdout,
        level=settings.log_level,
        format=LOG_FORMAT,
        colorize=True,
        backtrace=settings.debug,
        diagnose=settings.debug,
    )

    # General rotating log file
    logger.add(
        log_dir / "sentinelai.log",
        level=settings.log_level,
        format=ERROR_LOG_FORMAT,
        rotation="10 MB",
        retention="30 days",
        compression="zip",
        enqueue=True,
        backtrace=True,
        diagnose=settings.debug,
    )

    # Dedicated error log file
    logger.add(
        log_dir / "error.log",
        level="ERROR",
        format=ERROR_LOG_FORMAT,
        rotation="10 MB",
        retention="60 days",
        compression="zip",
        enqueue=True,
        backtrace=True,
        diagnose=True,
    )

    logger.info(
        "Logging initialized | environment={} | level={}",
        settings.environment,
        settings.log_level,
    )
