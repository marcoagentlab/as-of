import { Asset, type AssetSummary, type YieldRow } from "./schema.ts";
import { rawAssets } from "./seed/assets.ts";
import { sofr } from "./seed/sofr.ts";
import { navFreshness, spreadVsSofrBps } from "./freshness.ts";
import { deriveAssetQuality, assertNoFakeVerified } from "./quality.ts";
import type { Asset as AssetT, SofrSnapshot } from "./schema.ts";

function hydrate(raw: AssetT, now: Date, sofrSnap: SofrSnapshot): AssetT {
  const sofrApy = sofrSnap.sofr_apy;
  const { freshness } = navFreshness(raw.nav.as_of, now);
  const navQuality =
    raw.nav.as_of == null || raw.nav.value == null ? "unavailable" : raw.nav.quality;

  const netApy = raw.yield.net_apy;
  const spread = spreadVsSofrBps(netApy, sofrApy);

  const next: AssetT = {
    ...raw,
    nav: {
      ...raw.nav,
      freshness,
      quality: navQuality,
    },
    yield: {
      ...raw.yield,
      sofr_apy: sofrApy,
      spread_vs_sofr_bps: spread,
    },
  };
  next.quality = deriveAssetQuality(next);
  assertNoFakeVerified(next);
  return Asset.parse(next);
}

let cached: { assets: AssetT[]; sofr: SofrSnapshot } | null = null;

function loadAll(now: Date = new Date()): AssetT[] {
  // Recompute freshness each call; parse once.
  if (!cached) {
    cached = {
      assets: rawAssets.map((a) => Asset.parse(a)),
      sofr,
    };
  }
  return cached.assets.map((a) => hydrate(a, now, cached!.sofr));
}

export function getSofr(): SofrSnapshot {
  return sofr;
}

export function listAssets(filter?: {
  asset_class?: string | null;
  now?: Date;
}): AssetT[] {
  const now = filter?.now ?? new Date();
  const all = loadAll(now);
  if (!filter?.asset_class) return all;
  return all.filter((a) => a.asset_class === filter.asset_class);
}

export function getAsset(id: string, now: Date = new Date()): AssetT | null {
  const key = id.trim().toLowerCase();
  return loadAll(now).find((a) => a.id === key) ?? null;
}

export function toSummary(asset: AssetT): AssetSummary {
  return {
    id: asset.id,
    name: asset.name,
    symbol: asset.symbol ?? null,
    asset_class: asset.asset_class,
    issuer: asset.issuer,
    wrapper_type: asset.wrapper_type,
    net_apy: asset.yield.net_apy,
    spread_vs_sofr_bps: asset.yield.spread_vs_sofr_bps ?? null,
    freshness: asset.nav.freshness,
    quality: asset.quality.overall,
  };
}

export function toYieldRow(asset: AssetT): YieldRow {
  return {
    id: asset.id,
    name: asset.name,
    symbol: asset.symbol ?? null,
    net_apy: asset.yield.net_apy,
    gross_apy: asset.yield.gross_apy,
    spread_vs_sofr_bps: asset.yield.spread_vs_sofr_bps ?? null,
    fee_drag_bps: asset.yield.fee_drag_bps ?? null,
    sofr_apy: asset.yield.sofr_apy ?? null,
    as_of: asset.yield.as_of,
    methodology: asset.yield.methodology,
    quality: asset.yield.quality,
  };
}

export function compareYields(opts?: {
  sort?: string | null;
  now?: Date;
}): YieldRow[] {
  const rows = listAssets({ now: opts?.now }).map(toYieldRow);
  const SORT_KEYS = [
    "spread_vs_sofr_bps",
    "net_apy",
    "gross_apy",
    "fee_drag_bps",
  ] as const;
  type SortKey = (typeof SORT_KEYS)[number];
  const requested = opts?.sort ?? "spread_vs_sofr_bps";
  const key: SortKey = (SORT_KEYS as readonly string[]).includes(requested)
    ? (requested as SortKey)
    : "spread_vs_sofr_bps";

  return [...rows].sort((a, b) => {
    const av = a[key];
    const bv = b[key];
    if (av == null && bv == null) return a.id.localeCompare(b.id);
    if (av == null) return 1; // nulls last
    if (bv == null) return -1;
    return bv - av;
  });
}

export function coverageIds(): string[] {
  return loadAll().map((a) => a.id);
}
