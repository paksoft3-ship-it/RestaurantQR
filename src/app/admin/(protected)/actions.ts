"use server";

import { redirect } from "next/navigation";
import { signOut } from "@/lib/auth";
import { routes } from "@/lib/routes";

/** Server action: sign out and return to the login screen. */
export async function signOutAction(): Promise<void> {
  await signOut();
  redirect(`${routes.admin.login()}?reason=signed-out`);
}
