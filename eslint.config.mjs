import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // React Compiler advisory: flags the SSR-safe pattern of hydrating
      // persisted client state (localStorage/locale/consent) via setState in a
      // mount effect. That pattern is intentional here, so treat as a warning.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
]);

export default eslintConfig;
