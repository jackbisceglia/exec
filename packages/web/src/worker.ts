import type { WebEnvironment } from "../../../infra/web.ts";

type AssetRequest = Parameters<WebEnvironment["ASSETS"]["fetch"]>[0];

export default {
  fetch: (request: AssetRequest, env: WebEnvironment) =>
    env.ASSETS.fetch(request),
};
