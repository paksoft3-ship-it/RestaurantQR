"use server";

import { requireAdminUser } from "@/lib/auth";
import { appConfig } from "@/lib/config/app-config";
import { esc, sendEmail } from "@/lib/forms/email";

/**
 * Email a team-access invitation (admin-gated). No-op-safe: returns
 * { emailed:false } when email isn't configured. The password is shared
 * separately by an administrator (no credentials are ever emailed).
 */
export async function sendTeamInvite(input: {
  email: string;
  displayName: string;
  role: string;
}): Promise<{ emailed: boolean }> {
  await requireAdminUser();
  const loginUrl = `${appConfig.baseUrl}/admin/login`;
  const html = `
    <h2>You've been invited to ${esc(appConfig.appName)}</h2>
    <p>Hi ${esc(input.displayName)}, you've been given <strong>${esc(input.role)}</strong> access to the
      ${esc(appConfig.appName)} admin.</p>
    <p>Sign in at <a href="${esc(loginUrl)}">${esc(loginUrl)}</a>. An administrator will share your
      password with you separately.</p>`;
  const res = await sendEmail({
    to: input.email,
    subject: `You're invited to the ${appConfig.appName} admin`,
    html,
  });
  return { emailed: res.sent };
}
