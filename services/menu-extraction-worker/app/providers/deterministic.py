"""Deterministic no-op AI provider (default; used when AI is disabled and in tests)."""
from __future__ import annotations

from app.schemas.menu_import import ImportResult


class DeterministicProvider:
    async def analyze_page(self, page: int, text: str, image_refs: list[str]) -> dict:
        return {"blocks": [], "confidence": 0.0}

    async def normalize_menu(self, draft: ImportResult) -> ImportResult:
        return draft

    async def validate_associations(
        self, pairs: list[tuple[str, str]]
    ) -> list[tuple[str, str, float]]:
        return [(a, b, 0.0) for a, b in pairs]
