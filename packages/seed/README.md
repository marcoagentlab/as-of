Canonical v0 seeds live in `src/lib/rwa/seed/` (TypeScript, zod-validated on load). This folder is a pointer, not a JSON package.

- `src/lib/rwa/seed/assets.ts` — 10 coverage ids, honest nulls, `warnings: seed_stub`
- `src/lib/rwa/seed/sofr.ts` — `sofr_apy: null`, `quality: unavailable`

Do not invent token addresses or verified APYs here. SOFR stays null until a feed URL is chosen (`docs/TODO.md`).
