import { useState } from "react";

export function JsonPeek({ value, label = "Envelope JSON" }: { value: unknown; label?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg bg-raised">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-11 w-full items-center justify-between px-4 text-left font-mono text-xs text-muted"
      >
        <span>{label}</span>
        <span>{open ? "Hide" : "Show"}</span>
      </button>
      {open ? (
        <pre className="max-h-96 overflow-auto border-t border-line px-4 py-3 font-mono text-xs leading-relaxed text-accent">
          {JSON.stringify(value, null, 2)}
        </pre>
      ) : null}
    </div>
  );
}
