import { importConfigSchema, type ImportConfig } from "@/domain/menu-import";
import { validateImportResult } from "@/features/menu-import/validation";
import { ocrPdf, OcrToolingError } from "@/features/menu-import/worker/tesseract-runner";
import { parseOcrToResult } from "@/features/menu-import/worker/ocr-parser";

/**
 * Real PDF menu extraction endpoint (Node runtime).
 *
 * Accepts the uploaded PDF, runs on-device OCR (pdftoppm + Tesseract), and parses
 * the text into a reviewable ImportResult. Nothing is persisted or published here
 * — the client stores the draft and a human reviews it before commit.
 */

export const runtime = "nodejs";
export const maxDuration = 120;

const MAX_BYTES = 25 * 1024 * 1024;

function resolveCurrency(config: ImportConfig): string {
  // No symbol survives OCR reliably; default "auto" to USD for this platform.
  return config.currency === "auto" ? "USD" : config.currency;
}

function resolveLanguage(config: ImportConfig): string {
  return config.defaultLanguage === "auto" ? "en" : config.defaultLanguage;
}

export async function POST(request: Request): Promise<Response> {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "Expected multipart/form-data." }, { status: 400 });
  }

  const file = form.get("file");
  const importId = String(form.get("importId") ?? "");
  const restaurantId = String(form.get("restaurantId") ?? "");
  const rawConfig = form.get("config");

  if (!(file instanceof File)) {
    return Response.json({ error: "No PDF file provided." }, { status: 400 });
  }
  if (!importId || !restaurantId) {
    return Response.json({ error: "Missing importId or restaurantId." }, { status: 400 });
  }
  if (file.type && file.type !== "application/pdf") {
    return Response.json({ error: "Only application/pdf is supported." }, { status: 415 });
  }
  if (file.size > MAX_BYTES) {
    return Response.json({ error: "PDF exceeds the size limit." }, { status: 413 });
  }

  let config: ImportConfig;
  try {
    config = importConfigSchema.parse(rawConfig ? JSON.parse(String(rawConfig)) : {});
  } catch {
    return Response.json({ error: "Invalid import configuration." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let ocr;
  try {
    ocr = await ocrPdf(buffer);
  } catch (err) {
    if (err instanceof OcrToolingError) {
      return Response.json(
        { error: err.message, errorCode: "OCR_FAILED", tool: err.tool },
        { status: 503 },
      );
    }
    return Response.json(
      { error: "OCR failed while reading the PDF.", errorCode: "OCR_FAILED" },
      { status: 500 },
    );
  }

  const result = parseOcrToResult({
    importId,
    restaurantId,
    fileName: file.name,
    pages: ocr.pages,
    pageCount: ocr.pageCount,
    pdfType: "scanned",
    currency: resolveCurrency(config),
    defaultLanguage: resolveLanguage(config),
  });

  // Guard against producing an invalid draft.
  const validation = validateImportResult(result);
  if (validation.schemaErrors.length > 0) {
    return Response.json(
      { error: "Extraction produced an invalid result.", details: validation.schemaErrors },
      { status: 500 },
    );
  }

  return Response.json({ result });
}
