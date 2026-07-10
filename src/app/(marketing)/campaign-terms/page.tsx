import type { Metadata } from "next";
import { getLegalPage } from "@/content/legal";
import { getRepositories } from "@/data/repositories";
import { LegalPageLayout } from "@/components/legal/legal-page-layout";
import { appConfig } from "@/lib/config/app-config";

export const metadata: Metadata = {
  title: `Campaign Terms · ${appConfig.appName}`,
  description:
    "Generic terms for promotional campaigns and reward mechanics operated for restaurants on YourPlatform.",
};

export default async function CampaignTermsPage() {
  const page = (await getRepositories().legal.get("campaign-terms")) ?? getLegalPage("campaign-terms");
  return (
    <LegalPageLayout
      page={page}
      intro="Generic terms that apply to promotional campaigns and reward mechanics. Each campaign may add specific terms on its own page."
    />
  );
}
