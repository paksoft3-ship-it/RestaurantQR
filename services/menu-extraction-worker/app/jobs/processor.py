"""
Pipeline orchestrator.

Implements a REAL (if intentionally simple) deterministic extractor for
text-based PDFs: preflight -> native text + coordinates -> typography-based
category/product detection -> price normalization -> ImportResult.

OCR (scanned pages), advanced visual layout analysis, image extraction/matching
and AI assistance are PLUGGABLE and currently raise NotImplementedError or no-op.
They are wired here so the production implementation slots in without changing the
contract. We never fabricate a "complete" extraction for scanned PDFs.
"""
from __future__ import annotations

import re
from datetime import datetime, timezone

from app.core.config import settings
from app.extractors.native_text import TextLine, extract_lines
from app.extractors.pdf_preflight import preflight
from app.normalization.prices import parse_price
from app.providers.deterministic import DeterministicProvider
from app.schemas.menu_import import (
    SCHEMA_VERSION,
    CategoryCandidate,
    ImportPrice,
    ImportResult,
    ImportSource,
    ImportStatistics,
    ImportWarning,
    Provenance,
    ProductCandidate,
    RestaurantInfo,
    StringField,
)

_PRICE_LINE = re.compile(r"\d[\d.,]*\s*(?:₺|TL|€|\$|£|TRY|EUR|USD|GBP)?$")


def _slug(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def process_pdf(import_id: str, restaurant_id: str, file_name: str, pdf_path: str) -> ImportResult:
    pf = preflight(pdf_path)

    warnings: list[ImportWarning] = []
    if pf.requires_ocr:
        # Honest: we do not silently fabricate scanned-page content here.
        warnings.append(
            ImportWarning(
                id="w_ocr_required",
                entityType="page",
                severity="REVIEW",
                code="OCR_LOW_CONFIDENCE",
                message=(
                    "This PDF needs OCR for some/all pages. OCR is not enabled in this "
                    "build — enable the 'ocr' extra + tesseract/poppler, then re-run."
                ),
            )
        )

    lines: list[TextLine] = extract_lines(pdf_path) if pf.has_text_layer else []
    sizes = sorted({round(ln.size, 1) for ln in lines if ln.size}, reverse=True)
    heading_size = sizes[0] if sizes else 0.0

    categories: list[CategoryCandidate] = []
    current: CategoryCandidate | None = None
    high = med = low = 0

    def bump(conf: float) -> None:
        nonlocal high, med, low
        if conf >= settings.confidence_high:
            high += 1
        elif conf >= settings.confidence_medium:
            med += 1
        else:
            low += 1

    for ln in lines:
        is_heading = heading_size and ln.size >= heading_size - 0.5 and not _PRICE_LINE.search(ln.text)
        box = {"x": ln.x, "y": ln.y, "width": ln.width, "height": ln.height}
        prov = Provenance(page=ln.page, boundingBox=box, method="native-text", originalText=ln.text)
        if is_heading and len(ln.text) <= 40:
            conf = 0.92
            bump(conf)
            current = CategoryCandidate(
                candidateId=f"cat_{len(categories) + 1}",
                proposedId=f"cat-{_slug(ln.text)}",
                name=StringField(value=ln.text, confidence=conf, source=prov),
                displayOrder=len(categories) + 1,
                sourcePages=[ln.page],
                confidence=conf,
                items=[],
            )
            categories.append(current)
            continue

        price = parse_price(ln.text)
        if price and current is not None:
            name = _PRICE_LINE.sub("", ln.text).strip(" .-") or ln.text
            name_conf = 0.85
            bump(name_conf)
            bump(price.confidence)
            current.items.append(
                ProductCandidate(
                    candidateId=f"item_{restaurant_id}_{len(current.items) + 1}",
                    proposedId=f"item-{_slug(name)}",
                    name=StringField(value=name, confidence=name_conf, source=prov),
                    basePrice=ImportPrice(
                        originalText=ln.text,
                        amount=price.amount,
                        currency=price.currency or "TRY",
                        confidence=price.confidence,
                        source=prov,
                    ),
                    displayOrder=len(current.items) + 1,
                    source=prov,
                    confidence=min(name_conf, price.confidence),
                )
            )
            if not price.currency:
                warnings.append(
                    ImportWarning(
                        id=f"w_cur_{len(warnings)}",
                        entityType="price",
                        entityCandidateId=current.items[-1].candidateId,
                        field="basePrice",
                        severity="REVIEW",
                        code="PRICE_CURRENCY_MISSING",
                        message=f"No currency detected for '{ln.text}'.",
                    )
                )

    # Optional AI normalization (no-op by default).
    _provider = DeterministicProvider()  # noqa: F841  (wired for production swap)

    product_count = sum(len(c.items) for c in categories)
    total_fields = max(1, high + med + low)
    return ImportResult(
        schemaVersion=SCHEMA_VERSION,
        importId=import_id,
        restaurantId=restaurant_id,
        source=ImportSource(
            fileName=file_name,
            pageCount=pf.page_count,
            pdfType=pf.pdf_type,  # type: ignore[arg-type]
            detectedLanguages=[],
            detectedCurrencies=[],
            processedAt=_now(),
        ),
        restaurant=RestaurantInfo(name=None, currency="TRY", defaultLanguage="en"),
        categories=categories,
        unassignedCandidates=[],
        warnings=warnings,
        statistics=ImportStatistics(
            categoryCount=len(categories),
            productCount=product_count,
            pagesProcessed=pf.page_count,
            pagesRequiringOcr=pf.page_count if pf.requires_ocr else 0,
            highConfidenceFields=high,
            mediumConfidenceFields=med,
            lowConfidenceFields=low,
            blockingWarnings=sum(1 for w in warnings if w.severity == "BLOCKING"),
            reviewWarnings=sum(1 for w in warnings if w.severity == "REVIEW"),
            estimatedCompleteness=round(1 - low / total_fields, 2) if product_count else 0.0,
        ),
    )
