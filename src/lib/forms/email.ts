import "server-only";

interface SendArgs {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

export interface SendResult {
  sent: boolean;
  id?: string;
  reason?: string;
}

/** Where admin notification emails are delivered. */
export function notifyAddress(): string | null {
  return (
    process.env.ENQUIRY_NOTIFY_EMAIL ||
    process.env.EMAIL_FROM ||
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL ||
    null
  );
}

export function emailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

/**
 * Send a transactional email via the Resend REST API. No SDK dependency — just
 * fetch. A no-op (sent:false, reason "not-configured") when RESEND_API_KEY /
 * EMAIL_FROM are unset, so callers degrade gracefully. Never throws.
 */
export async function sendEmail(args: SendArgs): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from) return { sent: false, reason: "not-configured" };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [args.to],
        subject: args.subject,
        html: args.html,
        ...(args.replyTo ? { reply_to: args.replyTo } : {}),
      }),
    });
    if (!res.ok) return { sent: false, reason: `http_${res.status}` };
    const data = (await res.json().catch(() => ({}))) as { id?: string };
    return { sent: true, id: data.id };
  } catch {
    return { sent: false, reason: "error" };
  }
}

/** Minimal HTML escaping for values interpolated into email bodies. */
export function esc(value: unknown): string {
  const s = value === null || value === undefined ? "" : String(value);
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
