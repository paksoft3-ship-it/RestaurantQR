"use client";

import { upload } from "@vercel/blob/client";

/**
 * Upload an image to Vercel Blob and return its public URL, or `null` if Blob
 * isn't configured / the upload failed (callers fall back to a local preview).
 *
 * `prefix` groups files, e.g. "products", "branding", "media".
 */
export async function uploadImage(file: File, prefix: string): Promise<string | null> {
  try {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const result = await upload(`${prefix}/${safeName}`, file, {
      access: "public",
      handleUploadUrl: "/api/blob/upload",
    });
    return result.url;
  } catch {
    return null;
  }
}
