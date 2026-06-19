"""Price normalization — Python mirror of src/features/menu-import/price-normalization.ts.

Kept aligned via tests (tests/test_prices.py). Never silently converts currencies.
"""
from __future__ import annotations

import re
from dataclasses import dataclass

CURRENCY_BY_SYMBOL = {"₺": "TRY", "TL": "TRY", "€": "EUR", "$": "USD", "£": "GBP"}
_NUMBER_RE = re.compile(r"\d[\d.,-]*")


@dataclass
class ParsedPrice:
    amount: float
    currency: str | None
    original_text: str
    confidence: float


def detect_currency(text: str) -> str | None:
    for symbol, code in CURRENCY_BY_SYMBOL.items():
        if symbol in text:
            return code
    m = re.search(r"\b(TRY|EUR|USD|GBP)\b", text, re.IGNORECASE)
    return m.group(1).upper() if m else None


def normalize_number(token: str) -> float | None:
    t = re.sub(r"[^0-9.,-]", "", token).strip()
    if not t:
        return None
    t = re.sub(r",-$", "", t)
    has_comma, has_dot = "," in t, "." in t
    if has_comma and has_dot:
        if t.rfind(",") > t.rfind("."):
            t = t.replace(".", "").replace(",", ".")
        else:
            t = t.replace(",", "")
    elif has_comma:
        t = t.replace(",", ".") if re.search(r",\d{2}$", t) else t.replace(",", "")
    try:
        return float(t)
    except ValueError:
        return None


def parse_price(text: str, default_currency: str | None = None) -> ParsedPrice | None:
    original = text.strip()
    if not original:
        return None
    currency = detect_currency(original) or default_currency
    tokens = _NUMBER_RE.findall(original)
    if not tokens:
        return None
    amount = normalize_number(tokens[0])
    if amount is None:
        return None
    confidence = 0.95
    if not currency:
        confidence -= 0.15
    if len(tokens) > 1:
        confidence -= 0.10
    if amount > 100000 or amount == 0:
        confidence -= 0.20
    confidence = max(0.0, round(confidence, 2))
    return ParsedPrice(amount=amount, currency=currency, original_text=original, confidence=confidence)
