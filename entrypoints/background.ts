import { deflateCompressToBlob as deflateCompressToBlob } from "@/utils/compress";
import { browser } from "wxt/browser";

export enum ExMessageType {
  POE1_BUILDING_TRANSFORM = "ext:poe1:building:transform",
}

export interface ExMessage {
  type: ExMessageType;
}

export enum ExResponseCode {
  SUCCESS = 0,
  ERROR = 1,
}

export interface ExResponse {
  code: ExResponseCode;
  msg?: string;
}

export interface Poe1TransformMessage extends ExMessage {
  type: ExMessageType.POE1_BUILDING_TRANSFORM;
  items: string;
  passiveSkills: string;
}

export interface Poe1TransformResponse extends ExResponse {
  building?: string;
}

interface ServerResponse {
  code: number;
  msg: string;
  data?: unknown;
}

interface Poe1TransformServerResponse extends ServerResponse {
  data?: {
    xml: string;
  };
}

const EXPORT_SERVER = "http://120.77.179.194:8888";
const POE1_TRANSFORM_API = `${EXPORT_SERVER}/v1/poe1/building/transform`;

const HTTP_TIMEOUT = 3000;

export default defineBackground(() => {
  async function poe1Transform(
    items: string,
    passiveSkills: string,
    sendResponse: (response: Poe1TransformResponse) => void,
  ) {
    console.log(`fetching ${POE1_TRANSFORM_API}`);
    let resp = null;

    const formData = new FormData();

    formData.append("items", await deflateCompressToBlob(items));
    formData.append(
      "passiveSkills",
      await deflateCompressToBlob(passiveSkills),
    );

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), HTTP_TIMEOUT);

    try {
      resp = await fetch(`${POE1_TRANSFORM_API}`, {
        method: "post",
        body: formData,
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

    if (resp.status !== 200) {
      sendResponse({
        code: ExResponseCode.ERROR,
        msg: `导出错误: ${resp.status}`,
      });
      return;
    }
    const serverResp = (await resp.json()) as Poe1TransformServerResponse;
    const code = serverResp.code;
    if (code !== 200) {
      sendResponse({
        code: ExResponseCode.ERROR,
        msg: `导出错误: ${serverResp.msg}`,
      });
      return;
    }

    sendResponse({
      code: ExResponseCode.SUCCESS,
      building: serverResp.data!.xml,
    });
  }

  browser.runtime.onMessage.addListener(function (
    message: ExMessage,
    sender,
    sendResponse,
  ) {
    if (message.type === ExMessageType.POE1_BUILDING_TRANSFORM) {
      const m = message as Poe1TransformMessage;
      poe1Transform(m.items, m.passiveSkills, sendResponse);
    }
    return true;
  });
});
