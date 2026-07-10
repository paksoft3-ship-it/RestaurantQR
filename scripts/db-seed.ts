/**
 * Seed the database from the canonical seed data in `src/data/seed`.
 *
 * Usage:
 *   DATABASE_URL=postgres://... pnpm db:seed
 *
 * The script clears the seeded tables and re-inserts the full seed set, so it
 * is safe to re-run. It does NOT run schema migrations — run `pnpm db:migrate`
 * (or `pnpm db:push`) first.
 *
 * This runs under tsx (plain Node), so it opens its own postgres connection and
 * never imports the `server-only` DB client.
 */
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/data/db/schema";
import {
  seedActivity,
  seedAdminUsers,
  seedBranding,
  seedCampaigns,
  seedCategories,
  seedCustomerActions,
  seedEnquiries,
  seedFaqEntries,
  seedLegalPages,
  seedLocations,
  seedMedia,
  seedNFCProducts,
  seedOpeningHours,
  seedPackages,
  seedProducts,
  seedQRCodes,
  seedRestaurants,
  seedSettings,
  seedTeam,
  seedTemplates,
  seedWebsiteContent,
} from "@/data/seed";
import { PLATFORM_SETTINGS_ID } from "@/data/db/schema";
import { hashPassword } from "@/lib/auth/password";

function requireUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url || url.trim().length === 0) {
    console.error("DATABASE_URL is not set. Aborting seed.");
    process.exit(1);
  }
  return url;
}

async function main() {
  const sql = postgres(requireUrl(), { max: 1, prepare: false });
  const db = drizzle(sql, { schema });

  try {
    console.log("Clearing seeded tables…");
    // Order does not matter — there are no FK constraints between these tables.
    await db.delete(schema.activity);
    await db.delete(schema.media);
    await db.delete(schema.enquiries);
    await db.delete(schema.nfcProducts);
    await db.delete(schema.qrCodes);
    await db.delete(schema.campaigns);
    await db.delete(schema.customerActions);
    await db.delete(schema.menuProducts);
    await db.delete(schema.menuCategories);
    await db.delete(schema.branding);
    await db.delete(schema.openingHours);
    await db.delete(schema.restaurantLocations);
    await db.delete(schema.adminUsers);
    await db.delete(schema.restaurants);
    await db.delete(schema.team);
    await db.delete(schema.websiteContent);
    await db.delete(schema.templates);
    await db.delete(schema.packages);
    await db.delete(schema.faqEntries);
    await db.delete(schema.legalPages);
    await db.delete(schema.menuImports);
    await db.delete(schema.platformSettings);

    console.log("Inserting seed data…");

    await db.insert(schema.restaurants).values(
      seedRestaurants.map((r) => ({
        id: r.id,
        internalId: r.internalId,
        slug: r.slug,
        name: r.name,
        operationalStatus: r.operationalStatus,
        publishingStatus: r.publishingStatus,
        setupStatus: r.setupStatus,
        visualDirection: r.visualDirection,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        data: r,
      })),
    );

    await db.insert(schema.restaurantLocations).values(
      seedLocations.map((l) => ({ id: l.id, restaurantId: l.restaurantId, data: l })),
    );

    const openingHoursRows = Object.entries(seedOpeningHours).flatMap(([restaurantId, hours]) =>
      hours.map((h, index) => ({ restaurantId, day: h.day, sortOrder: index, data: h })),
    );
    if (openingHoursRows.length) await db.insert(schema.openingHours).values(openingHoursRows);

    await db.insert(schema.branding).values(
      seedBranding.map((b) => ({ restaurantId: b.restaurantId, data: b })),
    );

    await db.insert(schema.menuCategories).values(
      seedCategories.map((c) => ({
        id: c.id,
        restaurantId: c.restaurantId,
        sortOrder: c.sortOrder,
        status: c.status,
        data: c,
      })),
    );

    await db.insert(schema.menuProducts).values(
      seedProducts.map((p) => ({
        id: p.id,
        restaurantId: p.restaurantId,
        categoryId: p.categoryId,
        slug: p.slug,
        sortOrder: p.sortOrder,
        data: p,
      })),
    );

    await db.insert(schema.customerActions).values(
      seedCustomerActions.map((a) => ({
        id: a.id,
        restaurantId: a.restaurantId,
        type: a.type,
        enabled: a.enabled,
        status: a.status,
        sortOrder: a.sortOrder,
        data: a,
      })),
    );

    await db.insert(schema.campaigns).values(
      seedCampaigns.map((c) => ({
        id: c.id,
        restaurantId: c.restaurantId,
        slug: c.slug,
        status: c.status,
        data: c,
      })),
    );

    if (seedQRCodes.length)
      await db.insert(schema.qrCodes).values(
        seedQRCodes.map((q) => ({ id: q.id, restaurantId: q.restaurantId, data: q })),
      );

    if (seedNFCProducts.length)
      await db.insert(schema.nfcProducts).values(
        seedNFCProducts.map((n) => ({ id: n.id, restaurantId: n.restaurantId, data: n })),
      );

    if (seedEnquiries.length)
      await db.insert(schema.enquiries).values(
        seedEnquiries.map((e) => ({ id: e.id, status: e.status, createdAt: e.createdAt, data: e })),
      );

    if (seedMedia.length)
      await db.insert(schema.media).values(
        seedMedia.map((m) => ({ id: m.id, restaurantId: m.restaurantId, data: m })),
      );

    if (seedActivity.length)
      await db.insert(schema.activity).values(
        seedActivity.map((a) => ({ id: a.id, resourceId: a.resourceId, timestamp: a.timestamp, data: a })),
      );

    // Optionally bootstrap a real-auth password (AUTH_MODE=real) for the seeded
    // admins. Set SEED_ADMIN_PASSWORD to enable login; otherwise passwordHash is
    // left null and must be set later via `pnpm auth:set-password`.
    const seedPw = process.env.SEED_ADMIN_PASSWORD;
    if (seedPw) console.log("Seeding admin password hash(es) from SEED_ADMIN_PASSWORD…");
    await db.insert(schema.adminUsers).values(
      await Promise.all(
        seedAdminUsers.map(async (u) => ({
          id: u.id,
          email: u.email,
          passwordHash: seedPw ? await hashPassword(seedPw) : null,
          data: u,
        })),
      ),
    );

    if (seedTeam.length)
      await db.insert(schema.team).values(
        seedTeam.map((u) => ({ id: u.id, email: u.email, data: u })),
      );

    if (seedWebsiteContent.length)
      await db.insert(schema.websiteContent).values(
        seedWebsiteContent.map((w) => ({
          id: w.id,
          page: w.page,
          section: w.section,
          status: w.status,
          data: w,
        })),
      );

    if (seedTemplates.length)
      await db.insert(schema.templates).values(
        seedTemplates.map((t) => ({ id: t.id, status: t.status, sortOrder: t.sortOrder, data: t })),
      );

    if (seedPackages.length)
      await db.insert(schema.packages).values(
        seedPackages.map((p) => ({ id: p.id, status: p.status, sortOrder: p.sortOrder, data: p })),
      );

    if (seedFaqEntries.length)
      await db.insert(schema.faqEntries).values(
        seedFaqEntries.map((f) => ({
          id: f.id,
          category: f.category,
          status: f.status,
          sortOrder: f.sortOrder,
          data: f,
        })),
      );

    if (seedLegalPages.length)
      await db.insert(schema.legalPages).values(
        seedLegalPages.map((l) => ({
          id: l.id,
          type: l.type,
          locale: l.locale,
          status: l.status,
          data: l,
        })),
      );

    await db.insert(schema.platformSettings).values({ id: PLATFORM_SETTINGS_ID, data: seedSettings });

    console.log("Seed complete.");
  } finally {
    await sql.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
