import * as Cloudflare from "alchemy/Cloudflare";
import type { Effect, Scope } from "effect";
import type {
  HttpServerError,
  HttpServerRequest,
  HttpServerResponse,
} from "effect/http";

type ApiHandlers = {
  readonly fetch: Effect.Effect<
    HttpServerResponse.HttpServerResponse,
    HttpServerError.HttpServerError,
    HttpServerRequest.HttpServerRequest | Scope.Scope
  >;
};

export class ApiWorker extends Cloudflare.Worker<ApiWorker, ApiHandlers>()(
  "ApiWorker",
) {}

export const ApiWorkerProps = {
  main: new URL("../packages/api/src/worker.ts", import.meta.url).href,
  compatibility: { date: "2026-09-18", flags: ["nodejs_compat"] },
  dev: { port: 3001, strictPort: true },
} satisfies Cloudflare.Workers.WorkerProps;
