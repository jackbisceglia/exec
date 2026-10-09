import { createServer } from "node:http";
import { NodeHttpServer, NodeRuntime } from "@effect/platform-node";
import { Layer } from "effect";
import { HttpRouter } from "effect/http";

import { HttpApiLayer } from "./index.ts";

const Server = HttpRouter.serve(HttpApiLayer).pipe(
  Layer.provide(
    NodeHttpServer.layer(createServer, { port: 3001, host: "127.0.0.1" }),
  ),
);

NodeRuntime.runMain(Layer.launch(Server));
