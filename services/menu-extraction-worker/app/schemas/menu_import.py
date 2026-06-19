"""
Pydantic mirror of the canonical menu-import schema (v1.0.0).

This MUST stay aligned with the TypeScript Zod schema in
src/domain/menu-import/schema.ts. Alignment is checked by tests against the
shared JSON example in docs/menu-pdf-import.md.
"""
from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

SCHEMA_VERSION = "1.0.0"

ExtractionMethod = Literal[
    "native-text", "ocr", "layout", "vision-ai", "manual", "demo-synthetic"
]
PriceType = Literal["BASE", "VARIANT", "PROMOTIONAL", "ORIGINAL"]
PdfType = Literal["text", "scanned", "mixed", "unknown"]
WarningSeverity = Literal["INFO", "REVIEW", "BLOCKING"]
CandidateReviewState = Literal["pending", "approved", "rejected", "edited"]


class BoundingBox(BaseModel):
    x: float
    y: float
    width: float
    height: float


class Provenance(BaseModel):
    page: int
    boundingBox: BoundingBox | None = None
    method: ExtractionMethod
    originalText: str | None = None


class StringField(BaseModel):
    value: str
    confidence: float = Field(ge=0, le=1)
    source: Provenance | None = None
    manuallyCorrected: bool = False


class MoneyAmount(BaseModel):
    amount: float = Field(ge=0)
    currency: str


class ImportPrice(BaseModel):
    originalText: str
    amount: float = Field(ge=0)
    currency: str
    type: PriceType = "BASE"
    confidence: float = Field(ge=0, le=1)
    source: Provenance | None = None


class ImportVariant(BaseModel):
    name: str
    price: MoneyAmount
    confidence: float | None = None


class ImportAddOn(BaseModel):
    name: str
    price: MoneyAmount | None = None
    confidence: float | None = None


class ImportImageRef(BaseModel):
    assetCandidateId: str
    temporaryUrl: str
    confidence: float = Field(ge=0, le=1)
    requiresReview: bool = True
    matchingSignals: list[str] = []


class ImportWarning(BaseModel):
    id: str
    entityType: Literal["restaurant", "category", "product", "price", "image", "page"]
    entityCandidateId: str | None = None
    field: str | None = None
    severity: WarningSeverity
    code: str
    message: str
    suggestedCorrection: str | None = None
    resolved: bool = False
    resolvedBy: str | None = None
    resolvedAt: str | None = None


class ProductCandidate(BaseModel):
    candidateId: str
    proposedId: str
    name: StringField
    description: StringField | None = None
    basePrice: ImportPrice | None = None
    image: ImportImageRef | None = None
    variants: list[ImportVariant] = []
    addOns: list[ImportAddOn] = []
    ingredients: list[str] = []
    allergens: list[str] = []
    dietaryLabels: list[str] = []
    available: bool = True
    displayOrder: int = 0
    source: Provenance | None = None
    confidence: float = Field(ge=0, le=1)
    reviewState: CandidateReviewState = "pending"
    selectedForImport: bool = True
    warnings: list[str] = []


class CategoryCandidate(BaseModel):
    candidateId: str
    proposedId: str
    name: StringField
    description: StringField | None = None
    image: ImportImageRef | None = None
    displayOrder: int = 0
    sourcePages: list[int] = []
    confidence: float = Field(ge=0, le=1)
    reviewState: CandidateReviewState = "pending"
    selectedForImport: bool = True
    items: list[ProductCandidate] = []


class ImportStatistics(BaseModel):
    categoryCount: int = 0
    productCount: int = 0
    imageCount: int = 0
    pagesProcessed: int = 0
    pagesRequiringOcr: int = 0
    productsWithoutCategory: int = 0
    productsWithoutPrice: int = 0
    unassignedImages: int = 0
    highConfidenceFields: int = 0
    mediumConfidenceFields: int = 0
    lowConfidenceFields: int = 0
    blockingWarnings: int = 0
    reviewWarnings: int = 0
    manualCorrections: int = 0
    aiAssistedPages: int = 0
    failedPages: int = 0
    estimatedCompleteness: float = Field(default=0, ge=0, le=1)


class ImportSource(BaseModel):
    fileName: str
    pageCount: int
    pdfType: PdfType
    detectedLanguages: list[str] = []
    detectedCurrencies: list[str] = []
    processedAt: str


class RestaurantInfo(BaseModel):
    name: StringField | None = None
    currency: str
    defaultLanguage: str


class ImportResult(BaseModel):
    schemaVersion: Literal["1.0.0"] = SCHEMA_VERSION
    importId: str
    restaurantId: str
    source: ImportSource
    restaurant: RestaurantInfo
    categories: list[CategoryCandidate] = []
    unassignedCandidates: list[ProductCandidate] = []
    warnings: list[ImportWarning] = []
    statistics: ImportStatistics


class ProcessRequest(BaseModel):
    """Internal job payload from the Next.js app (validated with Pydantic)."""

    importId: str
    restaurantId: str
    fileName: str
    pdfBase64: str | None = None
    pdfUrl: str | None = None
    config: dict = {}
