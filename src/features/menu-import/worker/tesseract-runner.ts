import { spawn } from "node:child_process";
import { mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * Real, on-device OCR runner (server-only).
 *
 * Renders each PDF page to a PNG with Poppler's `pdftoppm`, then runs Tesseract
 * on each page image. Returns the raw per-page text for the pure parser to
 * structure. Requires `pdftoppm` and `tesseract` on PATH (see docs).
 */

const RENDER_DPI = 300;
/** PSM 3 (auto page segmentation) gave the cleanest prices on dense menus. */
const TESSERACT_PSM = "3";

export interface OcrRunResult {
  pages: string[];
  pageCount: number;
}

export class OcrToolingError extends Error {
  constructor(
    message: string,
    readonly tool: "pdftoppm" | "tesseract",
  ) {
    super(message);
    this.name = "OcrToolingError";
  }
}

/** Run a binary, capturing stdout. Rejects with a clear error if it is missing. */
function run(
  cmd: "pdftoppm" | "tesseract",
  args: string[],
  encoding: "utf8" | "buffer" = "utf8",
): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args);
    const out: Buffer[] = [];
    const err: Buffer[] = [];
    child.stdout.on("data", (d: Buffer) => out.push(d));
    child.stderr.on("data", (d: Buffer) => err.push(d));
    child.on("error", (e: NodeJS.ErrnoException) => {
      if (e.code === "ENOENT") {
        reject(
          new OcrToolingError(
            `Required tool "${cmd}" is not installed or not on PATH. Install it (e.g. \`brew install ${cmd === "pdftoppm" ? "poppler" : "tesseract"}\`).`,
            cmd,
          ),
        );
      } else {
        reject(e);
      }
    });
    child.on("close", (code) => {
      if (code === 0) {
        resolve(encoding === "utf8" ? Buffer.concat(out).toString("utf8") : "");
      } else {
        reject(new OcrToolingError(`${cmd} exited with code ${code}: ${Buffer.concat(err).toString("utf8").slice(0, 500)}`, cmd));
      }
    });
  });
}

/**
 * OCR a PDF buffer. Writes the PDF to a temp dir, rasterises every page, OCRs
 * each, and always cleans up the temp dir.
 */
export async function ocrPdf(pdf: Buffer): Promise<OcrRunResult> {
  const dir = await mkdtemp(join(tmpdir(), "menu-ocr-"));
  try {
    const pdfPath = join(dir, "input.pdf");
    await writeFile(pdfPath, pdf);

    // Rasterise all pages → page-1.png, page-2.png, ...
    await run("pdftoppm", ["-png", "-r", String(RENDER_DPI), pdfPath, join(dir, "page")]);

    const files = (await readdir(dir))
      .filter((f) => f.startsWith("page") && f.endsWith(".png"))
      .sort((a, b) => {
        const na = Number(a.match(/(\d+)/)?.[1] ?? 0);
        const nb = Number(b.match(/(\d+)/)?.[1] ?? 0);
        return na - nb;
      });

    if (files.length === 0) {
      throw new OcrToolingError("pdftoppm produced no page images.", "pdftoppm");
    }

    const pages: string[] = [];
    for (const file of files) {
      const text = await run("tesseract", [
        join(dir, file),
        "stdout",
        "-l",
        "eng",
        "--psm",
        TESSERACT_PSM,
      ]);
      pages.push(text);
    }

    return { pages, pageCount: pages.length };
  } finally {
    await rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}
