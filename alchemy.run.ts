import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import { Effect } from "effect";

import { ApiWorker } from "./infra/api.ts";
import { Web } from "./infra/web.ts";
import ApiWorkerLayer from "./packages/api/src/worker.ts";

export default Alchemy.Stack(
  "exec",
  { providers: Cloudflare.providers(), state: Cloudflare.state() },
  Effect.gen(function* () {
    const api = yield* ApiWorker;
    const web = yield* Web;

    return { apiUrl: api.url, webUrl: web.url };
  }).pipe(Effect.provide(ApiWorkerLayer)),
);
