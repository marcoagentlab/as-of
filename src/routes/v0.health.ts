import { createFileRoute } from "@tanstack/react-router";
import {
  coverageIds,
  envelope,
  getSofr,
  v0Handler,
} from "@/lib/rwa";

export const Route = createFileRoute("/v0/health")({
  server: {
    handlers: {
      GET: async ({ request }) =>
        v0Handler(
          request,
          () => {
            const sofr = getSofr();
            return envelope({
              ok: true,
              service: "as-of",
              endpoints: [
                "/v0/health",
                "/v0/assets",
                "/v0/assets/:id",
                "/v0/yields",
                "/v0/eligibility",
              ],
              asset_count: coverageIds().length,
              sofr: {
                sofr_apy: sofr.sofr_apy,
                as_of: sofr.as_of,
                quality: sofr.quality,
              },
              auth: "x-api-key",
            });
          },
          { auth: false },
        ),
    },
  },
});
