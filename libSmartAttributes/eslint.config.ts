import { defineConfig } from "eslint/config"; // While not strictly necessary, it's good practice.
import stylistic from "@stylistic/eslint-plugin";
import jslint from "@eslint/js";
import tslint from "typescript-eslint";

export default defineConfig(
  {
    ignores: ["**/[0-9]*.[0-9]*.[0-9]*/", "*.d.ts", "dist/**", "build/**", "node_modules/**"],
  },
  jslint.configs.recommended,
  ...tslint.configs.recommended,
  {
    plugins: {
      "@stylistic": stylistic,
    },
    rules: {
      "@stylistic/quotes": ["error", "double"],
      "@stylistic/semi": ["error", "always"],
      "@stylistic/indent": ["error", 2],
    },
  },
);