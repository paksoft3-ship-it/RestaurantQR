"use server";
import { getRepositories } from "@/data/repositories";
import { enquirySchema, type EnquiryInput } from "@/domain/schemas";

/**
 * Persist a public contact-form enquiry so it appears in /admin/enquiries.
 * Re-validates server-side and drops honeypot (spam) submissions.
 */
export async function submitEnquiry(input: EnquiryInput): Promise<{ ok: boolean; id?: string }> {
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
  return { ok: true, id: created.id };
}
