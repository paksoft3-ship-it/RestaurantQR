import type { Metadata } from "next";
import { getLegalPage } from "@/content/legal";
import { getRepositories } from "@/data/repositories";
import { LegalPageLayout } from "@/components/legal/legal-page-layout";
import { appConfig } from "@/lib/config/app-config";

export const metadata: Metadata = {
  title: `Privacy Policy · ${appConfig.appName}`,
  description:
    "How YourPlatform handles personal data across its managed QR/NFC restaurant platform and website.",
};

// Reflect admin-published content without a rebuild.
export const revalidate = 30;

export default async function PrivacyPage() {
  const page = (await getRepositories().legal.get("privacy")) ?? getLegalPage("privacy");
  return (
    <LegalPageLayout
      page={page}
      intro="How we handle personal data when you use the YourPlatform website and the managed restaurant experiences we operate."
    />
  );
}
