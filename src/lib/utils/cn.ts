import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/*
  Our design tokens add custom font-size utilities (text-display/h1/h2/h3/body/
  body-bold/small/button). By default tailwind-merge mistakes these for text-COLOR
  utilities and drops a conflicting `text-<color>` class — which would silently
  strip a button's variant text color. Register them as font-size so merging is
  correct (a font-size and a text-color can safely coexist).
*/
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        { text: ["display", "h1", "h2", "h3", "body", "body-bold", "small", "button"] },
      ],
    },
  },
});

/** Merge conditional class names and de-duplicate conflicting Tailwind utilities. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
