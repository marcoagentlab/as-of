import type { Asset, AssetQuality, Quality } from "./schema.ts";

const CRITICAL_NUMBER_PATHS = [
  "nav.value",
  "nav.as_of",
  "yield.net_apy",
  "yield.gross_apy",
] as const;

export function collectMissingFields(asset: Asset): string[] {
  const missing: string[] = [];
  const id = asset.identifiers ?? {};
  if (!id.isin) missing.push("identifiers.isin");
  if (!id.lei) missing.push("identifiers.lei");
  if (!id.cusip) missing.push("identifiers.cusip");
  if (!asset.chains.length) missing.push("chains");
  asset.chains.forEach((c, i) => {
    if (!c.token_address || c.token_address === "REPLACE_ME") {
      missing.push(`chains[${i}].token_address`);
    }
  });
  if (asset.nav.value == null) missing.push("nav.value");
  if (!asset.nav.as_of) missing.push("nav.as_of");
  if (asset.yield.gross_apy == null) missing.push("yield.gross_apy");
  if (asset.yield.net_apy == null) missing.push("yield.net_apy");
  if (asset.yield.sofr_apy == null) missing.push("yield.sofr_apy");
  if (asset.yield.spread_vs_sofr_bps == null) {
    missing.push("yield.spread_vs_sofr_bps");
  }
  if (!asset.links.website) missing.push("links.website");
  return missing;
}

export function collectWarnings(asset: Asset): string[] {
  const warnings = new Set<string>(asset.quality.warnings);
  warnings.add("seed_stub");
  if (asset.nav.freshness === "stale") warnings.add("nav.freshness=stale");
  if (asset.nav.freshness === "unknown") warnings.add("nav.freshness=unknown");
  if (asset.nav.quality === "unavailable") warnings.add("nav.quality=unavailable");
  if (asset.yield.quality === "unavailable") {
    warnings.add("yield.quality=unavailable");
  }
  if (asset.yield.sofr_apy == null) warnings.add("sofr_unavailable");
  if (!asset.chains.length) {
    warnings.add("chains_empty_no_invented_addresses");
  }
  return [...warnings];
}

export function overallQuality(asset: Asset): Quality {
  const missing = collectMissingFields(asset);
  const criticalMissing = CRITICAL_NUMBER_PATHS.filter((p) =>
    missing.includes(p),
  );
  const qualities: Quality[] = [
    asset.nav.quality,
    asset.yield.quality,
    asset.eligibility.quality,
    asset.liquidity?.quality ?? "unavailable",
  ];
  if (qualities.includes("verified") && criticalMissing.length === 0) {
    // v0 never promotes a stub row to verified even if a nested flag is set.
    if (asset.quality.warnings.includes("seed_stub")) return "estimated";
    return "verified";
  }
  if (criticalMissing.length === CRITICAL_NUMBER_PATHS.length) {
    return "unavailable";
  }
  if (qualities.every((q) => q === "unavailable")) return "unavailable";
  return "estimated";
}

export function deriveAssetQuality(asset: Asset): AssetQuality {
  return {
    overall: overallQuality(asset),
    missing_fields: collectMissingFields(asset),
    warnings: collectWarnings(asset),
  };
}

export function assertNoFakeVerified(asset: Asset): void {
  if (asset.quality.overall === "verified") {
    throw new Error(
      `asset ${asset.id} marked verified — v0 seeds must not invent verified numbers`,
    );
  }
  if (asset.nav.quality === "verified" && asset.nav.value == null) {
    throw new Error(`asset ${asset.id} nav verified with null value`);
  }
  if (asset.yield.quality === "verified" && asset.yield.net_apy == null) {
    throw new Error(`asset ${asset.id} yield verified with null net_apy`);
  }
}
