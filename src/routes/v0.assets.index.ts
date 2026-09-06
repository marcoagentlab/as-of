import { createFileRoute } from "@tanstack/react-router";
import { envelope, HttpError, listAssets, toSummary, v0Handler } from "@/lib/rwa";
import { AssetClass } from "@/lib/rwa/schema";

export const Route = createFileRoute("/v0/assets/")({
  server: {
    handlers: {
      GET: async ({ request }) =>
        v0Handler(request, () => {
          const url = new URL(request.url);
          const rawClass = url.searchParams.get("asset_class");
          let assetClass: string | null = rawClass;
          if (rawClass) {
            const parsed = AssetClass.safeParse(rawClass);
            if (!parsed.success) {
              throw new HttpError(400, "unknown_asset_class", {
                asset_class: rawClass,
              });
            }
            assetClass = parsed.data;
          }
          const assets = listAssets({ asset_class: assetClass }).map(toSummary);
          return envelope({
            as_of: new Date().toISOString(),
            count: assets.length,
            assets,
          });
        }),
    },
  },
});
