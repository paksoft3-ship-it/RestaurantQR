import type { TemplatePreset } from "@/domain/entities";
import type { VisualDirection } from "@/domain/enums";

/**
 * Curated branding presets for each managed visual direction. These are the
 * starting points a template applies to a restaurant's branding — staff then
 * tailor from here. Shared by the seed, the "Apply template" action, and as a
 * fallback for templates that don't carry their own preset yet.
 */
export const DIRECTION_PRESETS: Record<VisualDirection, TemplatePreset> = {
  "modern-fast-food": {
    colors: { primary: "#F04424", primaryDark: "#C9341A", accent: "#FFC533", surface: "#F8FAFC", text: "#111827" },
    headingFont: "Manrope",
    bodyFont: "Inter",
    buttonStyle: "rounded",
    cardStyle: "soft",
    iconStyle: "line",
  },
  "warm-mediterranean": {
    colors: { primary: "#C4622D", primaryDark: "#9A4A20", accent: "#E0A458", surface: "#FBF6EF", text: "#3D2C1E" },
    headingFont: "Playfair Display",
    bodyFont: "Inter",
    buttonStyle: "rounded",
    cardStyle: "soft",
    iconStyle: "line",
  },
  "premium-dining": {
    colors: { primary: "#B8894B", primaryDark: "#8C6836", accent: "#1F2937", surface: "#FAF9F7", text: "#14110E" },
    headingFont: "Playfair Display",
    bodyFont: "Inter",
    buttonStyle: "square",
    cardStyle: "bordered",
    iconStyle: "line",
  },
  "fresh-healthy": {
    colors: { primary: "#2FA36B", primaryDark: "#1F7A4E", accent: "#F2C94C", surface: "#F5FBF7", text: "#14342A" },
    headingFont: "Poppins",
    bodyFont: "Inter",
    buttonStyle: "pill",
    cardStyle: "soft",
    iconStyle: "line",
  },
  "cafe-bakery": {
    colors: { primary: "#A9743B", primaryDark: "#7E5528", accent: "#E8B04B", surface: "#FBF4EA", text: "#3A2A1B" },
    headingFont: "Poppins",
    bodyFont: "Nunito",
    buttonStyle: "rounded",
    cardStyle: "elevated",
    iconStyle: "filled",
  },
};

/** A template's preset, falling back to the direction default. */
export function presetForTemplate(t: {
  direction: VisualDirection;
  preset?: TemplatePreset | null;
}): TemplatePreset {
  return t.preset ?? DIRECTION_PRESETS[t.direction];
}
