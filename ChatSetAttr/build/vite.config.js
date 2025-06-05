import { defineConfig } from "vite";
import details from "../script.json";

export default defineConfig({
  build: {
    target: "node16",
    outDir: `../${details.version}`,
    emptyOutDir: true,
    minify: false,
    lib: {
      entry: "./src/main.ts",
      name: details.name,
      formats: ["iife"],
      fileName: () => `${details.name}.js`,
    },
  },
  plugins: [],
});