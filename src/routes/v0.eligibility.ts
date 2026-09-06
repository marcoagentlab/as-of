import { createFileRoute } from "@tanstack/react-router";
import {
  checkEligibility,
  envelope,
  getAsset,
  HttpError,
  v0Handler,
} from "@/lib/rwa";

export const Route = createFileRoute("/v0/eligibility")({
  server: {
    handlers: {
      GET: async ({ request }) =>
        v0Handler(request, () => {
          const url = new URL(request.url);
          const assetId = url.searchParams.get("asset_id");
          if (!assetId) {
            throw new HttpError(400, "missing_asset_id", {
              hint: "GET /v0/eligibility?asset_id=buidl&jurisdiction=KR",
            });
          }
          const asset = getAsset(assetId);
          if (!asset) {
            throw new HttpError(404, "asset_not_found", { id: assetId });
          }
          const jurisdiction = url.searchParams.get("jurisdiction");
          const wallet = url.searchParams.get("wallet");
          const check = checkEligibility(asset, jurisdiction, wallet);
          return envelope({ ...check });
        }),
    },
  },
});
