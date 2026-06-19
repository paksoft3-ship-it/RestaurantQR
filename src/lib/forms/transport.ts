import { appConfig } from "@/lib/config/app-config";

/**
 * Shared form-submission abstraction. While transport is `mock`, submissions are
 * simulated and explicitly reported as demo-mode — never claiming an email was
 * sent. Replaceable later with a Server Action / API / email / CRM / DB.
 */

export type FormKind =
  | "enquiry"
  | "quote"
  | "privacy-request"
  | "cookie-question"
  | "terms-question"
  | "campaign-question";

export type FormResult =
  | { status: "demo"; message: string; reference: string }
  | { status: "ok"; message: string; reference: string }
  | { status: "not-configured"; message: string }
  | { status: "error"; message: string };

export interface FormTransport {
  submit(kind: FormKind, payload: Record<string, unknown>): Promise<FormResult>;
}

const mockTransport: FormTransport = {
  async submit() {
    await new Promise((r) => setTimeout(r, 600));
    const reference = `DEMO-${Date.now().toString(36).toUpperCase()}`;
    return {
      status: "demo",
      message:
        "This is a demo submission. No email or message was actually sent — your details were not transmitted anywhere.",
      reference,
    };
  },
};

const unconfiguredTransport: FormTransport = {
  async submit() {
    return {
      status: "not-configured",
      message:
        "Form delivery is not configured in this environment. Your input was kept on screen and nothing was sent.",
    };
  },
};

export function getFormTransport(): FormTransport {
  return appConfig.formTransport === "configured" ? unconfiguredTransport : mockTransport;
}
