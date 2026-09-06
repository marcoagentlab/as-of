import { createFileRoute } from "@tanstack/react-router";
import { envelope, getAsset, HttpError, v0Handler } from "@/lib/rwa";

export const Route = createFileRoute("/v0/assets/$id")({
  server: {
    handlers: {
      GET: async ({ request, params }) =>
        v0Handler(request, () => {
          const asset = getAsset(params.id);
          if (!asset) {
            throw new HttpError(404, "asset_not_found", { id: params.id });
          }
          return envelope({ asset });
        }),
    },
  },
});
