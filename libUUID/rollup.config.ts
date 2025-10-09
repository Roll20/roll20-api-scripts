import { defineConfig } from "rollup";
import typescript from "@rollup/plugin-typescript";
import del from "rollup-plugin-delete";
import json from "./script.json" with { type: "json" };

// Use defineConfig for strong type checking and correct structure
export default defineConfig({
  input: "src/index.ts",

  output: {
    file: `${json.version}/${json.name}.js`,
    name: json.name,
    sourcemap: false,
    banner: `// ${json.name} v${json.version} by ${json.authors} | ${json.description}`,
  },

  plugins: [
    del({ targets: `${json.version}/*`, runOnce: true }),
    typescript({
      declaration: true,
      declarationDir: `${json.version}`,
    }),
  ]
});