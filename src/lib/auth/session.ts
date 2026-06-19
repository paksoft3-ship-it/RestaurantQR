import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { authConfig } from "./config";
import type { Role } from "@/domain/permissions";

export interface SessionPayload {
  userId: string;
  email: string;
  role: Role;
  exp: number; // epoch seconds
}

function b64url(input: string): string {
  return Buffer.from(input, "utf8").toString("base64url");
}

function fromB64url(input: string): string {
  return Buffer.from(input, "base64url").toString("utf8");
}

function sign(data: string): string {
  return createHmac("sha256", authConfig.secret).update(data).digest("base64url");
}

/** Encode and sign a session payload into an opaque token. */
export function encodeSession(payload: SessionPayload): string {
  const body = b64url(JSON.stringify(payload));
  const sig = sign(body);
  return `${body}.${sig}`;
}

/** Verify and decode a token, returning null if invalid or expired. */
export function decodeSession(token: string | undefined | null): SessionPayload | null {
  if (!token || !authConfig.secret) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = sign(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(fromB64url(body)) as SessionPayload;
    if (typeof payload.exp !== "number" || payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}
