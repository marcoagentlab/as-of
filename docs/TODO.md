# TODO (post-MVP)

v0 is a local demo: manual seeds, honest nulls, rules-only eligibility.

- [ ] Live ingest (issuer APIs / oracles). No ToS-gray scraping.
- [ ] SOFR source of truth — pick a feed URL; until then `sofr.json` stays null.
- [ ] `can_transfer` v1 — on-chain simulation; do not pretend v0 covers it.
- [ ] Token addresses and ISINs sourced per chain; empty lists stay empty until then.
- [ ] Freshness policy: 24h vs 36h vs per-asset (treasury/MMF vs other).
- [ ] Eligibility jurisdiction enum frozen (`US`, `non_US`, `KR`, `EU`, `other`).
- [ ] Free-tier: expose `estimated` rows, or only `verified`?
- [ ] Korea STO product surface — **out of v0**.
- [ ] Policy Gateway (who may see which fields).
- [ ] Billing / API keys beyond `DEMO_KEY`.
- [ ] Durable rate limit (v0 is an in-memory stub).
- [ ] Deploy (preview currently serves the explorer + `/v0/*` together).
- [ ] Public rename (internal name As-Of is fine for now).
- [ ] Swap `jtrsy` to `acred` if better sourced.
