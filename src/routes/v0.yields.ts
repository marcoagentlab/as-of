import { createFileRoute } from "@tanstack/react-router";
import { compareYields, envelope, getSofr, v0Handler } from "@/lib/rwa";

export const Route = createFileRoute("/v0/yields")({
  server: {
    handlers: {
      GET: async ({ request }) =>
        v0Handler(request, () => {
          const url = new URL(request.url);
          const sort = url.searchParams.get("sort") ?? "spread_vs_sofr_bps";
          const sofr = getSofr();
          return envelope({
            sort,
            sofr: {
              sofr_apy: sofr.sofr_apy,
              as_of: sofr.as_of,
              quality: sofr.quality,
            },
            yields: compareYields({ sort }),
          });
        }),
    },
  },
});
