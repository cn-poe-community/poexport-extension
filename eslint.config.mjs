// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import { globalIgnores } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier/flat";

export default tseslint.config([
  globalIgnores([
    ".output/**/*",
    ".wxt/**/*",
    "**/__tests__/**",
    "monkey/build.js",
  ]),
  eslint.configs.recommended,
  eslint.configs.recommended,
  eslintConfigPrettier,
]);
