import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { checkEligibility } from "@/lib/rwa/eligibility";
import { listAssets } from "@/lib/rwa/catalog";
import { JURISDICTIONS } from "@/lib/rwa/constants";
import { formatUsd, gateLabel } from "@/lib/rwa/format";
import { JsonPeek } from "@/components/asof/json-peek";
import { QualityMark, ResultMark } from "@/components/asof/marks";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/eligibility")({
  loader: () => ({ assets: listAssets() }),
  component: EligibilityPage,
});

function EligibilityPage() {
  const { assets } = Route.useLoaderData();
  const [assetId, setAssetId] = useState(assets[0]?.id ?? "buidl");
  const [jurisdiction, setJurisdiction] = useState<(typeof JURISDICTIONS)[number] | "">("");
  const asset = useMemo(
    () => assets.find((a) => a.id === assetId) ?? assets[0],
    [assets, assetId],
  );
  const result = useMemo(
    () => (asset ? checkEligibility(asset, jurisdiction || null) : null),
    [asset, jurisdiction],
  );

  return (
    <div className="stagger-in space-y-6">
      <header className="space-y-2">
        <h2 className="font-display text-3xl tracking-tight">Eligibility</h2>
        <p className="max-w-2xl text-sm text-muted">
          Rule snapshot only. v0 will not simulate a transfer, will not inspect a wallet, and
          will not claim likely_eligible when QP, allowlist, or KYC gates are present. Default
          is unknown — unknown is safer than wrong.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,20rem)_1fr]">
        <form
          className="rounded-xl bg-surface p-4 shadow-border sm:p-5"
          onSubmit={(e) => e.preventDefault()}
        >
          <label className="block">
            <span className="font-mono text-xs tracking-wide text-subtle uppercase">Asset</span>
            <select
              className="mt-2 min-h-11 w-full rounded-md border border-line bg-raised px-3 text-sm text-fg"
              value={assetId}
              onChange={(e) => setAssetId(e.target.value)}
            >
              {assets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.symbol ?? a.id} — {a.name}
                </option>
              ))}
            </select>
          </label>
          <fieldset className="mt-5">
            <legend className="font-mono text-xs tracking-wide text-subtle uppercase">
              Jurisdiction
            </legend>
            <div className="mt-2 flex flex-wrap gap-1">
              <button
                type="button"
                onClick={() => setJurisdiction("")}
                className={cn(
                  "min-h-11 rounded-md px-3 text-sm",
                  jurisdiction === ""
                    ? "bg-accent text-accent-fg"
                    : "bg-raised text-muted hover:text-fg",
                )}
              >
                Unspecified
              </button>
              {JURISDICTIONS.map((j) => (
                <button
                  key={j}
                  type="button"
                  onClick={() => setJurisdiction(j)}
                  className={cn(
                    "min-h-11 rounded-md px-3 text-sm",
                    jurisdiction === j
                      ? "bg-accent text-accent-fg"
                      : "bg-raised text-muted hover:text-fg",
                  )}
                >
                  {j}
                </button>
              ))}
            </div>
          </fieldset>
        </form>

        {result && asset ? (
          <div className="space-y-4 rounded-xl bg-surface p-4 shadow-border sm:p-5">
            <div className="flex flex-wrap items-center gap-2">
              <ResultMark value={result.result} />
              <QualityMark value={result.quality} />
              <span className="font-mono text-xs text-subtle">
                {result.asset_id}
                {result.jurisdiction ? ` · ${result.jurisdiction}` : ""}
              </span>
            </div>
            <p className="font-display text-2xl tracking-tight">
              {result.result === "likely_ineligible"
                ? "Likely ineligible under v0 rules"
                : result.result === "likely_eligible"
                  ? "Likely eligible under v0 rules"
                  : "Unknown — not enough to classify"}
            </p>
            <ul className="space-y-2 text-sm text-muted">
              {result.reasons.map((r) => (
                <li key={r} className="border-l border-line pl-3">
                  {r}
                </li>
              ))}
            </ul>
            <dl className="grid gap-2 border-t border-line pt-4 text-sm sm:grid-cols-3">
              <div>
                <dt className="font-mono text-xs text-subtle uppercase">US persons</dt>
                <dd className="mt-1 font-mono">{result.rules_snapshot.us_persons}</dd>
              </div>
              <div>
                <dt className="font-mono text-xs text-subtle uppercase">Retail</dt>
                <dd className="mt-1 font-mono">{result.rules_snapshot.retail}</dd>
              </div>
              <div>
                <dt className="font-mono text-xs text-subtle uppercase">Min ticket</dt>
                <dd className="mt-1 font-mono">
                  {formatUsd(result.rules_snapshot.min_ticket_usd)}
                </dd>
              </div>
            </dl>
            <div className="flex flex-wrap gap-1">
              {result.gates.map((g) => (
                <span
                  key={g}
                  className="rounded-sm border border-line px-1.5 py-0.5 font-mono text-xs text-muted"
                >
                  {gateLabel(g)}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {result ? <JsonPeek label="GET /v0/eligibility shape" value={result} /> : null}
    </div>
  );
}
