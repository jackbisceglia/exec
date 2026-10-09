import solid from "@solidjs/vite-plugin";
import { defineConfig } from "vite";
import solidYield from "vite-plugin-solid-yield";

export default defineConfig({
  plugins: [solidYield(), solid()],
});
