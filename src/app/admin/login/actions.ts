"use server";

import { redirect } from "next/navigation";
import { signIn } from "@/lib/auth";
import { routes } from "@/lib/routes";
import { loginSchema } from "@/domain/schemas";

export interface SignInActionState {
  ok: boolean;
  error?: string;
}

/**
 * Server action for the admin login form. Validates input, attempts sign-in and
 * redirects to the dashboard on success. Always returns a GENERIC error on
 * failure (never reveals which factor was wrong).
 */
export async function signInAction(
  _prev: SignInActionState,
  formData: FormData,
): Promise<SignInActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    keepSignedIn: formData.get("keepSignedIn") === "on",
  });

  if (!parsed.success) {
    return { ok: false, error: "Invalid email or password." };
  }

  const result = await signIn(parsed.data.email, parsed.data.password);

  if (!result.ok) {
    // Generic message regardless of reason — do not disclose specifics.
    return { ok: false, error: "Invalid email or password." };
  }

  redirect(routes.admin.dashboard());
}
