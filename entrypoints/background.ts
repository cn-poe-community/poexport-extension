import { deflateCompressToBlob as deflateCompressToBlob } from "@/utils/compress";
import { browser } from "wxt/browser";

export enum ActionType {
  POE1_BUILDING_TRANSFORM = "POE1_BUILDING_TRANSFORM",
  POE2_BUILDING_TRANSFORM = "POE2_BUILDING_TRANSFORM",
}

export interface ExMessage<T> {
  action: ActionType;
  payload: T;
}

export interface ExResult<T> {
  ok: boolean;
  msg?: string;
  payload?: T;
}

export interface Poe1TransformMessage
  extends ExMessage<{ items: string; passiveSkills: string }> {
  action: ActionType.POE1_BUILDING_TRANSFORM;
}

export interface Poe2TransformMessage
  extends ExMessage<{
    equipments: string;
    jewels: string;
    roleInfo: string;
    skills: string;
    talentTree: string;
  }> {
  action: ActionType.POE2_BUILDING_TRANSFORM;
}

export type TransformResult = ExResult<string>;

interface ApiResponse {
  code: number;
  msg: string;
  data?: unknown;
}

interface TransformResponse extends ApiResponse {
  data?: {
    xml: string;
  };
}

const EXPORT_SERVER = "http://120.77.179.194:8888";
const POE1_TRANSFORM_API = `${EXPORT_SERVER}/v1/poe1/building`;
const POE2_TRANSFORM_API = `${EXPORT_SERVER}/v1/poe2/building`;

const HTTP_TIMEOUT = 3000;

export default defineBackground(() => {
  async function poe1Transform(
    message: Poe1TransformMessage,
    sendResponse: (response: TransformResult) => void,
  ) {
    console.log(`fetching ${POE1_TRANSFORM_API}`);
    let resp = null;

    const formData = new FormData();

    formData.append(
      "items",
      await deflateCompressToBlob(message.payload.items),
    );
    formData.append(
      "passiveSkills",
      await deflateCompressToBlob(message.payload.passiveSkills),
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
        ok: false,
        msg: `请求失败，检查网络连接，刷新重试或联系开发者`,
      });
      return;
    } finally {
      clearTimeout(timeoutId);
    }

    if (!resp.ok) {
      try {
        const serverResp = (await resp.json()) as TransformResponse;
        sendResponse({
          ok: false,
          msg: `${serverResp.msg}`,
        });
        return;
      } catch {
        sendResponse({
          ok: false,
          msg: `${resp.status} ${resp.statusText}`,
        });
        return;
      }
    }

    const serverResp = (await resp.json()) as TransformResponse;

    sendResponse({
      ok: true,
      payload: serverResp.data!.xml,
    });
  }

  async function poe2Transform(
    message: Poe2TransformMessage,
    sendResponse: (response: TransformResult) => void,
  ) {
    console.log(`fetching ${POE2_TRANSFORM_API}`);
    let resp = null;

    const formData = new FormData();

    formData.append(
      "equipments",
      await deflateCompressToBlob(message.payload.equipments),
    );
    formData.append(
      "jewels",
      await deflateCompressToBlob(message.payload.jewels),
    );
    formData.append(
      "roleInfo",
      await deflateCompressToBlob(message.payload.roleInfo),
    );
    formData.append(
      "skills",
      await deflateCompressToBlob(message.payload.skills),
    );
    formData.append(
      "talentTree",
      await deflateCompressToBlob(message.payload.talentTree),
    );

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), HTTP_TIMEOUT);

    try {
      resp = await fetch(`${POE2_TRANSFORM_API}`, {
        method: "post",
        body: formData,
        signal: controller.signal,
      });
    } catch (err) {
      console.log(err);
      sendResponse({
        ok: false,
        msg: `请求失败，检查网络连接，刷新重试或联系开发者`,
      });
      return;
    } finally {
      clearTimeout(timeoutId);
    }

    if (!resp.ok) {
      try {
        const serverResp = (await resp.json()) as TransformResponse;
        sendResponse({
          ok: false,
          msg: `${serverResp.msg}`,
        });
        return;
      } catch {
        sendResponse({
          ok: false,
          msg: `${resp.status} ${resp.statusText}`,
        });
        return;
      }
    }

    const serverResp = (await resp.json()) as TransformResponse;

    sendResponse({
      ok: true,
      payload: serverResp.data!.xml,
    });
  }

  browser.runtime.onMessage.addListener(function (
    message: ExMessage<unknown>,
    sender,
    sendResponse,
  ) {
    switch (message.action) {
      case ActionType.POE1_BUILDING_TRANSFORM: {
        const m = message as Poe1TransformMessage;
        poe1Transform(m, sendResponse);
        break;
      }
      case ActionType.POE2_BUILDING_TRANSFORM: {
        const m = message as Poe2TransformMessage;
        poe2Transform(m, sendResponse);
        break;
      }
    }

    return true;
  });
});
