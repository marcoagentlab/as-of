import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { getSofr, listAssets, toSummary } from "@/lib/rwa/catalog";
import { classLabel, formatApy, formatBps } from "@/lib/rwa/format";
import type { AssetClass } from "@/lib/rwa/schema";
import { FreshnessMark, NullMark, QualityMark } from "@/components/asof/marks";
import { cn } from "@/lib/utils";

const FILTERS: { id: "all" | AssetClass; label: string }[] = [
  { id: "all", label: "All" },
  { id: "treasury_fund", label: "Treasury" },
  { id: "cash_mgmt", label: "Cash" },
  { id: "private_credit", label: "Private credit" },
  { id: "commodity", label: "Commodity" },
];

export const Route = createFileRoute("/")({
  loader: () => {
    const assets = listAssets();
    return {
      assets: assets.map(toSummary),
      sofr: getSofr(),
      missing: assets.reduce((n, a) => n + a.quality.missing_fields.length, 0),
    };
  },
  component: Home,
});

function Home() {
  const { assets, sofr, missing } = Route.useLoaderData();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const visible = useMemo(
    () => (filter === "all" ? assets : assets.filter((a) => a.asset_class === filter)),
    [assets, filter],
  );
  const verified = assets.filter((a) => a.quality === "verified").length;

  return (
    <div className="stagger-in space-y-8">
      <section className="grid gap-3 sm:grid-cols-4">
        <Stat kicker="Coverage" value={String(assets.length)} hint="seed ids" />
        <Stat kicker="Verified marks" value={String(verified)} hint="none, by design" />
        <Stat
          kicker="SOFR"
          value="—"
          hint={sofr.quality}
        />
        <Stat kicker="Missing fields" value={String(missing)} hint="listed, not invented" />
      </section>

      <section>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-2xl tracking-tight">Coverage set</h2>
            <p className="mt-1 max-w-xl text-sm text-muted">
              NAV and APY are null until a sourced feed exists. Empty chain lists beat invented
              token addresses.
            </p>
          </div>
          <div className="flex flex-wrap gap-1">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={cn(
                  "min-h-11 rounded-md px-3 text-sm font-medium transition-colors duration-150",
                  filter === f.id
                    ? "bg-accent text-accent-fg"
                    : "bg-surface text-muted hover:text-fg",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <ul className="space-y-2">
          {visible.map((asset) => (
            <li key={asset.id}>
              <Link
                to="/assets/$id"
                params={{ id: asset.id }}
                className="ledger-row group flex flex-col gap-3 rounded-xl bg-surface px-4 py-4 sm:flex-row sm:items-center sm:px-5"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs tracking-wide text-subtle uppercase">
                      {asset.symbol ?? asset.id}
                    </span>
                    <QualityMark value={asset.quality} />
                    <FreshnessMark value={asset.freshness} />
                  </div>
                  <p className="mt-1 truncate font-display text-xl tracking-tight text-fg">
                    {asset.name}
                  </p>
                  <p className="mt-0.5 text-sm text-muted">
                    {asset.issuer} · {classLabel(asset.asset_class)}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-6 sm:justify-end">
                  <div>
                    <p className="font-mono text-xs text-subtle uppercase">Net APY</p>
                    <p className="tabular font-mono text-sm text-fg">
                      {asset.net_apy == null ? <NullMark /> : formatApy(asset.net_apy)}
                    </p>
                  </div>
                  <div>
                    <p className="font-mono text-xs text-subtle uppercase">vs SOFR</p>
                    <p className="tabular font-mono text-sm text-fg">
                      {asset.spread_vs_sofr_bps == null ? (
                        <NullMark />
                      ) : (
                        formatBps(asset.spread_vs_sofr_bps)
                      )}
                    </p>
                  </div>
                  <ArrowUpRight className="size-4 text-subtle transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-fg" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Stat({ kicker, value, hint }: { kicker: string; value: string; hint: string }) {
  return (
    <div className="rounded-xl bg-surface px-4 py-4 shadow-border">
      <p className="font-mono text-xs tracking-wide text-subtle uppercase">{kicker}</p>
      <p className="mt-2 font-display text-3xl tracking-tight tabular">{value}</p>
      <p className="mt-1 text-xs text-muted">{hint}</p>
    </div>
  );
}
