import { Api, Health } from "@exec/core";
import { Effect, Layer } from "effect";
import { HttpRouter, HttpServer } from "effect/http";
import { HttpApiBuilder } from "effect/http-api";

const HealthHandlers = HttpApiBuilder.group(Api, "health", (handlers) =>
  handlers.handle("get", () => Effect.succeed(Health.make({ status: "ok" }))),
);

export const HttpApiLayer = HttpApiBuilder.layer(Api).pipe(
  Layer.provide(HealthHandlers),
);

/** JSON-only Web Request adapter. Its owner must call dispose on shutdown. */
export const createHandler = () =>
  HttpRouter.toWebHandler(
    HttpApiLayer.pipe(Layer.provide(HttpServer.layerServices)),
  );
