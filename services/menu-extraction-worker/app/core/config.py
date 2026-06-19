"""Validated worker configuration (environment driven)."""
from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="MENU_IMPORT_", extra="ignore")

    # Service-to-service auth shared secret (must match the Next.js app).
    worker_secret: str = "dev-worker-secret-change-me"

    # Safety limits (do not hard-code limits throughout the codebase).
    max_file_size_mb: int = 25
    max_page_count: int = 40
    max_image_count: int = 200
    job_timeout_seconds: int = 900
    page_timeout_seconds: int = 120

    # OCR / AI toggles. OCR requires system packages (tesseract, poppler).
    ocr_languages: str = "tur,eng,ara"
    ai_enabled: bool = False
    ai_provider: str = ""
    ai_model: str = ""
    ai_max_pages: int = 10

    confidence_high: float = 0.90
    confidence_medium: float = 0.70

    # Writable temp dir for rendered pages / crops (cleaned after each job).
    temp_dir: str = "/tmp/menu-imports"


settings = Settings()
