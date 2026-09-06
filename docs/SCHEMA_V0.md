# RWA Normalized API — Schema v0

**Status:** draft for Product 1 (NAV / yield / eligibility slice)  
**Audience:** REST API + Claude/Cursor MCP tools  
**Non-goals:** full security-master parity with rwa.xyz, execution, AML case management  

---

## 1. Design principles

1. **Every number has a source + as_of.** No naked floats.
2. **Yield is normalized**, not copied from marketing pages.
3. **Eligibility is rule-based v0** (declarative flags), not live transfer simulation (that’s v1).
4. **Multi-chain inventory is a list**, not a single address.
5. **Unknown > wrong.** Prefer `null` + `quality` flags over invented values.
6. **Disclaimer:** data is informational, not investment advice / not an offer of securities.

---

## 2. Enums

```text
AssetClass:       treasury_fund | private_credit | commodity | equity_wrapper | cash_mgmt | other
WrapperType:      reg_d | forty_act_mmf | ucits_mmf | open_ended_fund | tokenized_note | unknown
NavModel:         stable_1 | continuous | periodic_daily | periodic_other | unknown
YieldType:        distributing | accumulating | mixed | unknown
EligibilityGate:  none | us_qp | non_us | kyc | allowlist | jurisdiction_block | unknown
Freshness:        fresh | stale | unknown
Quality:          verified | estimated | unavailable
```

---

## 3. Core objects

### 3.1 `Asset` (security-master lite)

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes | Stable slug, e.g. `buidl`, `ousg` |
| `name` | string | yes | Display name |
| `symbol` | string \| null | no | Common ticker if any |
| `asset_class` | AssetClass | yes | |
| `wrapper_type` | WrapperType | yes | Legal wrapper bucket (coarse) |
| `issuer` | string | yes | e.g. BlackRock, Ondo |
| `manager` | string \| null | no | If different from issuer |
| `custodian` | string \| null | no | |
| `transfer_agent` | string \| null | no | |
| `benchmark` | string \| null | no | Default `SOFR` for T-bill style |
| `nav_model` | NavModel | yes | |
| `yield_type` | YieldType | yes | |
| `chains` | ChainDeployment[] | yes | Can be empty only if `quality` says unavailable |
| `identifiers` | Identifiers | yes | ISIN/LEI etc. — nulls OK |
| `eligibility` | Eligibility | yes | |
| `nav` | NavSnapshot | yes | |
| `yield` | YieldSnapshot | yes | |
| `liquidity` | LiquiditySnapshot \| null | no | v0 optional |
| `links` | Links | yes | |
| `quality` | AssetQuality | yes | |
| `updated_at` | string (ISO-8601) | yes | Record build time (UTC) |

### 3.2 `ChainDeployment`

| Field | Type | Required | Notes |
|---|---|---|---|
| `chain_id` | number \| string | yes | EVM id or named chain key |
| `chain_name` | string | yes | e.g. `ethereum`, `solana` |
| `token_address` | string | yes | Canonical on that chain |
| `decimals` | number \| null | no | |
| `standard` | string \| null | no | `ERC-20`, `ERC-3643`, … |
| `bridge` | string \| null | no | If bridged representation |
| `supply` | Quantity \| null | no | On-chain supply if known |
| `source` | SourceRef | yes | |

### 3.3 `Identifiers`

| Field | Type | Required |
|---|---|---|
| `isin` | string \| null | no |
| `lei` | string \| null | no |
| `cusip` | string \| null | no |
| `other` | object \| null | no | free-form map |

### 3.4 `Eligibility` (v0 rules, not live `can_transfer`)

| Field | Type | Required | Notes |
|---|---|---|---|
| `gates` | EligibilityGate[] | yes | |
| `us_persons` | `allowed` \| `blocked` \| `unknown` | yes | Docs-level, not legal advice |
| `retail` | `allowed` \| `blocked` \| `unknown` | yes | |
| `min_ticket_usd` | number \| null | no | |
| `notes` | string \| null | no | Short human caveat |
| `source` | SourceRef | yes | |
| `quality` | Quality | yes | |

### 3.5 `NavSnapshot`

| Field | Type | Required | Notes |
|---|---|---|---|
| `value` | number \| null | yes | NAV per share/token in `currency` |
| `currency` | string | yes | `USD` default |
| `as_of` | string (ISO-8601) \| null | yes | |
| `model` | NavModel | yes | |
| `oracle` | string \| null | no | e.g. `redstone`, `issuer_api` |
| `freshness` | Freshness | yes | Policy: >36h without update → `stale` (tunable) |
| `source` | SourceRef | yes | |
| `quality` | Quality | yes | |

### 3.6 `YieldSnapshot` (normalized)

| Field | Type | Required | Notes |
|---|---|---|---|
| `gross_apy` | number \| null | yes | Issuer/marketing gross if disclosed |
| `net_apy` | number \| null | yes | After stated mgmt/fee drag when known |
| `fee_drag_bps` | number \| null | no | |
| `sofr_apy` | number \| null | no | Benchmark level used for spread |
| `spread_vs_sofr_bps` | number \| null | no | `(net_apy - sofr_apy) * 10000` |
| `yield_type` | YieldType | yes | |
| `as_of` | string \| null | yes | |
| `methodology` | string | yes | Short formula id, e.g. `net=gross-fee; spread=net-sofr` |
| `source` | SourceRef | yes | |
| `quality` | Quality | yes | |

### 3.7 `LiquiditySnapshot` (optional v0)

| Field | Type | Required | Notes |
|---|---|---|---|
| `redeemability` | `daily` \| `t_plus` \| `permissioned` \| `unknown` | yes | |
| `secondary_venues` | string[] | no | |
| `notes` | string \| null | no | |
| `source` | SourceRef | yes | |
| `quality` | Quality | yes | |

### 3.8 Shared: `SourceRef`, `Quantity`, `Links`, `AssetQuality`

```text
SourceRef:
  name: string          # "issuer", "defillama", "rwa.xyz_public", "manual"
  url: string | null
  retrieved_at: string  # ISO-8601

Quantity:
  amount: number | null
  as_of: string | null
  source: SourceRef
  quality: Quality

Links:
  website: string | null
  docs: string | null
  dashboard: string | null
  explorer: string[]    # optional tx/token links

AssetQuality:
  overall: Quality
  missing_fields: string[]   # e.g. ["identifiers.isin", "yield.gross_apy"]
  warnings: string[]         # e.g. ["nav.freshness=stale"]
```

---

## 4. API shapes (v0)

### `GET /v0/assets`
Returns `{ "as_of": "...", "count": N, "assets": AssetSummary[] }`  
`AssetSummary` = `id, name, symbol, asset_class, net_apy, spread_vs_sofr_bps, freshness, quality.overall`

### `GET /v0/assets/{id}`
Returns full `Asset`.

### `GET /v0/yields?sort=spread_vs_sofr_bps`
Returns list of `{ id, name, net_apy, spread_vs_sofr_bps, fee_drag_bps, as_of, quality }`

### `GET /v0/eligibility?asset_id=&wallet=&jurisdiction=`
v0 response:

```json
{
  "asset_id": "buidl",
  "wallet": null,
  "jurisdiction": "KR",
  "result": "unknown",
  "gates": ["us_qp"],
  "reasons": ["v0 is rules-only; live transfer simulation not implemented"],
  "rules_snapshot": { "us_persons": "blocked", "retail": "blocked", "min_ticket_usd": 5000000 },
  "quality": "estimated"
}
```

`result`: `likely_eligible` | `likely_ineligible` | `unknown`

---

## 5. MCP tools (v0)

| Tool | Maps to | Input |
|---|---|---|
| `list_rwa_assets` | `GET /v0/assets` | optional `asset_class` |
| `get_rwa_asset` | `GET /v0/assets/{id}` | `id` |
| `compare_yields` | `GET /v0/yields` | optional `benchmark=SOFR` |
| `check_eligibility` | `GET /v0/eligibility` | `asset_id`, optional `jurisdiction` |

Tool descriptions must say: **informational only; not investment advice.**

---

## 6. Freshness policy (v0)

- NAV `fresh` if `now - as_of <= 36h` (treasury/MMF style); else `stale`.
- If `as_of` null → `unknown` + `quality=unavailable`.
- Yield may lag NAV; do not invent daily marks.

---

## 7. Example: `GET /v0/assets/buidl` (illustrative — placeholder numbers)

> **Example data only.** Replace with sourced values before any external share. Fields marked estimated are intentional.

```json
{
  "id": "buidl",
  "name": "BlackRock USD Institutional Digital Liquidity Fund",
  "symbol": "BUIDL",
  "asset_class": "treasury_fund",
  "wrapper_type": "reg_d",
  "issuer": "BlackRock",
  "manager": "BlackRock",
  "custodian": "BNY Mellon",
  "transfer_agent": "Securitize",
  "benchmark": "SOFR",
  "nav_model": "stable_1",
  "yield_type": "distributing",
  "chains": [
    {
      "chain_id": 1,
      "chain_name": "ethereum",
      "token_address": "REPLACE_ME",
      "decimals": 6,
      "standard": "ERC-20",
      "bridge": null,
      "supply": null,
      "source": {
        "name": "manual",
        "url": null,
        "retrieved_at": "2026-09-06T00:00:00Z"
      }
    }
  ],
  "identifiers": {
    "isin": null,
    "lei": null,
    "cusip": null,
    "other": null
  },
  "eligibility": {
    "gates": ["us_qp", "allowlist"],
    "us_persons": "allowed",
    "retail": "blocked",
    "min_ticket_usd": null,
    "notes": "Qualified purchaser / permissioned transfer — confirm against current docs.",
    "source": {
      "name": "manual",
      "url": "https://app.rwa.xyz/platform-overview",
      "retrieved_at": "2026-09-06T00:00:00Z"
    },
    "quality": "estimated"
  },
  "nav": {
    "value": 1.0,
    "currency": "USD",
    "as_of": null,
    "model": "stable_1",
    "oracle": null,
    "freshness": "unknown",
    "source": {
      "name": "manual",
      "url": null,
      "retrieved_at": "2026-09-06T00:00:00Z"
    },
    "quality": "unavailable"
  },
  "yield": {
    "gross_apy": null,
    "net_apy": null,
    "fee_drag_bps": null,
    "sofr_apy": null,
    "spread_vs_sofr_bps": null,
    "yield_type": "distributing",
    "as_of": null,
    "methodology": "net=gross-fee; spread=net-sofr",
    "source": {
      "name": "manual",
      "url": null,
      "retrieved_at": "2026-09-06T00:00:00Z"
    },
    "quality": "unavailable"
  },
  "liquidity": {
    "redeemability": "permissioned",
    "secondary_venues": [],
    "notes": "Primary mint/redeem dominated; secondary may be thin.",
    "source": {
      "name": "manual",
      "url": null,
      "retrieved_at": "2026-09-06T00:00:00Z"
    },
    "quality": "estimated"
  },
  "links": {
    "website": null,
    "docs": null,
    "dashboard": "https://app.rwa.xyz/",
    "explorer": []
  },
  "quality": {
    "overall": "unavailable",
    "missing_fields": [
      "identifiers.isin",
      "nav.as_of",
      "yield.net_apy",
      "chains[0].token_address"
    ],
    "warnings": ["example_placeholder_do_not_publish_as_live_data"]
  },
  "updated_at": "2026-09-06T04:00:00Z"
}
```

---

## 8. Initial `id` list (coverage set)

| id | Working name |
|---|---|
| `buidl` | BlackRock BUIDL |
| `ousg` | Ondo OUSG |
| `usdy` | Ondo USDY |
| `ustb` | Superstate USTB |
| `benji` | Franklin BENJI / FOBXX |
| `spiko_ustbl` | Spiko USTBL |
| `spiko_eutbl` | Spiko EUTBL |
| `syrup_usdc` | Maple syrupUSDC |
| `jtrsy` | Janus Henderson JTRSY (swap to `acred` if better sourced) |
| `xaut` | Tether Gold XAUT |

---

## 9. Open questions (decide in Week 1)

1. Freshness threshold 24h vs 36h vs per-asset?
2. Eligibility v0: jurisdiction enum list (`US`,`non_US`,`KR`,`EU`,`other`)?
3. Do we expose `estimated` rows on Free tier, or only `verified`?
4. SOFR source of truth (which feed URL)?
5. Rename product publicly? (internal code name OK for now)

---

## 10. Changelog

- **v0 (2026-09-06):** initial schema for Product 1 slice.
