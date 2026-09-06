import { FRESHNESS_HOURS } from "./constants.ts";
import type { Freshness, Quality } from "./schema";

export function navFreshness(
  asOf: string | null | undefined,
  now: Date = new Date(),
): { freshness: Freshness; qualityIfNoAsOf: Quality | null } {
  if (!asOf) {
    return { freshness: "unknown", qualityIfNoAsOf: "unavailable" };
  }
  const then = Date.parse(asOf);
  if (Number.isNaN(then)) {
    return { freshness: "unknown", qualityIfNoAsOf: "unavailable" };
  }
  const ageMs = now.getTime() - then;
  const windowMs = FRESHNESS_HOURS * 60 * 60 * 1000;
  if (ageMs <= windowMs) return { freshness: "fresh", qualityIfNoAsOf: null };
  return { freshness: "stale", qualityIfNoAsOf: null };
}

export function spreadVsSofrBps(
  netApy: number | null | undefined,
  sofrApy: number | null | undefined,
): number | null {
  if (netApy == null || sofrApy == null) return null;
  return Math.round((netApy - sofrApy) * 10000);
}

export function impliedNetApy(
  grossApy: number | null | undefined,
  feeDragBps: number | null | undefined,
): number | null {
  if (grossApy == null || feeDragBps == null) return null;
  return grossApy - feeDragBps / 10000;
}
