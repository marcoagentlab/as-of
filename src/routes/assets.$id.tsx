import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { getAsset } from "@/lib/rwa/catalog";
import { DISCLAIMER } from "@/lib/rwa/constants";
import { classLabel, dash, formatApy, formatBps, formatUsd, gateLabel, wrapperLabel } from "@/lib/rwa/format";
import { Field, Panel } from "@/components/asof/field";
import { JsonPeek } from "@/components/asof/json-peek";
import { FreshnessMark, NullMark, QualityMark } from "@/components/asof/marks";
import { SourceLine } from "@/components/asof/source-line";

export const Route = createFileRoute("/assets/$id")({
  loader: ({ params }) => ({
    asset: getAsset(params.id),
  }),
  component: AssetPage,
});

function AssetPage() {
  const { asset } = Route.useLoaderData();
  if (!asset) {
    return (
      <div className="space-y-3">
        <p className="font-display text-2xl">Asset not in the coverage set.</p>
        <Link to="/" className="text-sm text-muted underline underline-offset-4">
          Back to assets
        </Link>
      </div>
    );
  }

  return (
    <div className="stagger-in space-y-6">
      <Link
        to="/"
        className="inline-flex min-h-11 items-center gap-2 text-sm text-muted hover:text-fg"
      >
        <ArrowLeft className="size-4" />
        Assets
      </Link>

      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs tracking-wide text-subtle uppercase">
            {asset.symbol ?? asset.id}
          </span>
          <QualityMark value={asset.quality.overall} />
          <FreshnessMark value={asset.nav.freshness} />
        </div>
        <h2 className="font-display text-3xl tracking-tight sm:text-4xl">{asset.name}</h2>
        <p className="text-sm text-muted">
          {asset.issuer}
          {asset.manager && asset.manager !== asset.issuer ? ` · mgr ${asset.manager}` : ""}
          {" · "}
          {classLabel(asset.asset_class)}
          {" · "}
          {wrapperLabel(asset.wrapper_type)}
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="NAV" kicker={asset.nav.model}>
          <Field label="Value" mono>
            {asset.nav.value == null ? (
              <NullMark />
            ) : (
              `${asset.nav.value} ${asset.nav.currency}`
            )}
          </Field>
          <Field label="As of" mono>
            {dash(asset.nav.as_of)}
          </Field>
          <Field label="Freshness">
            <FreshnessMark value={asset.nav.freshness} />
          </Field>
          <Field label="Oracle" mono>
            {dash(asset.nav.oracle)}
          </Field>
          <div className="pt-3">
            <SourceLine source={asset.nav.source} />
          </div>
        </Panel>

        <Panel title="Yield" kicker={asset.yield.methodology}>
          <Field label="Gross APY" mono>
            {asset.yield.gross_apy == null ? <NullMark /> : formatApy(asset.yield.gross_apy)}
          </Field>
          <Field label="Net APY" mono>
            {asset.yield.net_apy == null ? <NullMark /> : formatApy(asset.yield.net_apy)}
          </Field>
          <Field label="Fee drag" mono>
            {asset.yield.fee_drag_bps == null ? <NullMark /> : formatBps(asset.yield.fee_drag_bps)}
          </Field>
          <Field label="SOFR" mono>
            {asset.yield.sofr_apy == null ? <NullMark /> : formatApy(asset.yield.sofr_apy)}
          </Field>
          <Field label="Spread vs SOFR" mono>
            {asset.yield.spread_vs_sofr_bps == null ? (
              <NullMark />
            ) : (
              formatBps(asset.yield.spread_vs_sofr_bps)
            )}
          </Field>
          <div className="pt-3">
            <SourceLine source={asset.yield.source} />
          </div>
        </Panel>

        <Panel title="Eligibility" kicker="rules only">
          <Field label="Gates">
            <span className="flex flex-wrap gap-1">
              {asset.eligibility.gates.map((g) => (
                <span
                  key={g}
                  className="rounded-sm border border-line bg-raised px-1.5 py-0.5 font-mono text-xs"
                >
                  {gateLabel(g)}
                </span>
              ))}
            </span>
          </Field>
          <Field label="US persons" mono>
            {asset.eligibility.us_persons}
          </Field>
          <Field label="Retail" mono>
            {asset.eligibility.retail}
          </Field>
          <Field label="Min ticket" mono>
            {formatUsd(asset.eligibility.min_ticket_usd)}
          </Field>
          <Field label="Notes">
            {asset.eligibility.notes ?? "—"}
          </Field>
          <div className="pt-3">
            <SourceLine source={asset.eligibility.source} />
          </div>
        </Panel>

        <Panel title="Inventory" kicker={asset.liquidity?.redeemability}>
          <Field label="Chains">
            {asset.chains.length === 0 ? (
              <span className="text-muted">
                None sourced. Empty list rather than invented addresses.
              </span>
            ) : (
              <ul className="space-y-1 font-mono text-xs">
                {asset.chains.map((c) => (
                  <li key={`${c.chain_name}-${c.token_address}`}>
                    {c.chain_name} · {c.token_address}
                  </li>
                ))}
              </ul>
            )}
          </Field>
          <Field label="ISIN / LEI / CUSIP" mono>
            {dash(asset.identifiers.isin)} / {dash(asset.identifiers.lei)} /{" "}
            {dash(asset.identifiers.cusip)}
          </Field>
          <Field label="Custodian">{dash(asset.custodian)}</Field>
          <Field label="Transfer agent">{dash(asset.transfer_agent)}</Field>
          <Field label="Website">
            {asset.links.website ? (
              <a
                href={asset.links.website}
                className="underline decoration-line underline-offset-2"
                target="_blank"
                rel="noreferrer"
              >
                {asset.links.website.replace(/^https?:\/\//, "")}
              </a>
            ) : (
              "—"
            )}
          </Field>
          {asset.liquidity?.notes ? (
            <Field label="Liquidity notes">{asset.liquidity.notes}</Field>
          ) : null}
        </Panel>
      </div>

      <Panel title="Quality">
        <Field label="Overall">
          <QualityMark value={asset.quality.overall} />
        </Field>
        <Field label="Missing">
          <span className="font-mono text-xs text-muted">
            {asset.quality.missing_fields.join(", ")}
          </span>
        </Field>
        <Field label="Warnings">
          <span className="font-mono text-xs text-muted">
            {asset.quality.warnings.join(", ")}
          </span>
        </Field>
        <Field label="Updated" mono>
          {asset.updated_at}
        </Field>
      </Panel>

      <JsonPeek
        label="GET /v0/assets/{id} shape"
        value={{ disclaimer: DISCLAIMER, asset }}
      />
    </div>
  );
}
