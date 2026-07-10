import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { getCurrentAdminUser } from "@/lib/auth";
import { getDb, isDatabaseConfigured, schema } from "@/data/db/client";
import { getMenuPdfMeta } from "@/data/menu-pdf";

/**
 * Menu PDF upload / serve. Stores one PDF per restaurant in the database (no
 * external object storage). Works on Vercel serverless (no system binaries).
 *
 * - GET            → serve the PDF (public); GET ?meta=1 → JSON metadata
 * - POST (admin)   → upload/replace the PDF (multipart form-data, field "file")
 * - DELETE (admin) → remove the PDF
 */
export const runtime = "nodejs";

// Vercel serverless request bodies are capped (~4.5 MB); keep uploads under it.
const MAX_BYTES = 4 * 1024 * 1024;

type Params = { params: Promise<{ restaurantSlug: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  if (!isDatabaseConfigured()) return new NextResponse("Not found", { status: 404 });
  const { restaurantSlug: restaurantId } = await params;

  if (req.nextUrl.searchParams.get("meta") === "1") {
    return NextResponse.json(await getMenuPdfMeta(restaurantId));
  }

  const [row] = await getDb()
    .select()
    .from(schema.menuPdfs)
    .where(eq(schema.menuPdfs.restaurantId, restaurantId))
    .limit(1);
  if (!row) return new NextResponse("Not found", { status: 404 });

  const bytes = Buffer.from(row.contentBase64, "base64");
  return new NextResponse(bytes, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${row.filename.replace(/["\r\n]/g, "")}"`,
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(req: NextRequest, { params }: Params) {
  const user = await getCurrentAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "A database must be configured to store uploads." }, { status: 400 });
  }
  const { restaurantSlug: restaurantId } = await params;

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "Only PDF files are allowed." }, { status: 415 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "PDF must be 4 MB or smaller." }, { status: 413 });
  }
  const bytes = Buffer.from(await file.arrayBuffer());
  // Verify the PDF magic header.
  if (bytes.subarray(0, 5).toString("latin1") !== "%PDF-") {
    return NextResponse.json({ error: "File does not look like a valid PDF." }, { status: 415 });
  }

  const record = {
    restaurantId,
    filename: file.name,
    fileSize: file.size,
    contentBase64: bytes.toString("base64"),
    uploadedAt: new Date().toISOString(),
  };
  await getDb()
    .insert(schema.menuPdfs)
    .values(record)
    .onConflictDoUpdate({
      target: schema.menuPdfs.restaurantId,
      set: {
        filename: record.filename,
        fileSize: record.fileSize,
        contentBase64: record.contentBase64,
        uploadedAt: record.uploadedAt,
      },
    });

  return NextResponse.json({
    ok: true,
    filename: record.filename,
    fileSize: record.fileSize,
    uploadedAt: record.uploadedAt,
  });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const user = await getCurrentAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { restaurantSlug: restaurantId } = await params;
  if (isDatabaseConfigured()) {
    await getDb().delete(schema.menuPdfs).where(eq(schema.menuPdfs.restaurantId, restaurantId));
  }
  return NextResponse.json({ ok: true });
}
