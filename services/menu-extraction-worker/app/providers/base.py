"""Provider-agnostic AI abstraction. No keys in source; structured output only."""
from __future__ import annotations

from typing import Protocol

from app.schemas.menu_import import ImportResult


class MenuExtractionAIProvider(Protocol):
    async def analyze_page(self, page: int, text: str, image_refs: list[str]) -> dict: ...

    async def normalize_menu(self, draft: ImportResult) -> ImportResult: ...

    async def validate_associations(
        self, pairs: list[tuple[str, str]]
    ) -> list[tuple[str, str, float]]: ...
