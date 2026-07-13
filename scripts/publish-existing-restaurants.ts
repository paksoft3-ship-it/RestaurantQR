/**
 * One-off migration helper: mark specific existing restaurants as `published`.
 *
 * Context: the public restaurant route now hides anything that isn't
 * `published`. This helper lists current restaurants and can publish an
 * explicit set of slugs (never bulk-publishes, so test/junk restaurants are
 * never made public by accident). New restaurants created after the gate start
 * as `draft` and stay hidden until an admin presses Publish.
 *
 * Usage (reads DATABASE_URL from the environment or .env.local):
 *   tsx scripts/publish-existing-restaurants.ts                       # list all + status
 *   tsx scripts/publish-existing-restaurants.ts --apply slugA slugB   # publish those slugs
 *
 * Idempotent: a slug that is already published is left unchanged; archived
 * restaurants are refused (unarchive them in the admin first).
 */
import { readFileSync } from "node:fs";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/data/db/schema";
import type { Restaurant } from "@/domain/entities";

function loadDatabaseUrl(): string {
  const fromEnv = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
  if (fromEnv && fromEnv.trim()) return fromEnv.trim();
  try {
    const raw = readFileSync(".env.local", "utf8");
    for (const key of ["DATABASE_URL", "POSTGRES_URL"]) {
      const match = raw.match(new RegExp(`^${key}=(.*)$`, "m"));
      if (match) return match[1].trim().replace(/^["']|["']$/g, "");
    }
  } catch {
    // no .env.local — fall through
  }
  console.error("DATABASE_URL is not set (env or .env.local). Aborting.");
  process.exit(1);
}

async function main() {
  const apply = process.argv.includes("--apply");
  const slugs = process.argv.slice(2).filter((a) => a !== "--apply");
  const wanted = new Set(slugs);
  const sql = postgres(loadDatabaseUrl(), { max: 1, prepare: false });
  const db = drizzle(sql, { schema });

  try {
    const rows = await db
      .select({ id: schema.restaurants.id, data: schema.restaurants.data })
      .from(schema.restaurants);

    console.log(`Found ${rows.length} restaurant(s):`);
    const toPublish: { id: string; data: Restaurant }[] = [];
    for (const row of rows) {
      const r = row.data as Restaurant;
      const targeted = wanted.has(r.slug);
      const eligible = targeted && r.publishingStatus !== "published" && r.publishingStatus !== "archived";
      const note = !targeted
        ? ""
        : r.publishingStatus === "published"
          ? " (already published)"
          : r.publishingStatus === "archived"
            ? " (archived — refused)"
            : " -> published";
      console.log(`  ${r.slug.padEnd(24)} ${r.publishingStatus.padEnd(16)}${note}`);
      if (eligible) toPublish.push({ id: row.id, data: r });
    }

    if (!apply || wanted.size === 0) {
      console.log(
        wanted.size === 0
          ? "\nNo slugs given — listing only. Pass: --apply <slug> [<slug> …] to publish specific restaurants."
          : `\nDry run: ${toPublish.length} restaurant(s) would be published. Add --apply to perform it.`,
      );
      return;
    }

    for (const { id, data } of toPublish) {
      const next: Restaurant = {
        ...data,
        publishingStatus: "published",
        updatedAt: new Date().toISOString(),
      };
      await db
        .update(schema.restaurants)
        .set({ publishingStatus: "published", updatedAt: next.updatedAt, data: next })
        .where(eq(schema.restaurants.id, id));
    }
    console.log(`\nPublished ${toPublish.length} restaurant(s): ${toPublish.map((t) => t.data.slug).join(", ") || "(none)"}`);
  } finally {
    await sql.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
