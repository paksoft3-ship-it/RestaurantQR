# syntax=docker/dockerfile:1
# Multi-stage build for the YourPlatform menu-extraction worker.

FROM python:3.11-slim AS base

# System packages: PDF rendering (poppler) + OCR (tesseract + language packs).
# tesseract-ocr-tur/eng/ara cover the configured OCR languages.
RUN apt-get update && apt-get install -y --no-install-recommends \
      poppler-utils \
      tesseract-ocr \
      tesseract-ocr-eng \
      tesseract-ocr-tur \
      tesseract-ocr-ara \
      libjpeg62-turbo \
      libpng16-16 \
    && rm -rf /var/lib/apt/lists/*

# ---- dependencies layer ----
FROM base AS deps
WORKDIR /app
RUN pip install --no-cache-dir --upgrade pip
COPY pyproject.toml ./
# Install runtime deps (and OCR extra). Pinned in pyproject for reproducibility.
RUN pip install --no-cache-dir ".[ocr]" || pip install --no-cache-dir \
      "fastapi==0.115.6" "uvicorn[standard]==0.34.0" "pydantic==2.10.4" \
      "pydantic-settings==2.7.1" "python-multipart==0.0.20" "pdfplumber==0.11.4" \
      "pillow==11.1.0" "pytesseract==0.3.13" "pdf2image==1.17.0"

# ---- runtime ----
FROM base AS runtime
# Non-root user.
RUN useradd --create-home --uid 10001 worker
WORKDIR /app
COPY --from=deps /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=deps /usr/local/bin /usr/local/bin
COPY --chown=worker:worker app ./app
COPY --chown=worker:worker pyproject.toml ./

# Writable controlled temp dir; app files stay read-only.
RUN mkdir -p /tmp/menu-imports && chown worker:worker /tmp/menu-imports
USER worker

ENV PYTHONUNBUFFERED=1 \
    MENU_IMPORT_TEMP_DIR=/tmp/menu-imports

EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD python -c "import urllib.request,sys; urllib.request.urlopen('http://127.0.0.1:8000/health'); " || exit 1

# Production server (no --reload).
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
