import { Platform } from "alchemy/Http/Platform";
import { Effect, Layer } from "effect";
import { HttpRouter } from "effect/http";

import { ApiWorker, ApiWorkerProps } from "../../../infra/api.ts";
import { HttpApiLayer } from "./index.ts";

export default ApiWorker.make(
  ApiWorkerProps,
  Effect.gen(function* () {
    const fetch = yield* HttpRouter.toHttpEffect(
      HttpApiLayer.pipe(Layer.provide(Platform)),
    );

    return { fetch };
  }),
);
