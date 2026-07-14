import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { getCurrentAdminUser } from "@/lib/auth";
import { addViaMarker } from "@/lib/analytics/via";

export const runtime = "nodejs";

/**
 * Generate downloadable QR-code artwork (SVG) for a destination URL. Admin-only
 * — this is staff tooling for the managed service, not a public QR generator.
 */
export async function GET(request: Request) {
  const admin = await getCurrentAdminUser();
  if (!admin) return new NextResponse("Unauthorized", { status: 401 });

  const url = new URL(request.url);
  const text = url.searchParams.get("text")?.trim();
  const name = (url.searchParams.get("name") || "qr-code").replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 64);
  if (!text) return new NextResponse("Missing text", { status: 400 });

  // Ensure the encoded URL carries the QR attribution marker.
  const encoded = addViaMarker(text, "qr");

  try {
    const svg = await QRCode.toString(encoded, {
      type: "svg",
      margin: 2,
      width: 512,
      errorCorrectionLevel: "M",
      color: { dark: "#111827", light: "#FFFFFF" },
    });
    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Content-Disposition": `attachment; filename="${name}.svg"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return new NextResponse("Failed to generate QR", { status: 500 });
  }
}
