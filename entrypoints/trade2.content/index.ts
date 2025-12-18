export default defineContentScript({
  matches: ["https://poe.game.qq.com/trade2/*"],
  async main() {
    const values = await browser.storage.local.get({
      trade2ContentEnabled: true,
    });
    if (!values.trade2ContentEnabled) {
      return;
    }

    await injectScript("/trade2-main-world.js", {
      keepInDom: true,
    });
  },
});
