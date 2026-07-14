import "server-only";
import { getRepositories } from "@/data/repositories";

/**
 * Load published Website CMS blocks and return a resolver. Marketing pages use
 * `copy(page, section, fallback)` so an admin-edited (published) block overrides
 * the built-in copy, while anything not set in the CMS keeps its default text.
 */
export async function loadWebsiteCopy(): Promise<
  (page: string, section: string, fallback: string) => string
> {
  let map = new Map<string, string>();
  try {
    const blocks = await getRepositories().content.websiteContent();
    map = new Map(blocks.map((b) => [`${b.page}:${b.section}`, (b.body ?? "").trim()]));
  } catch {
    // No DB / read error — fall back to defaults.
  }
  return (page, section, fallback) => map.get(`${page}:${section}`) || fallback;
}
