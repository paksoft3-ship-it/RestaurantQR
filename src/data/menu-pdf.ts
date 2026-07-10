import "server-only";
import { eq } from "drizzle-orm";
import { getDb, isDatabaseConfigured, schema } from "@/data/db/client";

export interface MenuPdfMeta {
  filename: string;
  fileSize: number;
  uploadedAt: string;
}

/** Lightweight metadata for a restaurant's uploaded menu PDF (never the bytes). */
export async function getMenuPdfMeta(restaurantId: string): Promise<MenuPdfMeta | null> {
  if (!isDatabaseConfigured()) return null;
  const [row] = await getDb()
    .select({
      filename: schema.menuPdfs.filename,
      fileSize: schema.menuPdfs.fileSize,
      uploadedAt: schema.menuPdfs.uploadedAt,
    })
    .from(schema.menuPdfs)
    .where(eq(schema.menuPdfs.restaurantId, restaurantId))
    .limit(1);
  return row ?? null;
}
