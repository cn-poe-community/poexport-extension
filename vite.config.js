import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      //https://github.com/vitejs/vite/issues/378, build without hash
      output: {
        entryFileNames: `[name].js`,
        chunkFileNames: `[name].js`,
        assetFileNames: `[name].[ext]`,
        // file name starts with "_" is reserved for chrome extension
        sanitizeFileName: (fileName) => {
          return fileName.replaceAll(/[\x00]/g, "").replaceAll(/[:\/]/g, "-");
        },
      },
      input: {
        index: resolve(__dirname, "index.html"),
        export: resolve(__dirname, "export.html"),
        background: resolve(__dirname, "public/export_wroker.js"),
      },
    },
  },
});
