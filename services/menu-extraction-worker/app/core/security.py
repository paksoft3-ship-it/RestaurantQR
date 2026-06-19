"""Service-to-service authentication. The worker is never exposed to public users."""
from __future__ import annotations

import hmac

from fastapi import Header, HTTPException, status

from app.core.config import settings


async def require_worker_auth(x_worker_secret: str = Header(default="")) -> None:
    """Constant-time comparison of the shared worker secret."""
    expected = settings.worker_secret
    if not expected or not hmac.compare_digest(x_worker_secret, expected):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid worker credentials",
        )
