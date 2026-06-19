"""
YourPlatform menu-extraction worker (FastAPI).

Internal, service-to-service only — never exposed to public users. Validates every
payload with Pydantic. Heavy processing belongs here (not in Vercel functions).
"""
from __future__ import annotations

import base64
import os
import tempfile

from fastapi import Depends, FastAPI, HTTPException

from app.core.security import require_worker_auth
from app.jobs.processor import process_pdf
from app.schemas.menu_import import ImportResult, ProcessRequest

app = FastAPI(title="menu-extraction-worker", version="0.1.0")


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}


@app.get("/ready")
async def ready() -> dict:
    return {"status": "ready"}


@app.post("/internal/menu-imports/process", response_model=ImportResult)
async def process(req: ProcessRequest, _: None = Depends(require_worker_auth)) -> ImportResult:
    if not req.pdfBase64 and not req.pdfUrl:
        raise HTTPException(status_code=422, detail="pdfBase64 or pdfUrl is required")

    # Write to a controlled temp file (cleaned up after processing).
    fd, path = tempfile.mkstemp(suffix=".pdf")
    try:
        if req.pdfBase64:
            with os.fdopen(fd, "wb") as fh:
                fh.write(base64.b64decode(req.pdfBase64))
        else:
            os.close(fd)
            raise HTTPException(status_code=501, detail="pdfUrl fetching not implemented in scaffold")
        return process_pdf(req.importId, req.restaurantId, req.fileName, path)
    finally:
        try:
            os.remove(path)
        except OSError:
            pass


@app.get("/internal/menu-imports/{import_id}/health")
async def import_health(import_id: str, _: None = Depends(require_worker_auth)) -> dict:
    # Stateless scaffold: job state lives in the app's store/queue.
    return {"importId": import_id, "status": "unknown"}
