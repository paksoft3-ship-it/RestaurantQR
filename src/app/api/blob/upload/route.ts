import { NextResponse, type NextRequest } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { getCurrentAdminUser } from "@/lib/auth";

/**
 * Client-upload token endpoint for Vercel Blob. The browser uploads image files
 * directly to Blob (bypassing the serverless body-size limit); this route only
 * issues a short-lived signed token, and only to an authenticated admin.
 *
 * Requires BLOB_READ_WRITE_TOKEN (provisioned by adding a Blob store in Vercel).
 */
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as HandleUploadBody;
  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        const user = await getCurrentAdminUser();
        if (!user) throw new Error("Unauthorized");
        return {
          // All common web image formats (jpg == jpeg). Formats the browser /
          // next-image can actually render, so nothing uploads-but-breaks.
          allowedContentTypes: [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
            "image/gif",
            "image/svg+xml",
            "image/avif",
          ],
          maximumSizeInBytes: 10 * 1024 * 1024,
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {
        // No-op: the client stores the returned URL against the entity.
      },
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 400 },
    );
  }
}
