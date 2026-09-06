# As-Of — RWA Normalized API + MCP (schema v0)

Informational API for normalized NAV, yield vs SOFR, and eligibility rules.

Not a TVL dashboard. Not a trading bot. Not investment advice. Not a Korea STO engine.

**Unknown > wrong.** Every figure carries a `source` and `as_of`, or it is `null` with `quality: unavailable`.

## Layout

```
src/lib/rwa/          # zod schema, catalog, eligibility, freshness  (packages/schema)
src/lib/rwa/seed/     # 10 assets + sofr stub                         (packages/seed)
src/routes/v0.*       # REST /v0/*  (Hono-shaped contract on TanStack Start)
src/routes/*.tsx      # explorer (apps/web)
apps/mcp/index.mjs    # MCP stdio
docs/                 # SCHEMA_V0.md DISCLAIMER.md TODO.md
```

Stack: Node 22, TanStack Start, zod, MCP stdio.

## Run

```bash
npm install
npm run dev          # explorer + REST on the app port
npm test             # includes src/lib/rwa/rwa.test.ts
```

Default API key: `DEMO_KEY` (`x-api-key`). Override with `RWA_API_KEY`. See `.env.example`.

## REST

All data responses include `disclaimer` and `server_time`. Health is unauthenticated; the rest require `x-api-key: DEMO_KEY`. Rate-limit stub: 60 req/min, `X-RateLimit-*` headers.

```bash
curl -s http://127.0.0.1:8080/v0/health
curl -s -H 'x-api-key: DEMO_KEY' http://127.0.0.1:8080/v0/assets
curl -s -H 'x-api-key: DEMO_KEY' http://127.0.0.1:8080/v0/assets/buidl
curl -s -H 'x-api-key: DEMO_KEY' 'http://127.0.0.1:8080/v0/yields?sort=spread_vs_sofr_bps'
curl -s -H 'x-api-key: DEMO_KEY' 'http://127.0.0.1:8080/v0/eligibility?asset_id=usdy&jurisdiction=US'
```

`GET /v0/eligibility` returns `likely_eligible | likely_ineligible | unknown`. Default is unknown. US + `us_persons=blocked` → `likely_ineligible`. QP / allowlist / KYC never overclaim `likely_eligible`.

## MCP

```bash
node apps/mcp/index.mjs
```

Tools (descriptions start with **Informational only. Not investment advice.**):

| Tool | Maps to |
|---|---|
| `list_rwa_assets` | `GET /v0/assets` |
| `get_rwa_asset` | `GET /v0/assets/{id}` |
| `compare_yields` | `GET /v0/yields` |
| `check_eligibility` | `GET /v0/eligibility` |

Cursor / Claude `mcp.json` snippet:

```json
{
  "mcpServers": {
    "as-of": {
      "command": "node",
      "args": ["apps/mcp/index.mjs"],
      "env": {
        "RWA_API_BASE": "http://127.0.0.1:8080",
        "RWA_API_KEY": "DEMO_KEY"
      }
    }
  }
}
```

List tools without the API up:

```bash
printf '{"jsonrpc":"2.0","id":1,"method":"tools/list"}\n' | node apps/mcp/index.mjs
```

## Seeds

Coverage: `buidl` `ousg` `usdy` `ustb` `benji` `spiko_ustbl` `spiko_eutbl` `syrup_usdc` `jtrsy` `xaut`.

Structural fields (issuer, wrapper, gates) are `estimated` from public product shape. NAV, APY, SOFR, ISIN, and token addresses are **unavailable**. Empty `chains` rather than fake addresses. `sofr` is null until a feed is chosen. No seed is `verified`.

## Schema ambiguities (proposed, not silent)

1. Freshness window is **36h** for all assets in v0 (open: 24h vs per-asset).
2. Jurisdiction enum: `US | KR | EU | non_US | other`.
3. Free tier: v0 exposes `estimated` structure + `unavailable` marks. Do not hide stubs; label them.
4. SOFR feed: none. `spread_vs_sofr_bps` is null unless both APYs are non-null.
5. Public name: **As-Of**. Internal code name is fine.

See `docs/SCHEMA_V0.md`, `docs/DISCLAIMER.md`, `docs/TODO.md`.
