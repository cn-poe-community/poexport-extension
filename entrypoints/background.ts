import { browser } from "wxt/browser";

export interface Message {
  task: "transform";
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

export default defineBackground(() => {
  const EXPORT_SERVER = "http://120.77.179.194:8888";
  const HTTP_TIMEOUT = 3000;

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

  browser.runtime.onMessage.addListener(function (
    message: Message,
    sender,
    sendResponse,
  ) {
    if (message.task === "transform") {
      const m = message as TransformMessage;
      const compressed = new Uint8Array(m.data as number[]);
      transform(compressed, sendResponse);
    }
    return true;
  });
});
