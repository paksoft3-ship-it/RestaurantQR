"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { customerActionSchema } from "@/domain/schemas";
import { demoStore, DEMO_STORE_EVENT } from "@/lib/storage/demo-store";
import { routes } from "@/lib/routes";
import { createId } from "@/lib/utils";
import { resolveText } from "@/lib/i18n/locales";
import type { CustomerAction, Restaurant } from "@/domain/entities";
import {
  CUSTOMER_ACTION_TYPES,
  DESTINATION_TYPES,
  type CustomerActionType,
  type DestinationType,
} from "@/domain/enums";
import { PERMISSIONS } from "@/domain/permissions";
import { RestaurantContextHeader } from "@/components/admin/restaurant-context-header";
import { RestaurantWorkspaceTabs } from "@/components/admin/restaurant-workspace-tabs";
import { AdminSection } from "@/components/admin/admin-section";
import { StickyActionBar } from "@/components/admin/sticky-action-bar";
import { PreviewPanel } from "@/components/admin/preview-panel";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
import { useAdminUser } from "@/components/admin/admin-user-context";
import { Field, Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/shared/icon";
import { PermissionGate } from "@/components/shared/permission-gate";
import { EmptyState } from "@/components/shared/states";
import { useToast } from "@/components/ui/toast";
import { uploadImage } from "@/lib/uploads/upload-image";
import { cn } from "@/lib/utils";

const PRIMARY_TYPES: CustomerActionType[] = ["call-order", "pick-your-meal", "online-order", "visit-us"];

/** Sensible default destination type for each fixed button when first created. */
const DEFAULT_FIXED_DEST: Record<CustomerActionType, DestinationType> = {
  "call-order": "phone",
  "pick-your-meal": "internal",
  "online-order": "external",
  "visit-us": "external",
  whatsapp: "whatsapp",
  "save-contact": "external",
  email: "email",
  instagram: "external",
  share: "external",
  custom: "external",
};

const TYPE_LABELS: Record<CustomerActionType, string> = {
  "call-order": "Call Order",
  "pick-your-meal": "Pick Your Meal",
  "online-order": "Online Order with Pay",
  "visit-us": "Add Contact",
  whatsapp: "WhatsApp",
  "save-contact": "Save Contact",
  email: "Email",
  instagram: "Instagram",
  share: "Share",
  custom: "Custom button",
};

const TYPE_ICONS: Record<CustomerActionType, string> = {
  "call-order": "Phone",
  "pick-your-meal": "BookOpen",
  "online-order": "CreditCard",
  "visit-us": "Contact",
  whatsapp: "MessageCircle",
  "save-contact": "Contact",
  email: "Mail",
  instagram: "Instagram",
  share: "Share2",
  custom: "Link",
};

/** An icon value is an uploaded image when it looks like a URL/path. */
function isImageIcon(icon: string | null | undefined): boolean {
  return Boolean(icon && (icon.startsWith("http") || icon.startsWith("/")));
}

/** Curated lucide icons offered in the per-button icon picker. */
const PRESET_ICONS = [
  "Phone",
  "MapPin",
  "Navigation",
  "BookOpen",
  "Utensils",
  "CreditCard",
  "ShoppingBag",
  "ShoppingCart",
  "Contact",
  "UserPlus",
  "MessageCircle",
  "Mail",
  "Instagram",
  "Facebook",
  "Globe",
  "Link",
  "Star",
  "Heart",
  "Gift",
  "Calendar",
  "Clock",
  "Camera",
  "Music",
  "Youtube",
];

const DESTINATION_LABELS: Record<DestinationType, string> = {
  internal: "Internal page",
  external: "External link",
  phone: "Phone number",
  whatsapp: "WhatsApp number",
  email: "Email address",
  map: "Map / directions",
};

interface DraftAction {
  id: string;
  type: CustomerActionType;
  labelEn: string;
  destinationType: DestinationType;
  destination: string;
  /** Lucide icon name or uploaded image URL; "" = built-in default. */
  icon: string;
  /** Top-card (under-banner) overrides for primary actions; "" = match bottom bar. */
  topLabelEn: string;
  topIcon: string;
  enabled: boolean;
}

/** Small preview of the current icon (uploaded image or lucide). */
function IconSwatch({ icon, defaultIcon }: { icon: string; defaultIcon: string }) {
  const resolved = icon.trim();
  if (isImageIcon(resolved)) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={resolved} alt="" className="size-6 object-contain" />;
  }
  return <Icon name={resolved || defaultIcon} className="size-5" aria-hidden />;
}

/** Per-button icon control: preset lucide picker + custom image upload + reset. */
function IconField({
  rowId,
  value,
  defaultIcon,
  onChange,
  notify,
}: {
  rowId: string;
  value: string;
  defaultIcon: string;
  onChange: (next: string) => void;
  notify: ReturnType<typeof useToast>["toast"];
}) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputId = `icon-upload-${rowId}`;

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    const uploaded = await uploadImage(file, "action-icons");
    setUploading(false);
    if (uploaded) {
      onChange(uploaded);
      notify({ title: "Icon uploaded", description: "Save the draft to apply it.", intent: "success" });
    } else {
      notify({
        title: "Upload failed",
        description: "Use a JPG, PNG, WebP, GIF, SVG or AVIF image under 10MB (and check image storage is configured).",
        intent: "info",
      });
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] border border-border bg-canvas text-primary">
          <IconSwatch icon={value} defaultIcon={defaultIcon} />
        </span>
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen((o) => !o)}>
          <Icon name="LayoutGrid" className="size-4" aria-hidden /> Choose icon
        </Button>
        <Button type="button" variant="ghost" size="sm" asChild>
          <label htmlFor={inputId} className="cursor-pointer">
            <Icon name="Upload" className="size-4" aria-hidden /> {uploading ? "Uploading…" : "Upload"}
            <input id={inputId} type="file" accept="image/*" className="sr-only" onChange={handleUpload} />
          </label>
        </Button>
        {value ? (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")}>
            Reset
          </Button>
        ) : null}
      </div>
      {open ? (
        <div className="flex flex-wrap gap-1.5 rounded-[10px] border border-border bg-canvas p-2">
          {PRESET_ICONS.map((name) => (
            <button
              key={name}
              type="button"
              aria-label={`Use ${name} icon`}
              aria-pressed={value === name}
              onClick={() => {
                onChange(name);
                setOpen(false);
              }}
              className={cn(
                "flex size-8 items-center justify-center rounded-[8px] border",
                value === name
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-text-secondary hover:border-primary/50",
              )}
            >
              <Icon name={name} className="size-4" aria-hidden />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function toDraft(action: CustomerAction): DraftAction {
  return {
    id: action.id,
    type: action.type,
    labelEn: resolveText(action.label),
    destinationType: action.destinationType,
    destination: action.destination ?? "",
    icon: action.icon ?? "",
    topLabelEn: action.topLabel ? resolveText(action.topLabel) : "",
    topIcon: action.topIcon ?? "",
    enabled: action.enabled,
  };
}

/**
 * Guarantee the four fixed bottom-bar buttons always exist as editable rows —
 * even for a brand-new restaurant that has no saved customer actions yet. Any
 * missing primary is added as a disabled placeholder in canonical order.
 */
function ensureFixedRows(rows: DraftAction[]): DraftAction[] {
  const present = new Set(rows.map((r) => r.type));
  const missing: DraftAction[] = PRIMARY_TYPES.filter((t) => !present.has(t)).map((type) => ({
    id: createId("act"),
    type,
    labelEn: TYPE_LABELS[type],
    destinationType: DEFAULT_FIXED_DEST[type],
    destination: "",
    icon: "",
    topLabelEn: "",
    topIcon: "",
    enabled: false,
  }));
  return [...rows, ...missing];
}

/** Validate a single draft row against the schema + destination safety. */
function rowError(row: DraftAction): string | null {
  const parsed = customerActionSchema.safeParse({
    type: row.type,
    labelEn: row.labelEn,
    destinationType: row.destinationType,
    destination: row.destination,
    enabled: row.enabled,
  });
  if (!parsed.success) {
    return parsed.error.issues[0]?.message ?? "Invalid action";
  }
  const value = row.destination.trim();
  if (row.enabled && value.length === 0) return "Enabled actions need a destination";
  if ((row.destinationType === "external" || row.destinationType === "map") && value) {
    if (!/^https?:\/\//i.test(value)) return "Links must start with https:// (or http://)";
  }
  if (row.destinationType === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return "Enter a valid email address";
  }
  return null;
}

export default function CustomerActionsPage() {
  const params = useParams<{ restaurantId: string }>();
  const id = params.restaurantId;
  const { toast } = useToast();
  const user = useAdminUser();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [rows, setRows] = useState<DraftAction[]>([]);
  const [ready, setReady] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<DraftAction | null>(null);

  // Mirror `dirty` into a ref so the store-change handler can read the latest
  // value without being a dependency of the mount effect (otherwise the effect
  // would re-run and reload — discarding in-progress edits on every keystroke).
  const dirtyRef = useRef(false);
  useEffect(() => {
    dirtyRef.current = dirty;
  }, [dirty]);

  const load = useCallback(() => {
    const r = demoStore.getRestaurant(id);
    const actions = demoStore.customerActions
      .where((a) => a.restaurantId === id)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    setRestaurant(r);
    setRows(ensureFixedRows(actions.map(toDraft)));
    setReady(true);
    setDirty(false);
  }, [id]);

  useEffect(() => {
    load();
    const handler = () => {
      if (!dirtyRef.current) load();
    };
    window.addEventListener(DEMO_STORE_EVENT, handler);
    return () => window.removeEventListener(DEMO_STORE_EVENT, handler);
  }, [load]);

  const patchRow = (rowId: string, patch: Partial<DraftAction>) => {
    setRows((prev) => prev.map((r) => (r.id === rowId ? { ...r, ...patch } : r)));
    setDirty(true);
  };

  /** Reorder within the row's own group (primary stays above supporting). */
  const move = (rowId: string, direction: -1 | 1) => {
    setRows((prev) => {
      const row = prev.find((r) => r.id === rowId);
      if (!row) return prev;
      const isPrimary = PRIMARY_TYPES.includes(row.type);
      const group = prev.filter((r) => PRIMARY_TYPES.includes(r.type) === isPrimary);
      const other = prev.filter((r) => PRIMARY_TYPES.includes(r.type) !== isPrimary);
      const gi = group.findIndex((r) => r.id === rowId);
      const target = gi + direction;
      if (target < 0 || target >= group.length) return prev;
      [group[gi], group[target]] = [group[target], group[gi]];
      // Primary group always renders before supporting group.
      return isPrimary ? [...group, ...other] : [...other, ...group];
    });
    setDirty(true);
  };

  const addSupporting = () => {
    const used = new Set(rows.map((r) => r.type));
    const available = CUSTOMER_ACTION_TYPES.find(
      (t) => !PRIMARY_TYPES.includes(t) && t !== "custom" && !used.has(t),
    );
    const type = available ?? "share";
    setRows((prev) => [
      ...prev,
      {
        id: createId("act"),
        type,
        labelEn: TYPE_LABELS[type],
        destinationType: "external",
        destination: "",
        icon: "",
        topLabelEn: "",
        topIcon: "",
        enabled: false,
      },
    ]);
    setDirty(true);
  };

  /** Add a brand-new custom button (label / icon / link fully editable). */
  const addCustom = () => {
    setRows((prev) => [
      ...prev,
      {
        id: createId("act"),
        type: "custom",
        labelEn: "New button",
        destinationType: "external",
        destination: "",
        icon: "",
        topLabelEn: "",
        topIcon: "",
        enabled: false,
      },
    ]);
    setDirty(true);
  };

  const errorsByRow = useMemo(() => {
    const map = new Map<string, string | null>();
    rows.forEach((r) => map.set(r.id, rowError(r)));
    return map;
  }, [rows]);

  const hasErrors = useMemo(() => [...errorsByRow.values()].some(Boolean), [errorsByRow]);

  const confirmRemove = () => {
    if (!removeTarget) return;
    setRows((prev) => prev.filter((r) => r.id !== removeTarget.id));
    setDirty(true);
    setRemoveTarget(null);
  };

  const save = () => {
    if (hasErrors) {
      toast({
        title: "Some actions have issues",
        description: "Fix invalid destinations before saving.",
        intent: "danger",
      });
      return;
    }

    const existing = demoStore.customerActions.where((a) => a.restaurantId === id);
    const keptIds = new Set(rows.map((r) => r.id));

    // Remove rows the user deleted.
    existing.forEach((a) => {
      if (!keptIds.has(a.id)) demoStore.customerActions.remove(a.id);
    });

    // Create / update rows in display order.
    rows.forEach((row, index) => {
      const value = row.destination.trim();
      const payload = {
        restaurantId: id,
        type: row.type,
        label: { en: row.labelEn },
        destinationType: row.destinationType,
        destination: value || null,
        icon: row.icon.trim() || null,
        topLabel: row.topLabelEn.trim() ? { en: row.topLabelEn.trim() } : null,
        topIcon: row.topIcon.trim() || null,
        enabled: row.enabled,
        status: (value ? "configured" : "needs-config") as CustomerAction["status"],
        sortOrder: index + 1,
      };
      const found = existing.find((a) => a.id === row.id);
      if (found) {
        demoStore.customerActions.update(row.id, payload);
      } else {
        demoStore.customerActions.create({ id: row.id, ...payload });
      }
    });

    demoStore.recordActivity({
      actorId: user?.id ?? "unknown",
      actorRole: user?.role ?? "support-team",
      action: "customer-actions.save-draft",
      resourceType: "customer-action",
      resourceId: id,
      description: `Saved customer-actions draft (${rows.length} actions) for ${
        restaurant?.displayName ?? id
      }.`,
    });

    toast({
      title: "Customer actions saved",
      description: "Live now if this restaurant is published.",
      intent: "success",
    });
    load();
  };

  if (ready && !restaurant) {
    return (
      <EmptyState title="Restaurant not found" description="This restaurant may have been removed." icon="Store">
        <Button asChild variant="secondary" size="sm">
          <Link href={routes.admin.restaurants()}>Back to restaurants</Link>
        </Button>
      </EmptyState>
    );
  }

  if (!restaurant) {
    return (
      <div className="rounded-[16px] border border-border bg-canvas p-8 text-center text-small text-text-secondary">
        Loading…
      </div>
    );
  }

  const breadcrumb = [
    { label: "Admin", href: routes.admin.dashboard() },
    { label: "Restaurants", href: routes.admin.restaurants() },
    { label: restaurant.displayName, href: routes.admin.restaurant(id) },
    { label: "Customer Actions" },
  ];

  const primaryRows = rows.filter((r) => PRIMARY_TYPES.includes(r.type));
  const supportingRows = rows.filter((r) => !PRIMARY_TYPES.includes(r.type));
  const previewActions = rows.filter((r) => r.enabled);

  /** A row in the "Top cards" section — only text + icon; link + visibility come from the bottom bar. */
  const renderTopCardRow = (row: DraftAction) => (
    <li
      key={row.id}
      className={cn(
        "rounded-[12px] border bg-surface p-4",
        row.enabled ? "border-border" : "border-dashed border-border opacity-80",
      )}
    >
      <div className="flex flex-wrap items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-surface-warm text-primary">
          <IconSwatch icon={row.topIcon || row.icon} defaultIcon={TYPE_ICONS[row.type]} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-text-primary">{TYPE_LABELS[row.type]}</p>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                row.enabled ? "bg-success/10 text-success" : "bg-surface-muted text-text-secondary",
              )}
            >
              <Icon name={row.enabled ? "CheckCircle2" : "Circle"} className="size-3" aria-hidden />
              {row.enabled ? "Shown" : "Hidden"}
            </span>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Card text" htmlFor={`toplabel-${row.id}`}>
              <Input
                id={`toplabel-${row.id}`}
                value={row.topLabelEn}
                placeholder={row.labelEn || TYPE_LABELS[row.type]}
                onChange={(e) => patchRow(row.id, { topLabelEn: e.target.value })}
              />
            </Field>
            <Field label="Card icon" htmlFor={`icon-upload-top-${row.id}`}>
              <IconField
                rowId={`top-${row.id}`}
                value={row.topIcon}
                defaultIcon={row.icon.trim() || TYPE_ICONS[row.type]}
                onChange={(next) => patchRow(row.id, { topIcon: next })}
                notify={toast}
              />
            </Field>
          </div>
        </div>
      </div>
    </li>
  );

  const renderRow = (row: DraftAction, index: number) => {
    const error = errorsByRow.get(row.id);
    const isPrimary = PRIMARY_TYPES.includes(row.type);
    return (
      <li
        key={row.id}
        className={cn(
          "rounded-[12px] border bg-surface p-4",
          row.enabled ? "border-border" : "border-dashed border-border opacity-80",
        )}
      >
        <div className="flex flex-wrap items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-surface-warm text-primary">
            <IconSwatch icon={row.icon} defaultIcon={TYPE_ICONS[row.type]} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold text-text-primary">
                {row.type === "custom" ? row.labelEn.trim() || "Custom button" : TYPE_LABELS[row.type]}
              </p>
              {isPrimary ? (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  Primary
                </span>
              ) : null}
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                  row.enabled ? "bg-success/10 text-success" : "bg-surface-muted text-text-secondary",
                )}
              >
                <Icon name={row.enabled ? "CheckCircle2" : "Circle"} className="size-3" aria-hidden />
                {row.enabled ? "Enabled" : "Disabled"}
              </span>
              {row.type === "online-order" ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-info/10 px-2 py-0.5 text-[10px] font-semibold text-info">
                  <Icon name="ExternalLink" className="size-3" aria-hidden /> External pay
                </span>
              ) : null}
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label={isPrimary ? "Bottom bar text" : "Button text"} htmlFor={`label-${row.id}`}>
                <Input
                  id={`label-${row.id}`}
                  value={row.labelEn}
                  onChange={(e) => patchRow(row.id, { labelEn: e.target.value })}
                />
              </Field>
              <Field label="Destination type" htmlFor={`dtype-${row.id}`}>
                <Select
                  id={`dtype-${row.id}`}
                  value={row.destinationType}
                  onChange={(e) => patchRow(row.id, { destinationType: e.target.value as DestinationType })}
                >
                  {DESTINATION_TYPES.map((d) => (
                    <option key={d} value={d}>
                      {DESTINATION_LABELS[d]}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field
                label="Destination"
                htmlFor={`dest-${row.id}`}
                error={error ?? undefined}
                hint={isPrimary ? "Shared — the top card and the bottom bar open this same link." : undefined}
                className="sm:col-span-2"
              >
                <Input
                  id={`dest-${row.id}`}
                  value={row.destination}
                  placeholder={
                    row.destinationType === "external" || row.destinationType === "map"
                      ? "https://…"
                      : row.destinationType === "email"
                        ? "hello@example.com"
                        : row.destinationType === "internal"
                          ? "/restaurants/pizza-house/menu"
                          : "+1-512-555-0142"
                  }
                  aria-invalid={error ? true : undefined}
                  onChange={(e) => patchRow(row.id, { destination: e.target.value })}
                />
              </Field>
              <Field
                label={isPrimary ? "Bottom bar icon" : "Button icon"}
                htmlFor={`icon-upload-${row.id}`}
                className="sm:col-span-2"
              >
                <IconField
                  rowId={row.id}
                  value={row.icon}
                  defaultIcon={TYPE_ICONS[row.type]}
                  onChange={(next) => patchRow(row.id, { icon: next })}
                  notify={toast}
                />
              </Field>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Move ${TYPE_LABELS[row.type]} up`}
              disabled={index === 0}
              onClick={() => move(row.id, -1)}
            >
              <Icon name="ChevronUp" className="size-4" aria-hidden />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Move ${TYPE_LABELS[row.type]} down`}
              disabled={index === (isPrimary ? primaryRows.length : supportingRows.length) - 1}
              onClick={() => move(row.id, 1)}
            >
              <Icon name="ChevronDown" className="size-4" aria-hidden />
            </Button>
            <Button
              type="button"
              variant={row.enabled ? "outline" : "primary"}
              size="sm"
              aria-pressed={row.enabled}
              onClick={() => patchRow(row.id, { enabled: !row.enabled })}
            >
              {row.enabled ? "Disable" : "Enable"}
            </Button>
            {!isPrimary ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Remove ${TYPE_LABELS[row.type]}`}
                onClick={() => setRemoveTarget(row)}
              >
                <Icon name="Trash2" className="size-4" aria-hidden />
              </Button>
            ) : null}
          </div>
        </div>
      </li>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <RestaurantContextHeader restaurant={restaurant} breadcrumb={breadcrumb} />
      <RestaurantWorkspaceTabs restaurantId={id} />

      <div className="flex items-start gap-2 rounded-[12px] border border-info/30 bg-info/5 p-3 text-small text-info">
        <Icon name="Info" className="mt-0.5 size-4 shrink-0" aria-hidden />
        <span>
          This page controls the customer buttons on the public page, in three areas:{" "}
          <strong>Top cards</strong> (the big cards under the banner), <strong>Fixed buttons</strong>{" "}
          (pinned to the bottom bar) and <strong>Floating buttons</strong> (the round “+” menu). The
          top cards and bottom bar are the same four actions and open the same links — only their
          text and icon can differ. “Online Order with Pay” always opens an{" "}
          <strong>external</strong> ordering site. Changes are live once this restaurant is published.
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        <div className="flex min-w-0 flex-col gap-6">
          <AdminSection
            title="Top cards (under the banner)"
            description="The four big cards shown just under the banner image — Call Order, Pick Your Meal, Online Order with Pay and Add Contact. Give each its own text and icon here, or leave blank to match the bottom bar. They open the same link and appear when the matching bottom-bar button is enabled."
            icon="LayoutGrid"
          >
            {primaryRows.length === 0 ? (
              <p className="text-small text-text-secondary">No cards configured yet.</p>
            ) : (
              <ol className="flex flex-col gap-3">{primaryRows.map((row) => renderTopCardRow(row))}</ol>
            )}
          </AdminSection>

          <AdminSection
            title="Fixed buttons (bottom bar)"
            description="The four buttons pinned to the bottom of the public page — Call Order, Pick Your Meal, Online Order with Pay and Add Contact. Rename them, change their icon and link, enable/disable and reorder them. They can’t be removed."
            icon="PanelBottom"
          >
            {primaryRows.length === 0 ? (
              <p className="text-small text-text-secondary">No fixed buttons configured yet.</p>
            ) : (
              <ol className="flex flex-col gap-3">{primaryRows.map((row, i) => renderRow(row, i))}</ol>
            )}
          </AdminSection>

          <AdminSection
            title="Floating buttons (the “+” menu)"
            description="Buttons shown inside the round “+” menu on the public page — WhatsApp, Email, Save Contact, Share, Social, plus any custom buttons you add. Each has its own label, icon and link."
            icon="Plus"
            actions={
              <PermissionGate user={user} permission={PERMISSIONS.RESTAURANT_EDIT}>
                <div className="flex items-center gap-1">
                  <Button type="button" variant="ghost" size="sm" onClick={addSupporting}>
                    <Icon name="Plus" className="size-4" aria-hidden />
                    Add action
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={addCustom}>
                    <Icon name="Sparkles" className="size-4" aria-hidden />
                    Add custom button
                  </Button>
                </div>
              </PermissionGate>
            }
          >
            {supportingRows.length === 0 ? (
              <EmptyState
                title="No floating buttons yet"
                description="Add optional buttons like WhatsApp or Email, or a custom button with your own icon and link — they appear in the “+” menu."
                icon="MousePointerClick"
              />
            ) : (
              <ol className="flex flex-col gap-3">{supportingRows.map((row, i) => renderRow(row, i))}</ol>
            )}
          </AdminSection>
        </div>

        {/* Mobile homepage preview + readiness */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 flex flex-col gap-4">
            <PreviewPanel label="Customer actions preview">
              <div className="flex flex-col gap-3 p-4">
                <p className="font-heading text-button font-bold text-text-primary">
                  {restaurant.displayName}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {previewActions.length === 0 ? (
                    <p className="col-span-2 py-6 text-center text-xs text-text-tertiary">
                      No actions enabled.
                    </p>
                  ) : (
                    previewActions.slice(0, 6).map((a) => (
                      <div
                        key={a.id}
                        className="flex flex-col items-center gap-1 rounded-[12px] bg-surface p-3 text-center"
                      >
                        <span className="flex size-5 items-center justify-center text-primary">
                          <IconSwatch icon={a.icon} defaultIcon={TYPE_ICONS[a.type]} />
                        </span>
                        <span className="text-[11px] font-medium text-text-primary">
                          {a.labelEn || TYPE_LABELS[a.type]}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </PreviewPanel>

            <div className="rounded-[16px] border border-border bg-canvas p-4 shadow-card">
              <p className="text-small font-semibold text-text-primary">Readiness</p>
              <ul className="mt-2 flex flex-col gap-1.5 text-xs">
                {PRIMARY_TYPES.map((t) => {
                  const row = rows.find((r) => r.type === t);
                  const ok = Boolean(row?.enabled && row.destination.trim() && !errorsByRow.get(row.id));
                  return (
                    <li key={t} className="flex items-center gap-2">
                      <Icon
                        name={ok ? "CheckCircle2" : "Circle"}
                        className={ok ? "size-3.5 text-success" : "size-3.5 text-text-tertiary"}
                        aria-hidden
                      />
                      <span className={ok ? "text-text-primary" : "text-text-secondary"}>
                        {TYPE_LABELS[t]} {ok ? "ready" : "needs config"}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-3 text-xs text-text-tertiary">Draft — not published. Illustrative data.</p>
            </div>
          </div>
        </aside>
      </div>

      <StickyActionBar
        info={
          dirty ? (
            <span className="flex items-center gap-1.5 text-warning">
              <Icon name="Circle" className="size-2.5 fill-current" aria-hidden />
              Unsaved changes · current public actions preserved
            </span>
          ) : (
            <span>All changes saved as draft.</span>
          )
        }
      >
        <Button asChild variant="ghost">
          <Link href={routes.admin.restaurant(id)}>Preview</Link>
        </Button>
        <PermissionGate
          user={user}
          permission={PERMISSIONS.RESTAURANT_EDIT}
          fallback={<span className="text-xs text-text-tertiary">View only — saving needs edit access.</span>}
        >
          <Button type="button" onClick={save} disabled={hasErrors}>
            Save Draft
          </Button>
        </PermissionGate>
      </StickyActionBar>

      <ConfirmationDialog
        open={removeTarget !== null}
        title="Remove this action?"
        description={
          removeTarget
            ? `“${removeTarget.labelEn || TYPE_LABELS[removeTarget.type]}” will be removed from the draft. It is not deleted until you save.`
            : undefined
        }
        confirmLabel="Remove"
        intent="danger"
        icon="Trash2"
        onConfirm={confirmRemove}
        onCancel={() => setRemoveTarget(null)}
      />
    </div>
  );
}
