export const SCHEMA_VERSION = "v0";

export const DISCLAIMER =
  "Informational only. Not investment advice. Not an offer of securities. Eligibility is rule-based v0, not a live transfer simulation. Figures without a source are shown as unavailable.";

export const DISCLAIMER_KO =
  "본 정보는 참고용이며 투자 자문이나 증권의 모집·청약이 아닙니다. 자격 판정은 v0 규칙 스냅샷이며 실제 이전(can_transfer) 시뮬레이션이 아닙니다.";

export const YIELD_METHODOLOGY = "net=gross-fee; spread=net-sofr";

/** NAV freshness window. Open question: 24h vs 36h vs per-asset — 36h for v0. */
export const FRESHNESS_HOURS = 36;

export const DEMO_API_KEY = "DEMO_KEY";

export const RATE_LIMIT_PER_MINUTE = 60;

export const SEED_RETRIEVED_AT = "2026-09-06T00:00:00Z";
export const SEED_UPDATED_AT = "2026-09-06T04:00:00Z";

export const MANUAL_SOURCE = {
  name: "manual",
  url: null as string | null,
  retrieved_at: SEED_RETRIEVED_AT,
};

export const JURISDICTIONS = ["US", "KR", "EU", "non_US", "other"] as const;
export type Jurisdiction = (typeof JURISDICTIONS)[number];
