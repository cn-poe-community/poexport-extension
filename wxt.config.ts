import { defineConfig, UserManifest } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-vue", "@wxt-dev/webextension-polyfill"],
  manifest: () => {
    const m: UserManifest = {
      host_permissions: ["https://*.poe.game.qq.com/"],
      permissions: ["storage", "cookies", "clipboardWrite"],
    };
    return m;
  },
});
