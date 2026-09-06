import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { Asset } from "./schema.ts";
import { rawAssets, COVERAGE_IDS } from "./seed/assets.ts";
import { sofr } from "./seed/sofr.ts";
import {
  compareYields,
  getAsset,
  listAssets,
  toSummary,
} from "./catalog.ts";
import { checkEligibility } from "./eligibility.ts";
import { navFreshness, spreadVsSofrBps } from "./freshness.ts";
import { deriveAssetQuality } from "./quality.ts";

describe("coverage set", () => {
  it("seeds exactly the 10 required ids", () => {
    const ids = rawAssets.map((a) => a.id).sort();
    assert.deepEqual(ids, [...COVERAGE_IDS].sort());
  });

  it("every seed parses as Asset v0", () => {
    for (const raw of rawAssets) {
      const parsed = Asset.parse(raw);
      assert.equal(parsed.id, raw.id);
    }
  });

  it("never marks invented numbers as verified", () => {
    for (const raw of listAssets()) {
      assert.notEqual(raw.quality.overall, "verified", raw.id);
      assert.notEqual(raw.nav.quality, "verified", raw.id);
      assert.notEqual(raw.yield.quality, "verified", raw.id);
      assert.equal(raw.nav.value, null, raw.id);
      assert.equal(raw.yield.net_apy, null, raw.id);
      assert.equal(raw.yield.gross_apy, null, raw.id);
    }
  });

  it("does not invent token addresses", () => {
    for (const raw of rawAssets) {
      assert.equal(raw.chains.length, 0, raw.id);
      for (const c of raw.chains) {
        assert.notEqual(c.token_address, "REPLACE_ME");
      }
    }
  });

  it("every asset carries seed_stub warning after hydrate", () => {
    for (const a of listAssets()) {
      assert.ok(a.quality.warnings.includes("seed_stub"), a.id);
      assert.ok(a.quality.missing_fields.includes("chains"), a.id);
    }
  });
});

describe("freshness policy", () => {
  it("null as_of → unknown", () => {
    assert.equal(navFreshness(null).freshness, "unknown");
  });

  it("within 36h → fresh", () => {
    const now = new Date("2026-09-06T12:00:00Z");
    const asOf = "2026-09-05T12:00:00Z"; // 24h
    assert.equal(navFreshness(asOf, now).freshness, "fresh");
  });

  it("older than 36h → stale", () => {
    const now = new Date("2026-09-06T12:00:00Z");
    const asOf = "2026-09-04T12:00:00Z"; // 48h
    assert.equal(navFreshness(asOf, now).freshness, "stale");
  });
});

describe("spread vs SOFR", () => {
  it("null if either APY is null", () => {
    assert.equal(spreadVsSofrBps(null, 0.043), null);
    assert.equal(spreadVsSofrBps(0.05, null), null);
    assert.equal(spreadVsSofrBps(null, null), null);
  });

  it("computes bps when both present", () => {
    assert.equal(spreadVsSofrBps(0.05, 0.043), 70);
  });

  it("sofr seed is unavailable", () => {
    assert.equal(sofr.sofr_apy, null);
    assert.equal(sofr.quality, "unavailable");
  });

  it("compareYields keeps nulls last", () => {
    const rows = compareYields({ sort: "spread_vs_sofr_bps" });
    assert.equal(rows.length, 10);
    assert.ok(rows.every((r) => r.spread_vs_sofr_bps == null));
  });
});

describe("eligibility v0", () => {
  it("US + us_persons blocked → likely_ineligible (usdy)", () => {
    const usdy = getAsset("usdy");
    assert.ok(usdy);
    const r = checkEligibility(usdy, "US");
    assert.equal(r.result, "likely_ineligible");
    assert.ok(r.reasons.some((x) => x.includes("rules-only")));
  });

  it("US + QP/allowlist → unknown, never likely_eligible (buidl)", () => {
    const buidl = getAsset("buidl");
    assert.ok(buidl);
    const r = checkEligibility(buidl, "US");
    assert.equal(r.result, "unknown");
  });

  it("KR on usdy is unknown, not overclaimed", () => {
    const usdy = getAsset("usdy");
    assert.ok(usdy);
    const r = checkEligibility(usdy, "KR");
    assert.equal(r.result, "unknown");
    assert.equal(r.jurisdiction, "KR");
  });

  it("missing jurisdiction defaults unknown", () => {
    const benji = getAsset("benji");
    assert.ok(benji);
    const r = checkEligibility(benji, null);
    assert.equal(r.result, "unknown");
  });

  it("wallet is ignored", () => {
    const buidl = getAsset("buidl");
    assert.ok(buidl);
    const r = checkEligibility(buidl, "KR", "0xabc");
    assert.equal(r.wallet, "0xabc");
    assert.ok(r.reasons.some((x) => x.includes("wallet")));
  });
});

describe("summaries", () => {
  it("list + summary shape", () => {
    const assets = listAssets().map(toSummary);
    assert.equal(assets.length, 10);
    for (const s of assets) {
      assert.ok(s.id);
      assert.equal(s.net_apy, null);
      assert.equal(s.spread_vs_sofr_bps, null);
    }
  });

  it("derive quality stays unavailable on stubs", () => {
    for (const a of listAssets()) {
      const q = deriveAssetQuality(a);
      assert.equal(q.overall, "unavailable");
    }
  });
});
