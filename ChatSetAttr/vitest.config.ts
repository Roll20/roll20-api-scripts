/// <reference types="vitest" />
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    typecheck: {
      tsconfig: "./tsconfig.vitest.json"
    },
    setupFiles: ["./vitest.setup.ts"],
  },
});