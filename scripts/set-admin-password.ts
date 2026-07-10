/**
 * Set (or change) an admin user's real-auth password.
 *
 *   DATABASE_URL=postgres://... pnpm auth:set-password <email> <password>
 *
 * Hashes the password with scrypt and stores it in admin_users.password_hash.
 * The admin user must already exist (seeded). Used to bootstrap or reset the
 * login for AUTH_MODE=real.
 */
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import postgres from "postgres";
import * as schema from "@/data/db/schema";
import { hashPassword } from "@/lib/auth/password";

async function main() {
  const [email, password] = process.argv.slice(2);
  if (!email || !password) {
    console.error("Usage: pnpm auth:set-password <email> <password>");
    process.exit(1);
  }
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }

  const sql = postgres(url, { max: 1, prepare: false });
  const db = drizzle(sql, { schema });
  try {
    const rows = await db
      .select({ id: schema.adminUsers.id, data: schema.adminUsers.data })
      .from(schema.adminUsers);
    const user = rows.find((r) => r.data.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      console.error(`No admin user with email "${email}". Seed the user first (pnpm db:seed).`);
      process.exit(1);
    }
    const passwordHash = await hashPassword(password);
    await db
      .update(schema.adminUsers)
      .set({ passwordHash })
      .where(eq(schema.adminUsers.id, user.id));
    console.log(`Password set for ${email}. Enable real auth with AUTH_MODE=real.`);
  } finally {
    await sql.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
