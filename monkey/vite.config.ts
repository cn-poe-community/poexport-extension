import { resolve } from "path";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    rollupOptions: {
      external: [
        "vue",
        "cn-poe-translator",
        "cn-poe-export-db",
        "pob-building-creator",
        "axios",
      ],
      input: {
        monkey: resolve(__dirname, "index.html"),
      },
      output: {
        format: "iife",
        globals: {
          vue: "Vue",
          "cn-poe-export-db": "CnPoeExportDb",
          "cn-poe-translator": "CnPoeTranslator",
          "pob-building-creator": "BuildingCreator",
          axios: "axios",
        },
      },
    },
    outDir: ".output/monkey",
    copyPublicDir: false,
    minify: false,
  },
});
