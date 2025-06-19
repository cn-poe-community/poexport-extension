import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";

export default defineContentScript({
  matches: [
    "https://poe.game.qq.com/my-account",
    "https://poe.game.qq.com/account/view-profile/*",
    "https://poe.game.qq.com/forum",
  ],
  cssInjectionMode: "ui",
  async main(ctx) {
    const values = await browser.storage.local.get({ panelEnabled: true });
    if (values.panelEnabled) {
      const ui = await createShadowRootUi(ctx, {
        name: "exporter-ui",
        position: "inline",
        anchor: "body",
        onMount(container) {
          const wrapper = document.createElement("div");
          wrapper.id = "exporterContainer";
          container.appendChild(wrapper);

          createApp(App).mount(wrapper);
        },
      });

      ui.mount();
    }
  },
});
