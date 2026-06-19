/**
 * Centralized status definitions. Components read label + intent from here
 * instead of scattering status colors and copy across the codebase.
 */

export type StatusIntent = "neutral" | "info" | "success" | "warning" | "danger" | "primary";

export interface StatusDef {
  value: string;
  label: string;
  intent: StatusIntent;
  description: string;
  /** lucide-react icon name (resolved by presentation components). */
  icon: string;
}

export type StatusGroup =
  | "restaurantSetup"
  | "publishing"
  | "operational"
  | "menu"
  | "availability"
  | "qr"
  | "nfc"
  | "campaign"
  | "enquiry"
  | "review"
  | "asset"
  | "project";

function def(
  value: string,
  label: string,
  intent: StatusIntent,
  icon: string,
  description: string,
): StatusDef {
  return { value, label, intent, icon, description };
}

export const STATUS_REGISTRY: Record<StatusGroup, Record<string, StatusDef>> = {
  restaurantSetup: {
    "not-started": def("not-started", "Not Started", "neutral", "Circle", "Setup has not begun."),
    "collecting-info": def("collecting-info", "Collecting Info", "info", "ClipboardList", "Gathering restaurant information."),
    "in-design": def("in-design", "In Design", "primary", "Palette", "Branding and design in progress."),
    "menu-prep": def("menu-prep", "Menu Prep", "info", "BookOpen", "Menu being prepared."),
    review: def("review", "In Review", "warning", "Eye", "Awaiting internal review."),
    ready: def("ready", "Ready", "success", "CheckCircle2", "Ready to publish."),
  },
  publishing: {
    draft: def("draft", "Draft", "neutral", "FileEdit", "Not yet visible to the public."),
    "in-review": def("in-review", "In Review", "warning", "Eye", "Pending review before publish."),
    "changes-pending": def("changes-pending", "Changes Pending", "warning", "GitPullRequest", "Unpublished changes exist."),
    published: def("published", "Published", "success", "Globe", "Live and public."),
    archived: def("archived", "Archived", "neutral", "Archive", "Archived and hidden."),
  },
  operational: {
    active: def("active", "Active", "success", "CheckCircle2", "Operational."),
    paused: def("paused", "Paused", "warning", "PauseCircle", "Temporarily paused."),
    disabled: def("disabled", "Disabled", "danger", "Ban", "Disabled."),
  },
  menu: {
    draft: def("draft", "Draft", "neutral", "FileEdit", "Menu draft."),
    active: def("active", "Active", "success", "CheckCircle2", "Menu active."),
    hidden: def("hidden", "Hidden", "neutral", "EyeOff", "Menu hidden."),
  },
  availability: {
    available: def("available", "Available", "success", "CheckCircle2", "Available now."),
    limited: def("limited", "Limited", "warning", "AlertTriangle", "Limited availability."),
    "out-of-stock": def("out-of-stock", "Out of Stock", "danger", "XCircle", "Currently unavailable."),
    hidden: def("hidden", "Hidden", "neutral", "EyeOff", "Hidden from menu."),
  },
  qr: {
    draft: def("draft", "Draft", "neutral", "FileEdit", "QR not yet active."),
    active: def("active", "Active", "success", "QrCode", "QR active."),
    paused: def("paused", "Paused", "warning", "PauseCircle", "QR paused."),
    retired: def("retired", "Retired", "neutral", "Archive", "QR retired."),
  },
  nfc: {
    unassigned: def("unassigned", "Unassigned", "neutral", "Nfc", "Not assigned to a restaurant."),
    assigned: def("assigned", "Assigned", "success", "Nfc", "Assigned and active."),
    "reassign-pending": def("reassign-pending", "Reassign Pending", "warning", "Repeat", "Reassignment pending."),
  },
  campaign: {
    draft: def("draft", "Draft", "neutral", "FileEdit", "Campaign draft."),
    scheduled: def("scheduled", "Scheduled", "info", "CalendarClock", "Scheduled to start."),
    active: def("active", "Active", "success", "Megaphone", "Running now."),
    ended: def("ended", "Ended", "neutral", "Flag", "Campaign ended."),
    archived: def("archived", "Archived", "neutral", "Archive", "Archived."),
  },
  enquiry: {
    new: def("new", "New", "info", "Inbox", "New enquiry."),
    "in-review": def("in-review", "In Review", "warning", "Eye", "Being reviewed."),
    contacted: def("contacted", "Contacted", "primary", "PhoneCall", "Contact made."),
    qualified: def("qualified", "Qualified", "success", "CheckCircle2", "Qualified lead."),
    closed: def("closed", "Closed", "neutral", "Archive", "Closed."),
  },
  review: {
    "not-submitted": def("not-submitted", "Not Submitted", "neutral", "Circle", "Not submitted for review."),
    "in-review": def("in-review", "In Review", "warning", "Eye", "Under review."),
    approved: def("approved", "Approved", "success", "CheckCircle2", "Approved."),
    "changes-requested": def("changes-requested", "Changes Requested", "danger", "AlertTriangle", "Changes requested."),
  },
  asset: {
    pending: def("pending", "Pending", "warning", "Clock", "Pending processing."),
    ready: def("ready", "Ready", "success", "CheckCircle2", "Ready to use."),
    archived: def("archived", "Archived", "neutral", "Archive", "Archived."),
  },
  project: {
    lead: def("lead", "Lead", "info", "UserPlus", "Sales lead."),
    onboarding: def("onboarding", "Onboarding", "primary", "Rocket", "Being onboarded."),
    live: def("live", "Live", "success", "CheckCircle2", "Live and managed."),
    maintenance: def("maintenance", "Maintenance", "info", "Wrench", "Under maintenance."),
    offboarding: def("offboarding", "Offboarding", "warning", "LogOut", "Offboarding."),
  },
};

export function getStatus(group: StatusGroup, value: string): StatusDef {
  return (
    STATUS_REGISTRY[group][value] ??
    def(value, value, "neutral", "Circle", "")
  );
}
