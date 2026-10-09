import { fileURLToPath, URL } from "node:url";
import * as Cloudflare from "alchemy/Cloudflare";

export const Web = Cloudflare.Website.StaticSite("Web", {
  command: "pnpm --filter @exec/web build",
  outdir: "packages/web/dist",
  main: fileURLToPath(
    new URL("../packages/web/src/worker.ts", import.meta.url),
  ),
  assets: { runWorkerFirst: true },
  compatibility: { date: "2026-09-18", flags: ["nodejs_compat"] },
  dev: { command: "pnpm dev:web", url: "http://127.0.0.1:3000" },
});

export type WebEnvironment = Cloudflare.InferEnv<typeof Web>;
