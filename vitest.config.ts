import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      src: path.resolve(__dirname, "./src"),
      test: path.resolve(__dirname, "./test"),
    },
  },
  test: {
    deps: {
      fallbackCJS: true, // required to make kysely migrations work
    },
    coverage: {
      enabled: true,
      all: true,
      provider: "c8",
      reporter: ["text", "json", "html"],
      include: ["src"],
      exclude: ["**/migrations", "src/domain"],
    },
  },
});
