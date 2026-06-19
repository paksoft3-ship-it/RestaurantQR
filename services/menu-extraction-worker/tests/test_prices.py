"""Mirror of the TS price-normalization tests — keeps the two implementations aligned."""
from app.normalization.prices import detect_currency, normalize_number, parse_price


def test_bare_integer_with_default_currency():
    p = parse_price("240", default_currency="TRY")
    assert p is not None and p.amount == 240 and p.currency == "TRY"


def test_currency_detection():
    assert parse_price("240 ₺").currency == "TRY"
    assert parse_price("₺240").currency == "TRY"
    assert parse_price("240 TL").currency == "TRY"
    assert parse_price("€12,50").currency == "EUR"
    assert parse_price("$8.00").currency == "USD"


def test_decimal_and_thousands():
    assert parse_price("240,00 ₺").amount == 240
    assert parse_price("1.250,00 ₺").amount == 1250
    assert parse_price("240.00").amount == 240
    assert parse_price("240,-").amount == 240


def test_confidence_drops_without_currency():
    assert parse_price("240").confidence < parse_price("240 ₺").confidence


def test_multi_value_lowers_confidence():
    assert parse_price("240 / 310 ₺").confidence < parse_price("240 ₺").confidence


def test_non_price_returns_none():
    assert parse_price("Fresh basil") is None
    assert parse_price("") is None


def test_helpers():
    assert detect_currency("12 €") == "EUR"
    assert normalize_number("1.250,00") == 1250
