import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      // `server-only` throws when imported outside an RSC graph; the feature
      // query modules import it, so tests need an inert stand-in.
      "server-only": fileURLToPath(
        new URL("./src/test/stubs/server-only.ts", import.meta.url)
      ),
    },
  },
  test: {
    environment: "node",
  },
});
