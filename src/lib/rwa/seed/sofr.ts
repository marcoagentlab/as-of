import { MANUAL_SOURCE } from "../constants.ts";
import type { SofrSnapshot } from "../schema.ts";

/** No SOFR feed sourced in v0. Spread vs SOFR stays null until a feed URL is chosen. */
export const sofr: SofrSnapshot = {
  sofr_apy: null,
  as_of: null,
  source: { ...MANUAL_SOURCE },
  quality: "unavailable",
  notes:
    "SOFR source of truth is an open question for week 1. v0 will not invent a benchmark print.",
};
