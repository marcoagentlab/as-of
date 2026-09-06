import { z } from "zod";

export const AssetClass = z.enum([
  "treasury_fund",
  "private_credit",
  "commodity",
  "equity_wrapper",
  "cash_mgmt",
  "other",
]);
export type AssetClass = z.infer<typeof AssetClass>;

export const WrapperType = z.enum([
  "reg_d",
  "forty_act_mmf",
  "ucits_mmf",
  "open_ended_fund",
  "tokenized_note",
  "unknown",
]);
export type WrapperType = z.infer<typeof WrapperType>;

export const NavModel = z.enum([
  "stable_1",
  "continuous",
  "periodic_daily",
  "periodic_other",
  "unknown",
]);
export type NavModel = z.infer<typeof NavModel>;

export const YieldType = z.enum([
  "distributing",
  "accumulating",
  "mixed",
  "unknown",
]);
export type YieldType = z.infer<typeof YieldType>;

export const EligibilityGate = z.enum([
  "none",
  "us_qp",
  "non_us",
  "kyc",
  "allowlist",
  "jurisdiction_block",
  "unknown",
]);
export type EligibilityGate = z.infer<typeof EligibilityGate>;

export const Freshness = z.enum(["fresh", "stale", "unknown"]);
export type Freshness = z.infer<typeof Freshness>;

export const Quality = z.enum(["verified", "estimated", "unavailable"]);
export type Quality = z.infer<typeof Quality>;

export const AccessFlag = z.enum(["allowed", "blocked", "unknown"]);
export type AccessFlag = z.infer<typeof AccessFlag>;

export const Redeemability = z.enum([
  "daily",
  "t_plus",
  "permissioned",
  "unknown",
]);
export type Redeemability = z.infer<typeof Redeemability>;

export const SourceRef = z.object({
  name: z.string().min(1),
  url: z.string().nullable(),
  retrieved_at: z.string(),
});
export type SourceRef = z.infer<typeof SourceRef>;

export const Quantity = z.object({
  amount: z.number().nullable(),
  as_of: z.string().nullable(),
  source: SourceRef,
  quality: Quality,
});
export type Quantity = z.infer<typeof Quantity>;

export const ChainDeployment = z.object({
  chain_id: z.union([z.number(), z.string()]),
  chain_name: z.string().min(1),
  token_address: z.string().min(1),
  decimals: z.number().nullable().optional(),
  standard: z.string().nullable().optional(),
  bridge: z.string().nullable().optional(),
  supply: Quantity.nullable().optional(),
  source: SourceRef,
});
export type ChainDeployment = z.infer<typeof ChainDeployment>;

export const Identifiers = z.object({
  isin: z.string().nullable().optional(),
  lei: z.string().nullable().optional(),
  cusip: z.string().nullable().optional(),
  other: z.record(z.string(), z.unknown()).nullable().optional(),
});
export type Identifiers = z.infer<typeof Identifiers>;

export const Eligibility = z.object({
  gates: z.array(EligibilityGate),
  us_persons: AccessFlag,
  retail: AccessFlag,
  min_ticket_usd: z.number().nullable().optional(),
  notes: z.string().nullable().optional(),
  source: SourceRef,
  quality: Quality,
});
export type Eligibility = z.infer<typeof Eligibility>;

export const NavSnapshot = z.object({
  value: z.number().nullable(),
  currency: z.string().min(1),
  as_of: z.string().nullable(),
  model: NavModel,
  oracle: z.string().nullable().optional(),
  freshness: Freshness,
  source: SourceRef,
  quality: Quality,
});
export type NavSnapshot = z.infer<typeof NavSnapshot>;

export const YieldSnapshot = z.object({
  gross_apy: z.number().nullable(),
  net_apy: z.number().nullable(),
  fee_drag_bps: z.number().nullable().optional(),
  sofr_apy: z.number().nullable().optional(),
  spread_vs_sofr_bps: z.number().nullable().optional(),
  yield_type: YieldType,
  as_of: z.string().nullable(),
  methodology: z.string().min(1),
  source: SourceRef,
  quality: Quality,
});
export type YieldSnapshot = z.infer<typeof YieldSnapshot>;

export const LiquiditySnapshot = z.object({
  redeemability: Redeemability,
  secondary_venues: z.array(z.string()).optional(),
  notes: z.string().nullable().optional(),
  source: SourceRef,
  quality: Quality,
});
export type LiquiditySnapshot = z.infer<typeof LiquiditySnapshot>;

export const Links = z.object({
  website: z.string().nullable(),
  docs: z.string().nullable(),
  dashboard: z.string().nullable(),
  explorer: z.array(z.string()),
});
export type Links = z.infer<typeof Links>;

export const AssetQuality = z.object({
  overall: Quality,
  missing_fields: z.array(z.string()),
  warnings: z.array(z.string()),
});
export type AssetQuality = z.infer<typeof AssetQuality>;

export const Asset = z.object({
  id: z.string().regex(/^[a-z0-9_]+$/),
  name: z.string().min(1),
  symbol: z.string().nullable().optional(),
  asset_class: AssetClass,
  wrapper_type: WrapperType,
  issuer: z.string().min(1),
  manager: z.string().nullable().optional(),
  custodian: z.string().nullable().optional(),
  transfer_agent: z.string().nullable().optional(),
  benchmark: z.string().nullable().optional(),
  nav_model: NavModel,
  yield_type: YieldType,
  chains: z.array(ChainDeployment),
  identifiers: Identifiers,
  eligibility: Eligibility,
  nav: NavSnapshot,
  yield: YieldSnapshot,
  liquidity: LiquiditySnapshot.nullable().optional(),
  links: Links,
  quality: AssetQuality,
  updated_at: z.string(),
});
export type Asset = z.infer<typeof Asset>;

export const AssetSummary = z.object({
  id: z.string(),
  name: z.string(),
  symbol: z.string().nullable(),
  asset_class: AssetClass,
  issuer: z.string(),
  wrapper_type: WrapperType,
  net_apy: z.number().nullable(),
  spread_vs_sofr_bps: z.number().nullable(),
  freshness: Freshness,
  quality: Quality,
});
export type AssetSummary = z.infer<typeof AssetSummary>;

export const YieldRow = z.object({
  id: z.string(),
  name: z.string(),
  symbol: z.string().nullable(),
  net_apy: z.number().nullable(),
  gross_apy: z.number().nullable(),
  spread_vs_sofr_bps: z.number().nullable(),
  fee_drag_bps: z.number().nullable(),
  sofr_apy: z.number().nullable(),
  as_of: z.string().nullable(),
  methodology: z.string(),
  quality: Quality,
});
export type YieldRow = z.infer<typeof YieldRow>;

export const EligibilityResult = z.enum([
  "likely_eligible",
  "likely_ineligible",
  "unknown",
]);
export type EligibilityResult = z.infer<typeof EligibilityResult>;

export const EligibilityCheck = z.object({
  asset_id: z.string(),
  wallet: z.string().nullable(),
  jurisdiction: z.string().nullable(),
  result: EligibilityResult,
  gates: z.array(EligibilityGate),
  reasons: z.array(z.string()),
  rules_snapshot: z.object({
    us_persons: AccessFlag,
    retail: AccessFlag,
    min_ticket_usd: z.number().nullable(),
  }),
  quality: Quality,
});
export type EligibilityCheck = z.infer<typeof EligibilityCheck>;

export const SofrSnapshot = z.object({
  sofr_apy: z.number().nullable(),
  as_of: z.string().nullable(),
  source: SourceRef,
  quality: Quality,
  notes: z.string().nullable().optional(),
});
export type SofrSnapshot = z.infer<typeof SofrSnapshot>;
