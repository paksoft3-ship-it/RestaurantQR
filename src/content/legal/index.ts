import type { LegalPage } from "@/domain/entities";
import type { LegalPageType } from "@/domain/enums";

/**
 * Structured legal content kept separate from layout components so a future CMS
 * adapter can replace it. Unverified information uses explicit placeholders
 * rather than invented legal facts.
 */

const TBA = {
  company: "[Legal company name to be added]",
  address: "[Registered address to be added]",
  privacyContact: "[Privacy contact to be added]",
  law: "[Governing law to be confirmed]",
  retention: "[Retention period to be confirmed]",
};

export const legalContent: Record<LegalPageType, LegalPage> = {
  privacy: {
    id: "legal_privacy",
    type: "privacy",
    locale: "en",
    version: "v1.0-draft",
    effectiveDate: null,
    lastUpdated: "2026-06-01",
    status: "draft",
    sections: [
      { id: "overview", title: "Overview", body: `This Privacy Policy explains how ${TBA.company} ("we") handles personal data when you use the YourPlatform website and the managed restaurant experiences we operate. Restaurant businesses do not receive accounts; all management is performed by authorized YourPlatform personnel.` },
      { id: "data-we-collect", title: "Data We Collect", body: "We may process contact details you submit through enquiry forms (such as name, email, phone and restaurant information), and basic technical data needed to operate the website. We do not sell personal data." },
      { id: "how-we-use-data", title: "How We Use Data", body: "We use submitted information to respond to enquiries, prepare quotes and operate managed restaurant experiences. Optional analytics and marketing tools are only activated with your consent through our cookie preferences." },
      { id: "cookies", title: "Cookies", body: "We use essential cookies that are always active when technically necessary, and optional cookies only with consent. You can update your choices at any time on the Cookie Policy page." },
      { id: "retention", title: "Data Retention", body: `We retain personal data only as long as necessary for the purposes described here. Specific retention periods: ${TBA.retention}.` },
      { id: "your-rights", title: "Your Rights", body: "Depending on your location you may have rights to access, correct, delete or restrict the processing of your personal data. To exercise these rights, contact us using the details below." },
      { id: "contact", title: "Contact", body: `Privacy contact: ${TBA.privacyContact}. Registered address: ${TBA.address}.` },
    ],
  },
  cookies: {
    id: "legal_cookies",
    type: "cookies",
    locale: "en",
    version: "v1.0-draft",
    effectiveDate: null,
    lastUpdated: "2026-06-01",
    status: "draft",
    sections: [
      { id: "what-are-cookies", title: "What Are Cookies", body: "Cookies are small files stored on your device. We group them into Essential, Preferences, Analytics and Marketing categories." },
      { id: "essential", title: "Essential Cookies", body: "Essential cookies are required for core functionality such as security and remembering your cookie choices. They are always active when technically necessary." },
      { id: "preferences", title: "Preference Cookies", body: "Preference cookies remember choices such as language. They are optional and disabled until you consent." },
      { id: "analytics", title: "Analytics Cookies", body: "Analytics cookies help us understand aggregate usage. No analytics tools are active in this build; they remain disabled until consent and configuration." },
      { id: "marketing", title: "Marketing Cookies", body: "Marketing cookies support measurement of campaigns. They are optional and disabled until you consent." },
      { id: "manage", title: "Managing Your Choices", body: "Use the cookie preferences panel to accept optional cookies, reject optional cookies, or update your saved choice at any time." },
    ],
  },
  terms: {
    id: "legal_terms",
    type: "terms",
    locale: "en",
    version: "v1.0-draft",
    effectiveDate: null,
    lastUpdated: "2026-06-01",
    status: "draft",
    sections: [
      { id: "introduction", title: "Introduction", body: `These Terms of Service govern use of the YourPlatform website operated by ${TBA.company}. YourPlatform is a fully managed service. Restaurant owners do not register, log in, or manage content themselves.` },
      { id: "managed-service", title: "Managed Service", body: "We create and maintain restaurant experiences on behalf of restaurant businesses. No self-service accounts, subscriptions, or checkout are offered through this website." },
      { id: "acceptable-use", title: "Acceptable Use", body: "You agree not to misuse the website, attempt unauthorized access, or interfere with its operation." },
      { id: "external-ordering", title: "External Ordering", body: '"Online Order with Pay" links open an external restaurant ordering website. We do not process food orders or payments through this platform.' },
      { id: "liability", title: "Limitation of Liability", body: "The website is provided on an \"as is\" basis to the extent permitted by law. Specific limitations are subject to the governing law below." },
      { id: "governing-law", title: "Governing Law", body: `Governing law: ${TBA.law}.` },
      { id: "contact", title: "Contact", body: `Questions about these terms can be sent to our team. Registered address: ${TBA.address}.` },
    ],
  },
  "campaign-terms": {
    id: "legal_campaign_terms",
    type: "campaign-terms",
    locale: "en",
    version: "v1.0",
    effectiveDate: null,
    lastUpdated: "2026-06-01",
    status: "draft",
    sections: [
      { id: "overview", title: "Campaign Overview", body: "These generic terms apply to promotional campaigns and reward mechanics operated for restaurants on YourPlatform. Each campaign may add specific terms on its own page." },
      { id: "eligibility", title: "Eligibility", body: "Eligibility is defined per campaign (for example, dine-in customers only). No purchase of attempts is required or offered. Campaigns are not games of chance presented as gambling." },
      { id: "rewards", title: "Rewards", body: "Rewards are described on each campaign page. Rewards have no cash value unless explicitly stated and are subject to availability." },
      { id: "claiming", title: "Claiming a Reward", body: "Follow the claim instructions shown after participating. Rewards must be claimed before the stated claim deadline." },
      { id: "fair-use", title: "Fair Use", body: "One participation per visit unless otherwise stated. The organizer may withdraw a campaign that is being abused." },
      { id: "organizer", title: "Organizer", body: `The organizer of each campaign is the relevant restaurant, supported by ${TBA.company} as the managed platform operator.` },
    ],
  },
};

export function getLegalPage(type: LegalPageType): LegalPage {
  return legalContent[type];
}
