/**
 * Tag a QR/NFC destination with a `?via=qr|nfc` marker so the analytics pipeline
 * can attribute the arrival channel. Only links to our own restaurant public
 * pages are tagged (external ordering sites can't be tracked and are left as-is),
 * and an existing `via` param is preserved. Pure + safe on empty input.
 */
export function addViaMarker(destination: string | null | undefined, channel: "qr" | "nfc"): string {
  const dest = destination?.trim();
  if (!dest) return dest ?? "";

  const isRestaurantLink =
    dest.startsWith("/restaurants/") || /^https?:\/\/[^/]+\/restaurants\//i.test(dest);
  if (!isRestaurantLink) return dest;
  if (/[?&]via=/i.test(dest)) return dest; // already tagged

  const hashIndex = dest.indexOf("#");
  const base = hashIndex >= 0 ? dest.slice(0, hashIndex) : dest;
  const hash = hashIndex >= 0 ? dest.slice(hashIndex) : "";
  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}via=${channel}${hash}`;
}
