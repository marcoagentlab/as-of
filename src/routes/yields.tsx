import { createFileRoute, Link } from "@tanstack/react-router";
import { compareYields, getSofr } from "@/lib/rwa/catalog";
import { formatApy, formatBps } from "@/lib/rwa/format";
import { YIELD_METHODOLOGY } from "@/lib/rwa/constants";
import { NullMark, QualityMark } from "@/components/asof/marks";

export const Route = createFileRoute("/yields")({
  loader: () => ({
    rows: compareYields({ sort: "spread_vs_sofr_bps" }),
    sofr: getSofr(),
  }),
  component: YieldsPage,
});

function YieldsPage() {
  const { rows, sofr } = Route.useLoaderData();
  return (
    <div className="stagger-in space-y-6">
      <header className="space-y-2">
        <h2 className="font-display text-3xl tracking-tight">Yield vs SOFR</h2>
        <p className="max-w-2xl text-sm text-muted">
          Normalized, not copied from marketing pages. Methodology: {YIELD_METHODOLOGY}.
          Spread is computed only when both net APY and SOFR are non-null. SOFR is currently{" "}
          {sofr.quality} — so every spread is null.
        </p>
      </header>

      <div className="rounded-xl bg-surface px-4 py-4 shadow-border sm:px-5">
        <p className="font-mono text-xs tracking-wide text-subtle uppercase">Benchmark</p>
        <p className="mt-2 font-display text-2xl">SOFR {sofr.sofr_apy == null ? "—" : formatApy(sofr.sofr_apy)}</p>
        <p className="mt-1 text-sm text-muted">
          {sofr.notes ?? "No feed sourced."} Quality {sofr.quality}.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl bg-surface shadow-border">
        <table className="w-full min-w-ledger text-left text-sm">
          <thead className="border-b border-line font-mono text-xs tracking-wide text-subtle uppercase">
            <tr>
              <th className="px-4 py-3 font-medium sm:px-5">Asset</th>
              <th className="px-3 py-3 font-medium">Gross</th>
              <th className="px-3 py-3 font-medium">Net</th>
              <th className="px-3 py-3 font-medium">Fee</th>
              <th className="px-3 py-3 font-medium">vs SOFR</th>
              <th className="px-4 py-3 font-medium sm:px-5">Quality</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3.5 sm:px-5">
                  <Link
                    to="/assets/$id"
                    params={{ id: row.id }}
                    className="block min-h-11 py-2 hover:text-accent"
                  >
                    <span className="font-mono text-xs text-subtle uppercase">
                      {row.symbol ?? row.id}
                    </span>
                    <span className="mt-0.5 block text-fg">{row.name}</span>
                  </Link>
                </td>
                <td className="tabular px-3 py-3.5 font-mono text-muted">
                  {row.gross_apy == null ? "—" : formatApy(row.gross_apy)}
                </td>
                <td className="tabular px-3 py-3.5 font-mono">
                  {row.net_apy == null ? "—" : formatApy(row.net_apy)}
                </td>
                <td className="tabular px-3 py-3.5 font-mono text-muted">
                  {row.fee_drag_bps == null ? "—" : formatBps(row.fee_drag_bps)}
                </td>
                <td className="tabular px-3 py-3.5 font-mono">
                  {row.spread_vs_sofr_bps == null ? (
                    <NullMark />
                  ) : (
                    formatBps(row.spread_vs_sofr_bps)
                  )}
                </td>
                <td className="px-4 py-3.5 sm:px-5">
                  <QualityMark value={row.quality} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
