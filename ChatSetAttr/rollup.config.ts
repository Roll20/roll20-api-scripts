import { defineConfig } from "rollup"; // 💡 Import defineConfig and RollupOptions
import typescript from "@rollup/plugin-typescript";
import del from "rollup-plugin-delete";
import injectPlugin from "@rollup/plugin-inject";
import jsonPlugin from "@rollup/plugin-json";
import json from "./script.json" with { type: "json" };
import path from "path/win32";

const authors = Array.isArray(json.authors) ? json.authors.join(", ") : json.authors;

export default defineConfig({
  input: "src/index.ts",

  output: [
    {
      file: `${json.version}/${json.name}.js`,
      format: "iife",
      name: "ChatSetAttr",
      sourcemap: false,
      banner: `// ${json.name} v${json.version} by ${authors}`,
    },
    {
      file: `${json.name}.js`,
      sourcemap: false,
      format: "iife",
      name: "ChatSetAttr",
      banner: `// ${json.name} v${json.version} by ${authors}`,
    },
  ],

  plugins: [
    del({ targets: `${json.version}/*`, runOnce: true }),
    jsonPlugin(),
    injectPlugin({
      "h": [path.resolve("src/utils/chat.ts"), "h"],
    }),
    typescript(),
  ]
});