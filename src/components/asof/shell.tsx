import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { DISCLAIMER, DISCLAIMER_KO } from "@/lib/rwa/constants";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Assets" },
  { to: "/yields", label: "Yields" },
  { to: "/eligibility", label: "Eligibility" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-bg text-fg">
      <div className="border-b border-line bg-surface px-4 py-2.5 sm:px-6">
        <p className="text-xs leading-relaxed text-muted sm:text-sm">{DISCLAIMER}</p>
        <p className="mt-1 text-xs text-subtle">{DISCLAIMER_KO}</p>
      </div>

      <header className="border-b border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-6">
          <Link to="/" className="group block min-h-11">
            <p className="font-mono text-xs tracking-[0.18em] text-muted uppercase">
              Schema v0
            </p>
            <h1 className="font-display text-3xl font-medium tracking-tight text-fg italic sm:text-4xl">
              As-Of
            </h1>
            <p className="mt-1 text-sm text-muted">Every number has a source.</p>
          </Link>
          <nav className="flex flex-wrap gap-1" aria-label="Primary">
            {NAV.map((item) => {
              const active =
                item.to === "/"
                  ? pathname === "/" || pathname.startsWith("/assets")
                  : pathname === item.to || pathname.startsWith(`${item.to}/`);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "inline-flex min-h-11 items-center rounded-md px-3.5 text-sm font-medium transition-colors duration-150",
                    active
                      ? "bg-accent text-accent-fg"
                      : "text-muted hover:bg-raised hover:text-fg",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {children}
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-subtle sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>As-Of · informational RWA data · MIT · not an offer of securities.</p>
          <p className="font-mono">{"unknown > wrong"}</p>
        </div>
      </footer>
    </div>
  );
}
