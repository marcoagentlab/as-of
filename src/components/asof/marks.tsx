import { cn } from "@/lib/utils";
import type { Freshness, Quality } from "@/lib/rwa/schema";

const qualityTone: Record<Quality, string> = {
  verified: "text-sage border-sage/30 bg-sage/10",
  estimated: "text-amber border-amber/30 bg-amber/10",
  unavailable: "text-muted border-line bg-raised",
};

const freshTone: Record<Freshness, string> = {
  fresh: "text-sage border-sage/30 bg-sage/10",
  stale: "text-amber border-amber/30 bg-amber/10",
  unknown: "text-muted border-line bg-raised",
};

export function QualityMark({ value, className }: { value: Quality; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border px-1.5 py-0.5 font-mono text-xs tracking-wide",
        qualityTone[value],
        className,
      )}
    >
      {value}
    </span>
  );
}

export function FreshnessMark({ value, className }: { value: Freshness; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border px-1.5 py-0.5 font-mono text-xs tracking-wide",
        freshTone[value],
        className,
      )}
    >
      {value}
    </span>
  );
}

export function ResultMark({
  value,
}: {
  value: "likely_eligible" | "likely_ineligible" | "unknown";
}) {
  const tone =
    value === "likely_ineligible"
      ? "text-rust border-rust/30 bg-rust/10"
      : value === "likely_eligible"
        ? "text-sage border-sage/30 bg-sage/10"
        : "text-muted border-line bg-raised";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border px-1.5 py-0.5 font-mono text-xs tracking-wide",
        tone,
      )}
    >
      {value}
    </span>
  );
}

export function NullMark({ label = "unavailable" }: { label?: string }) {
  return (
    <span className="inline-flex items-baseline gap-2">
      <span className="font-mono text-muted tabular">—</span>
      <span className="font-mono text-xs text-subtle">{label}</span>
    </span>
  );
}
