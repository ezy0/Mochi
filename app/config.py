"""Application configuration."""
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

DATABASE_URL = os.getenv(
    "MOCHI_DATABASE_URL",
    f"sqlite:///{BASE_DIR / 'mochi.db'}",
)

# Title and metadata
APP_TITLE = "Mochi — Aprende Japonés"
APP_VERSION = "0.1.0"
