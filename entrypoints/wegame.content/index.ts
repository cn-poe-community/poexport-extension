import App from "./App.vue";

export default defineContentScript({
  matches: ["https://www.wegame.com.cn/helper/poe2/*"],
  cssInjectionMode: "ui",
  async main(ctx) {
    if (!window.location.href.includes("/helper/poe2/#/share/")) {
      return;
    }

    const settings = await browser.storage.local.get({
      poe2ExportEnabled: true,
    });
    if (settings.poe2ExportEnabled) {
      const ui = await createShadowRootUi(ctx, {
        name: "exporter-ui",
        position: "inline",
        anchor: "body",
        onMount(container) {
          const wrapper = document.createElement("div");
          wrapper.style =
            "position: fixed;bottom: 20px;left: 10px;z-index: 9999;";
          wrapper.id = "exporterContainer";
          container.appendChild(wrapper);

          createApp(App).mount(wrapper);
        },
      });

      ui.mount();
    }
  },
});
