import localFont from "next/font/local";

/*
  Fonts are self-hosted (vendored from Fontsource) so builds work offline and in
  CI without reaching Google Fonts. Manrope = headings/display, Inter = body/UI.
*/

export const manrope = localFont({
  variable: "--font-manrope",
  display: "swap",
  src: [
    { path: "../app/fonts/manrope-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../app/fonts/manrope-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../app/fonts/manrope-latin-700-normal.woff2", weight: "700", style: "normal" },
    { path: "../app/fonts/manrope-latin-800-normal.woff2", weight: "800", style: "normal" },
  ],
});

export const inter = localFont({
  variable: "--font-inter",
  display: "swap",
  src: [
    { path: "../app/fonts/inter-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../app/fonts/inter-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../app/fonts/inter-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../app/fonts/inter-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
});

export const fontVariables = `${manrope.variable} ${inter.variable}`;
