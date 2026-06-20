import { deflateCompress as deflateCompress } from "@/utils/compress";

const TRANSFORMER_HOST = "http://120.77.179.194:8888";
const URL_POE1_TRANSFORM = "/v1/poe1/building";
const URL_POE2_TRANSFORM = "/v1/poe2/building";
const URL_POE1_TRANSLATE = "/v1/poe1/translate";
const URL_POE2_TRANSLATE = "/v1/poe2/translate";

const HTTP_TIMEOUT = 5000;

interface APIResponse {
  code: number;
  message: string;
  data?: unknown;
}

interface TransformResponse extends APIResponse {
  data?: {
    xml: string;
  };
}

interface TranslateResponse extends APIResponse {
  data?: {
    item: string;
  };
}

export async function createPOE1Build(data: {
  items: string;
  passiveSkills: string;
}): Promise<string> {
  const formData = new FormData();

  formData.append("items", await deflateCompress(data.items));
  formData.append("passiveSkills", await deflateCompress(data.passiveSkills));

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), HTTP_TIMEOUT);

  let response = undefined;
  try {
    response = await fetch(TRANSFORMER_HOST + URL_POE1_TRANSFORM, {
      method: "post",
      body: formData,
      signal: controller.signal,
    });
  } catch (err) {
    throw new Error("请求失败，检查网络连接，刷新重试或联系开发者");
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const apiResponse = (await response.json()) as TransformResponse;
    throw new Error(apiResponse.message);
  }

  const apiResponse = (await response.json()) as TransformResponse;
  return apiResponse.data!.xml;
}

export async function createPOE2Build(data: {
  equipments: string;
  jewels: string;
  roleInfo: string;
  skills: string;
  talentTree: string;
  customData?: string;
}): Promise<string> {
  const formData = new FormData();

  formData.append("equipments", await deflateCompress(data.equipments));
  formData.append("jewels", await deflateCompress(data.jewels));
  formData.append("roleInfo", await deflateCompress(data.roleInfo));
  formData.append("skills", await deflateCompress(data.skills));
  formData.append("talentTree", await deflateCompress(data.talentTree));
  if (data.customData) {
    formData.append("customData", await deflateCompress(data.customData));
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), HTTP_TIMEOUT);

  let response = undefined;
  try {
    response = await fetch(TRANSFORMER_HOST + URL_POE2_TRANSFORM, {
      method: "post",
      body: formData,
      signal: controller.signal,
    });
  } catch (err) {
    throw new Error("请求失败，检查网络连接，刷新重试或联系开发者");
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const apiResponse = (await response.json()) as TransformResponse;
    throw new Error(apiResponse.message);
  }

  const apiResponse = (await response.json()) as TransformResponse;
  return apiResponse.data!.xml;
}

export async function translatePOE1Item(data: {
  item: string;
}): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), HTTP_TIMEOUT);
  let response = undefined;
  try {
    response = await fetch(TRANSFORMER_HOST + URL_POE1_TRANSLATE, {
      method: "post",
      headers: {
        "Content-Type": "application/json", // 必须声明内容类型
      },
      body: JSON.stringify(data),
      signal: controller.signal,
    });
  } catch (err) {
    throw new Error("请求失败，检查网络连接，刷新重试或联系开发者");
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const apiResponse = (await response.json()) as TranslateResponse;
    throw new Error(apiResponse.message);
  }

  const apiResponse = (await response.json()) as TranslateResponse;
  return apiResponse.data!.item;
}

export async function translatePOE2Item(data: {
  item: string;
}): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), HTTP_TIMEOUT);
  let response = undefined;
  try {
    response = await fetch(TRANSFORMER_HOST + URL_POE2_TRANSLATE, {
      method: "post",
      headers: {
        "Content-Type": "application/json", // 必须声明内容类型
      },
      body: JSON.stringify(data),
      signal: controller.signal,
    });
  } catch (err) {
    throw new Error("请求失败，检查网络连接，刷新重试或联系开发者");
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const apiResponse = (await response.json()) as TranslateResponse;
    throw new Error(apiResponse.message);
  }

  const apiResponse = (await response.json()) as TranslateResponse;
  return apiResponse.data!.item;
}
