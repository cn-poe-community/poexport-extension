import { fileURLToPath, URL } from 'node:url'
import { resolve } from "path"

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    cssInjectedByJsPlugin(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    rollupOptions: {
      external: [
        'vue',
        'cn-poe-translator',
        'cn-poe-export-db',
        'pob-building-creater',
        'axios',
      ],
      input: {
        monkey: resolve(__dirname, "pages/monkey.html"),
      },
    },
    outDir: "dist-monkey",
    copyPublicDir: false,
    minify: false,
  }
})
