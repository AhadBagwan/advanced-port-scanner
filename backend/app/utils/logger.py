"""Logging Configuration"""

import logging
import logging.handlers
from pathlib import Path

from app.config import settings


def setup_logger(name: str) -> logging.Logger:
    """Configure and return a logger instance"""

    logger = logging.getLogger(name)
    logger.setLevel(settings.LOG_LEVEL)

    # Create logs directory if it doesn't exist
    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)

    # Console Handler
    console_handler = logging.StreamHandler()
    console_handler.setLevel(settings.LOG_LEVEL)

    # File Handler
    file_handler = logging.handlers.RotatingFileHandler(
        log_dir / f"{name}.log",
        maxBytes=10485760,  # 10MB
        backupCount=10,
    )
    file_handler.setLevel(settings.LOG_LEVEL)

    # Formatter
    formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )
    console_handler.setFormatter(formatter)
    file_handler.setFormatter(formatter)

    # Add handlers
    if not logger.handlers:
        logger.addHandler(console_handler)
        logger.addHandler(file_handler)

    return logger


# Global logger instance
logger = setup_logger("port_scanner")
