# Architecture (v0.1)

## Official runtime

npm · `npm run dev` · `0.0.0.0:8080` · `x-api-key: DEMO_KEY` · MCP `node apps/mcp/index.mjs` with `RWA_API_BASE=http://127.0.0.1:8080`.

There is no pnpm workspace and no Hono process on `:8787`. Those were the original Product 1 brief; this repo did not implement them.

## Why TanStack Start instead of the Hono monorepo brief

The original handoff asked for `apps/api` (Hono, port 8787), `apps/mcp`, `apps/web`, `packages/schema`, `packages/seed`. The workspace this product was built in is a **TanStack Start (Vite) app** that already binds `:8080` and serves both the explorer UI and server route handlers.

So Product 1 is a single Start app:

| Brief (not implemented) | Actual |
|---|---|
| `apps/api` Hono `:8787` | `src/routes/v0.*` file routes on Start `:8080` |
| `packages/schema` published package | `src/lib/rwa/schema.ts` (canonical). `packages/schema` re-exports it |
| `packages/seed` JSON files | `src/lib/rwa/seed/*.ts` (canonical, zod-parsed on load). `packages/seed` is a pointer README |
| `apps/mcp` MCP SDK stdio | `apps/mcp/index.mjs` thin REST client over stdio JSON-RPC |
| `apps/web` | `src/routes/*.tsx` explorer (`/`, `/assets/$id`, `/yields`, `/eligibility`) |

REST shapes (`/v0/health|assets|yields|eligibility`), MCP tool names, disclaimer envelope, and schema v0 enums match the brief. The host framework does not.

## Product 1 source of truth

```
src/lib/rwa/          canonical zod schema, catalog, eligibility, freshness, HTTP envelope
src/lib/rwa/seed/     10 assets + sofr stub (sofr_apy remains null)
src/routes/v0.*       REST /v0/*
src/routes/*.tsx      explorer UI for those endpoints
apps/mcp/index.mjs    MCP stdio (tools/list works without the API; calls need :8080)
docs/                 SCHEMA_V0.md DISCLAIMER.md TODO.md ARCHITECTURE.md
```

`GET /v0/assets/:id` returns `{ asset, disclaimer, server_time, schema }` — envelope plus the Asset object — not a bare Asset. Additive vs `docs/SCHEMA_V0.md` §4.

## Out of Product 1 scope (kept, not deleted)

The following exist because this repo runs on the Grok App Builder host. They are **not** the RWA product. Do not treat them as a Korea STO engine, auth product, or multiplayer layer.

- `src/lib/auth/**`, `src/lib/app-data/**`, `src/lib/db.ts`, `migrations/`
- `src/lib/multiplayer/**`
- `scripts/grok-pwa-*`, `server/middleware/grok-pwa.ts`, `public/__grok/`
- `src/components/preview-host-bridge.tsx` and `<AuthProvider>` in `__root.tsx` (host contracts)

Auth is off. No accounts. No live ingest. No `can_transfer`. `package.json` `name` stays the host workspace id (`app-builder-workspace`); the product name is **As-Of**.

## Rate limit

`src/lib/rwa/http.ts` keeps an in-process map, 60 requests / 60s / caller key. Not durable, not shared across processes. Documented in README and `docs/TODO.md`.
