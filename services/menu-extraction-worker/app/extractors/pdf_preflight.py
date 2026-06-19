"""PDF preflight: classify the document and decide whether OCR is required."""
from __future__ import annotations

from dataclasses import dataclass

import pdfplumber


@dataclass
class Preflight:
    page_count: int
    has_text_layer: bool
    requires_ocr: bool
    pdf_type: str  # text | scanned | mixed | unknown
    avg_chars_per_page: float


def preflight(pdf_path: str) -> Preflight:
    with pdfplumber.open(pdf_path) as pdf:
        pages = pdf.pages
        page_count = len(pages)
        total_chars = 0
        text_pages = 0
        for page in pages:
            text = page.extract_text() or ""
            n = len(text.strip())
            total_chars += n
            if n > 40:  # heuristic: meaningful text layer present
                text_pages += 1

    avg = total_chars / page_count if page_count else 0
    has_text = text_pages > 0
    if page_count == 0:
        pdf_type = "unknown"
    elif text_pages == page_count:
        pdf_type = "text"
    elif text_pages == 0:
        pdf_type = "scanned"
    else:
        pdf_type = "mixed"
    requires_ocr = pdf_type in ("scanned", "mixed")
    return Preflight(
        page_count=page_count,
        has_text_layer=has_text,
        requires_ocr=requires_ocr,
        pdf_type=pdf_type,
        avg_chars_per_page=avg,
    )
