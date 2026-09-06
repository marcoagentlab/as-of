import { MANUAL_SOURCE, SEED_UPDATED_AT, YIELD_METHODOLOGY } from "../constants.ts";
import type {
  Asset,
  AssetClass,
  EligibilityGate,
  NavModel,
  WrapperType,
  YieldType,
} from "../schema.ts";

export type StubInput = {
  id: string;
  name: string;
  symbol: string | null;
  asset_class: AssetClass;
  wrapper_type: WrapperType;
  issuer: string;
  manager?: string | null;
  custodian?: string | null;
  transfer_agent?: string | null;
  benchmark?: string | null;
  nav_model: NavModel;
  yield_type: YieldType;
  gates: EligibilityGate[];
  us_persons: "allowed" | "blocked" | "unknown";
  retail: "allowed" | "blocked" | "unknown";
  min_ticket_usd?: number | null;
  eligibility_notes: string;
  redeemability?: "daily" | "t_plus" | "permissioned" | "unknown";
  liquidity_notes?: string | null;
  website?: string | null;
  docs?: string | null;
};

export function stubAsset(input: StubInput): Asset {
  const source = { ...MANUAL_SOURCE };
  return {
    id: input.id,
    name: input.name,
    symbol: input.symbol,
    asset_class: input.asset_class,
    wrapper_type: input.wrapper_type,
    issuer: input.issuer,
    manager: input.manager ?? input.issuer,
    custodian: input.custodian ?? null,
    transfer_agent: input.transfer_agent ?? null,
    benchmark: input.benchmark === undefined ? "SOFR" : input.benchmark,
    nav_model: input.nav_model,
    yield_type: input.yield_type,
    chains: [],
    identifiers: { isin: null, lei: null, cusip: null, other: null },
    eligibility: {
      gates: input.gates,
      us_persons: input.us_persons,
      retail: input.retail,
      min_ticket_usd: input.min_ticket_usd ?? null,
      notes: input.eligibility_notes,
      source,
      quality: "estimated",
    },
    nav: {
      value: null,
      currency: "USD",
      as_of: null,
      model: input.nav_model,
      oracle: null,
      freshness: "unknown",
      source,
      quality: "unavailable",
    },
    yield: {
      gross_apy: null,
      net_apy: null,
      fee_drag_bps: null,
      sofr_apy: null,
      spread_vs_sofr_bps: null,
      yield_type: input.yield_type,
      as_of: null,
      methodology: YIELD_METHODOLOGY,
      source,
      quality: "unavailable",
    },
    liquidity: {
      redeemability: input.redeemability ?? "unknown",
      secondary_venues: [],
      notes: input.liquidity_notes ?? null,
      source,
      quality: "estimated",
    },
    links: {
      website: input.website ?? null,
      docs: input.docs ?? null,
      dashboard: null,
      explorer: [],
    },
    quality: {
      overall: "unavailable",
      missing_fields: [],
      warnings: ["seed_stub"],
    },
    updated_at: SEED_UPDATED_AT,
  };
}
