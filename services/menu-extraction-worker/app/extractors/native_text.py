"""Native text + coordinate extraction using pdfplumber (real for text-based PDFs)."""
from __future__ import annotations

from dataclasses import dataclass

import pdfplumber


@dataclass
class TextLine:
    page: int
    text: str
    x: float
    y: float
    width: float
    height: float
    size: float


def extract_lines(pdf_path: str) -> list[TextLine]:
    """Extract text lines with bounding boxes and font size, preserving page order.

    Coordinates are preserved so the layout stage can reconstruct reading order
    and associate names/descriptions/prices — we never flatten to one string.
    """
    lines: list[TextLine] = []
    with pdfplumber.open(pdf_path) as pdf:
        for page_index, page in enumerate(pdf.pages, start=1):
            words = page.extract_words(extra_attrs=["size"]) or []
            # Group words into lines by their rounded vertical position.
            buckets: dict[int, list[dict]] = {}
            for w in words:
                key = round(float(w["top"]) / 3.0)
                buckets.setdefault(key, []).append(w)
            for key in sorted(buckets):
                row = sorted(buckets[key], key=lambda w: float(w["x0"]))
                if not row:
                    continue
                text = " ".join(str(w["text"]) for w in row).strip()
                if not text:
                    continue
                x0 = min(float(w["x0"]) for w in row)
                x1 = max(float(w["x1"]) for w in row)
                top = min(float(w["top"]) for w in row)
                bottom = max(float(w["bottom"]) for w in row)
                size = max(float(w.get("size", 0) or 0) for w in row)
                lines.append(
                    TextLine(
                        page=page_index,
                        text=text,
                        x=x0,
                        y=top,
                        width=x1 - x0,
                        height=bottom - top,
                        size=size,
                    )
                )
    return lines
