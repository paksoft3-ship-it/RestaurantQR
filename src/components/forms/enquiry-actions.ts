"use server";
import { getRepositories } from "@/data/repositories";
import { enquirySchema, type EnquiryInput } from "@/domain/schemas";
import { esc, notifyAddress, sendEmail } from "@/lib/forms/email";

/**
 * Persist a public contact-form enquiry so it appears in /admin/enquiries, and
 * email a notification to the team (when email is configured). Re-validates
 * server-side and drops honeypot (spam) submissions.
 */
export async function submitEnquiry(
  input: EnquiryInput,
): Promise<{ ok: boolean; id?: string; emailed?: boolean }> {
  const parsed = enquirySchema.safeParse(input);
  if (!parsed.success) return { ok: false };
  const v = parsed.data;
  if (v.company) return { ok: false }; // honeypot must be empty

  const created = await getRepositories().enquiries.create({
    restaurantName: v.restaurantName,
    contactPerson: v.contactPerson,
    phone: v.phone || null,
    email: v.email,
    city: v.city || null,
    country: v.country || null,
    restaurantType: v.restaurantType ?? null,
    enquiryType: v.enquiryType,
    packageInterest: v.packageInterest || null,
    featureInterest: v.featureInterest ?? [],
    productInterest: v.productInterest ?? [],
    preferredContactMethod: v.preferredContactMethod,
    message: v.message || null,
    assignedTeam: null,
  });

  const to = notifyAddress();
  let emailed = false;
  if (to) {
    const rows: [string, string][] = [
      ["Restaurant", v.restaurantName],
      ["Contact", v.contactPerson],
      ["Email", v.email],
      ["Phone", v.phone || "—"],
      ["Location", [v.city, v.country].filter(Boolean).join(", ") || "—"],
      ["Enquiry type", v.enquiryType],
      ["Preferred contact", v.preferredContactMethod],
      ["Message", v.message || "—"],
    ];
    const html = `
      <h2>New enquiry from ${esc(v.contactPerson)}</h2>
      <table cellpadding="6" style="border-collapse:collapse">
        ${rows
          .map(
            ([k, val]) =>
              `<tr><td style="font-weight:600">${esc(k)}</td><td>${esc(val)}</td></tr>`,
          )
          .join("")}
      </table>`;
    const result = await sendEmail({
      to,
      subject: `New enquiry — ${v.restaurantName}`,
      html,
      replyTo: v.email,
    });
    emailed = result.sent;
  }

  return { ok: true, id: created.id, emailed };
}
