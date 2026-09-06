# TODO (post-MVP)

v0 is a local demo: manual seeds, honest nulls, rules-only eligibility.

Official runtime is **npm / `npm run dev` / :8080**. Do not revive a pnpm or Hono `:8787` path unless the contract is explicitly changed.

- [ ] Live ingest (issuer APIs / oracles). No ToS-gray scraping.
- [ ] SOFR source of truth — pick a feed URL; until then `src/lib/rwa/seed/sofr.ts` stays `sofr_apy: null` / `quality: unavailable`. Do not hardcode a print.
- [ ] `can_transfer` v1 — on-chain simulation; do not pretend v0 covers it.
- [ ] Token addresses and ISINs sourced per chain; empty lists stay empty until then.
- [ ] Freshness policy: 24h vs 36h vs per-asset (treasury/MMF vs other).
- [ ] Eligibility jurisdiction enum frozen (`US`, `non_US`, `KR`, `EU`, `other`).
- [ ] Free-tier: expose `estimated` rows, or only `verified`?
- [ ] Korea STO product surface — **out of v0**.
- [ ] Policy Gateway (who may see which fields).
- [ ] Billing / API keys beyond `DEMO_KEY`.
- [ ] Durable rate limit (v0 is an in-memory stub in `src/lib/rwa/http.ts`; 60/min per process).
- [ ] Deploy (preview currently serves the explorer + `/v0/*` together).
- [ ] Public rename (internal name As-Of is fine for now).
- [ ] Swap `jtrsy` to `acred` if better sourced.
- [ ] Replace host scaffold (`src/lib/auth`, PWA, multiplayer) only if leaving this workspace — see `docs/ARCHITECTURE.md`.
