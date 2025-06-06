import { browser } from "wxt/browser";

export interface Message {
  task: "transform" | "cookiesRenewal";
  data?: unknown;
}

export interface Response {
  code: number;
  msg?: string;
  data?: unknown;
}

export interface TransformMessage extends Message {
  task: "transform";
  /**
   * compressed bytes
   */
  data: number[];
}

export interface TransformResponse extends Response {
  /**
   * building xml
   */
  data?: string;
}

export interface CookiesRenewalMessage extends Message {
  task: "cookiesRenewal";
}

export default defineBackground(() => {
  const EXPORT_SERVER = "http://120.77.179.194:8888";
  const HTTP_TIMEOUT = 3000;
  const FORUM_URL = "https://poe.game.qq.com";

  async function transform(
    compressed: Uint8Array,
    sendResponse: (response: Response) => void,
  ) {
    console.log(`fetching ${EXPORT_SERVER}/transform`);
    let res = null;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), HTTP_TIMEOUT);

    try {
      res = await fetch(`${EXPORT_SERVER}/transform`, {
        method: "post",
        headers: {
          "Content-type": "octet-stream",
        },
        body: compressed,
        signal: controller.signal,
      });
    } catch (err) {
      console.log(err);
      sendResponse({
        code: 1,
        msg: `无法访问Export服务器，刷新重试或联系开发者`,
      });
      return;
    } finally {
      clearTimeout(timeoutId);
    }

    if (res.status !== 200) {
      sendResponse({
        code: 1,
        msg: `导出错误: ${res.status}`,
      });
      return;
    }
    const apiResp = await res.json();
    const code = apiResp.code;
    if (code !== 200) {
      sendResponse({
        code: 1,
        msg: `导出错误: ${apiResp.msg}`,
      });
      return;
    }

    sendResponse({
      code: 0,
      data: apiResp.data.xml,
    });
  }

  async function renewCookies(sendResponse: (response: Response) => void) {
    const poeSessId = await browser.cookies.get({
      url: FORUM_URL,
      name: "POESESSID",
    });
    if (!poeSessId) {
      sendResponse({
        code: 0,
      });
      return;
    }

    const puin = await browser.cookies.get({ url: FORUM_URL, name: "p_uin" });
    if (!puin || !puin.session) {
      sendResponse({
        code: 0,
      });
      return;
    }

    const puinDetails = {
      domain: puin.domain,
      name: puin.name,
      url: FORUM_URL,
      storeId: puin.storeId,
      value: puin.value,
      expirationDate: poeSessId.expirationDate, //only change this
      path: puin.path,
      httpOnly: puin.hostOnly,
      secure: puin.secure,
      sameSite: puin.sameSite,
    };
    await browser.cookies.set(puinDetails);

    sendResponse({
      code: 0,
    });
  }

  browser.runtime.onMessage.addListener(function (
    message: Message,
    sender,
    sendResponse,
  ) {
    if (message.task === "transform") {
      const m = message as TransformMessage;
      const compressed = new Uint8Array(m.data as number[]);
      transform(compressed, sendResponse);
    } else if (message.task === "cookiesRenewal") {
      renewCookies(sendResponse);
    }
    return true;
  });
});
