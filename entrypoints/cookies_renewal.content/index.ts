import { resetAllCookies } from "./renewal";

export default defineContentScript({
  exclude: ["monkey"],
  matches: ["https://poe.game.qq.com/*"],
  async main() {
    if (
      window.location.href.includes("login") &&
      (document.cookie.includes("; p_uin=") ||
        document.body.innerText.includes("发生了一个错误"))
    ) {
      resetAllCookies();
    }

    const values = await browser.storage.local.get({
      cookiesRenewalEnabled: true,
    });
    if (values.cookiesRenewalEnabled) {
      await browser.runtime.sendMessage({
        task: "cookiesRenewal",
      });
    }
  },
});
