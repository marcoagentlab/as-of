import type { ReactNode } from "react";
import type { Quality } from "@/lib/rwa/schema";
import { QualityMark } from "./marks";

export function Field({
  label,
  children,
  quality,
  mono,
}: {
  label: string;
  children: ReactNode;
  quality?: Quality;
  mono?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-1 border-b border-line py-3 last:border-b-0 sm:grid-cols-[11rem_1fr_auto] sm:items-baseline sm:gap-4">
      <dt className="font-mono text-xs tracking-wide text-subtle uppercase">{label}</dt>
      <dd className={mono ? "font-mono text-sm text-fg break-all" : "text-sm text-fg"}>
        {children}
      </dd>
      <div className="sm:justify-self-end">
        {quality ? <QualityMark value={quality} /> : null}
      </div>
    </div>
  );
}

export function Panel({
  title,
  kicker,
  children,
}: {
  title: string;
  kicker?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl bg-surface p-4 shadow-border sm:p-5">
      <header className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="font-display text-xl tracking-tight text-fg">{title}</h2>
        {kicker ? (
          <span className="font-mono text-xs text-subtle">{kicker}</span>
        ) : null}
      </header>
      <dl>{children}</dl>
    </section>
  );
}
