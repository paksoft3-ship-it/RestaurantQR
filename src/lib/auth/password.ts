import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

/**
 * Password hashing for real auth using Node's built-in scrypt — no native
 * dependency, so it works on Vercel serverless. Not `server-only` so seeding
 * scripts can reuse it. scrypt is synchronous here (login is infrequent).
 *
 * Stored format: `scrypt$N$r$p$<saltHex>$<hashHex>`.
 */

const N = 16384; // CPU/memory cost
const R = 8; // block size
const P = 1; // parallelization
const KEYLEN = 64;
const SALT_BYTES = 16;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES);
  const derived = scryptSync(password, salt, KEYLEN, { N, r: R, p: P });
  return `scrypt$${N}$${R}$${P}$${salt.toString("hex")}$${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string | null | undefined): Promise<boolean> {
  if (!stored) return false;
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const [, nStr, rStr, pStr, saltHex, hashHex] = parts;
  const n = Number(nStr);
  const r = Number(rStr);
  const p = Number(pStr);
  if (!Number.isFinite(n) || !Number.isFinite(r) || !Number.isFinite(p)) return false;
  const expected = Buffer.from(hashHex, "hex");
  let derived: Buffer;
  try {
    derived = scryptSync(password, Buffer.from(saltHex, "hex"), expected.length, { N: n, r, p });
  } catch {
    return false;
  }
  return derived.length === expected.length && timingSafeEqual(derived, expected);
}
