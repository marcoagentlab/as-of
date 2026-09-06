import type { SourceRef } from "@/lib/rwa/schema";

export function SourceLine({ source }: { source: SourceRef }) {
  return (
    <p className="font-mono text-xs text-subtle">
      source {source.name}
      {source.url ? (
        <>
          {" · "}
          <a
            href={source.url}
            className="underline decoration-line underline-offset-2 hover:text-muted"
            target="_blank"
            rel="noreferrer"
          >
            {source.url.replace(/^https?:\/\//, "")}
          </a>
        </>
      ) : null}
      {" · "}
      retrieved {source.retrieved_at}
    </p>
  );
}
