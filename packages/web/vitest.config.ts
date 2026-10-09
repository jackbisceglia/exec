import { mergeConfig } from "vite";
import { defineConfig } from "vitest/config";

import vite from "./vite.config.ts";

export default mergeConfig(
  vite,
  defineConfig({
    resolve: { conditions: ["development", "browser"] },
    test: { environment: "jsdom", include: ["src/**/*.test.tsx"] },
  }),
);
