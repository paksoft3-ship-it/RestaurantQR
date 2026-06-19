/**
 * Cookie consent model + reducer. Pure and framework-free so it is unit-testable
 * and can later drive real analytics/marketing providers.
 */

export const COOKIE_CATEGORIES = ["essential", "preferences", "analytics", "marketing"] as const;
export type CookieCategory = (typeof COOKIE_CATEGORIES)[number];

export type CookieChoices = Record<CookieCategory, boolean>;

export interface ConsentState {
  version: number;
  decided: boolean;
  choices: CookieChoices;
  updatedAt: string | null;
}

export const CONSENT_VERSION = 1;
export const CONSENT_STORAGE_KEY = "yp_cookie_consent";

/** Essential is always on; optional categories default OFF until consent. */
export function defaultChoices(): CookieChoices {
  return { essential: true, preferences: false, analytics: false, marketing: false };
}

export function initialConsent(): ConsentState {
  return { version: CONSENT_VERSION, decided: false, choices: defaultChoices(), updatedAt: null };
}

export type ConsentAction =
  | { type: "accept-all" }
  | { type: "reject-optional" }
  | { type: "save"; choices: Partial<CookieChoices> }
  | { type: "reset" }
  | { type: "toggle"; category: CookieCategory };

export function consentReducer(state: ConsentState, action: ConsentAction): ConsentState {
  const stamp = new Date().toISOString();
  switch (action.type) {
    case "accept-all":
      return {
        version: CONSENT_VERSION,
        decided: true,
        choices: { essential: true, preferences: true, analytics: true, marketing: true },
        updatedAt: stamp,
      };
    case "reject-optional":
      return { version: CONSENT_VERSION, decided: true, choices: defaultChoices(), updatedAt: stamp };
    case "save":
      return {
        version: CONSENT_VERSION,
        decided: true,
        choices: { ...state.choices, ...action.choices, essential: true },
        updatedAt: stamp,
      };
    case "toggle":
      if (action.category === "essential") return state; // essential cannot be disabled
      return {
        ...state,
        choices: { ...state.choices, [action.category]: !state.choices[action.category] },
      };
    case "reset":
      return initialConsent();
    default:
      return state;
  }
}

export function loadConsent(): ConsentState {
  if (typeof window === "undefined") return initialConsent();
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return initialConsent();
    const parsed = JSON.parse(raw) as ConsentState;
    if (!parsed || parsed.version !== CONSENT_VERSION) return initialConsent();
    return { ...initialConsent(), ...parsed, choices: { ...defaultChoices(), ...parsed.choices } };
  } catch {
    return initialConsent();
  }
}

export function saveConsent(state: ConsentState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore storage failures
  }
}

export const CATEGORY_META: Record<
  CookieCategory,
  { label: string; description: string; locked?: boolean }
> = {
  essential: {
    label: "Essential",
    description: "Required for core functionality such as security and remembering your choices.",
    locked: true,
  },
  preferences: {
    label: "Preferences",
    description: "Remember choices like language to personalise your experience.",
  },
  analytics: {
    label: "Analytics",
    description: "Help us understand aggregate usage. No analytics tools are active in this build.",
  },
  marketing: {
    label: "Marketing",
    description: "Support measurement of campaigns. Disabled until you opt in.",
  },
};
