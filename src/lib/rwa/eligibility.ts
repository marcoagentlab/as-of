import { JURISDICTIONS, type Jurisdiction } from "./constants.ts";
import type { Asset, EligibilityCheck } from "./schema.ts";

export function normalizeJurisdiction(
  raw: string | null | undefined,
): Jurisdiction | null {
  if (raw == null || raw.trim() === "") return null;
  const key = raw.trim().replace(/[\s-]/g, "_").toUpperCase();
  if (key === "USA" || key === "UNITED_STATES") return "US";
  if (key === "KOREA" || key === "SOUTH_KOREA" || key === "KOR") return "KR";
  if (key === "EUROPE" || key === "EEA") return "EU";
  if (key === "NONUS" || key === "NON_US") return "non_US";
  if ((JURISDICTIONS as readonly string[]).includes(key)) {
    return key as Jurisdiction;
  }
  if (key === "OTHER") return "other";
  return "other";
}

/**
 * v0 is docs-level rules only. Default is unknown (safe).
 * Never overclaim likely_eligible when QP / allowlist / KYC / unknown gates exist.
 * US + us_persons blocked → likely_ineligible.
 */
export function checkEligibility(
  asset: Asset,
  jurisdictionRaw?: string | null,
  wallet?: string | null,
): EligibilityCheck {
  const jurisdiction = normalizeJurisdiction(jurisdictionRaw);
  const { eligibility } = asset;
  const gates = eligibility.gates;
  const reasons: string[] = [
    "v0 is rules-only; live transfer simulation not implemented",
  ];

  if (wallet) {
    reasons.push("wallet parameter ignored in v0; no on-chain can_transfer");
  }
  if (!jurisdiction) {
    reasons.push("no jurisdiction supplied; defaulting to unknown");
  }

  const restrictive = gates.some((g) =>
    g === "us_qp" ||
    g === "allowlist" ||
    g === "kyc" ||
    g === "jurisdiction_block" ||
    g === "unknown",
  );

  let result: EligibilityCheck["result"] = "unknown";
  const isUS = jurisdiction === "US";
  const usBlocked =
    eligibility.us_persons === "blocked" || gates.includes("non_us");

  if (isUS && usBlocked) {
    result = "likely_ineligible";
    reasons.push(
      "jurisdiction US and us_persons are blocked at docs level — not legal advice",
    );
  } else if (restrictive) {
    result = "unknown";
    reasons.push(
      "permissioned or unknown gates present (QP / allowlist / KYC / unknown); v0 will not claim eligibility",
    );
  } else if (
    gates.length === 1 &&
    gates[0] === "none" &&
    eligibility.retail === "allowed" &&
    ((isUS && eligibility.us_persons === "allowed") ||
      (!isUS && jurisdiction != null && eligibility.us_persons !== "unknown"))
  ) {
    result = "likely_eligible";
    reasons.push(
      "rules snapshot shows no restrictive gates; this is not a determination of eligibility",
    );
  } else {
    result = "unknown";
    reasons.push("insufficient rules to classify; unknown > wrong");
  }

  return {
    asset_id: asset.id,
    wallet: wallet ?? null,
    jurisdiction,
    result,
    gates,
    reasons,
    rules_snapshot: {
      us_persons: eligibility.us_persons,
      retail: eligibility.retail,
      min_ticket_usd: eligibility.min_ticket_usd ?? null,
    },
    quality: eligibility.quality,
  };
}
