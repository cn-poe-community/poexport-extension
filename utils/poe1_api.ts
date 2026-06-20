import {
  GetCharactersResult,
  GetItemsResult,
  GetPassiveSkillsResult,
} from "cn-poe-utils/api";

export const POE_SITE_TENCENT = "https://poe.game.qq.com";

const URL_PROFILE = "/api/profile";
const URL_GET_CHARACTERS = "/character-window/get-characters";
const URL_GET_ITEMS = "/character-window/get-items";
const URL_GET_PASSIVE_SKILLS = "/character-window/get-passive-skills";

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) {
    throw requestError(response);
  }
  return await response.json();
}

function requestError(response: Response): Error {
  const status = response.status;
  if (status === 401) {
    return new Error("未登陆");
  } else if (status === 403) {
    return new Error("目标账户不存在或已隐藏");
  } else if (status === 429) {
    const limit = rateLimit(response.headers);
    if (limit.length > 0) {
      return new Error(`请求过于频繁，请等待 ${limit} 后再试`);
    }
    return new Error("请求过于频繁，请稍后再试");
  }

  return new Error(`HTTP ${response.status}: ${response.statusText}`);
}

function rateLimit(headers: Headers): string {
  let max = 0;
  headers.forEach((value, key) => {
    if (/^x-rate-limit-.+-state$/i.test(key)) {
      const states = value.split(",");
      const limits = states.map((s) => {
        const pieces = s.split(":");
        return Number(pieces[pieces.length - 1]);
      });
      for (const limit of limits) {
        if (limit > max) {
          max = limit;
        }
      }
    }
  });

  if (max > 3600) {
    const h = Math.floor(max / 3600);
    const m = Math.floor((max % 3600) / 60);
    const s = max % 60;
    return `${h}小时${m}分钟${s}秒`;
  }
  if (max > 60) {
    const m = Math.floor((max % 3600) / 60);
    const s = max % 60;
    return `${m}分钟${s}秒`;
  }
  if (max > 0) {
    return `${max}秒`;
  }
  return "";
}

export async function profile(site: string): Promise<unknown> {
  return await fetchJSON<unknown>(site + URL_PROFILE);
}

export async function getCharacters(
  site: string,
  accountName: string,
  realm: string,
): Promise<GetCharactersResult> {
  const form = new URLSearchParams();
  form.append("accountName", accountName);
  form.append("realm", realm);

  return await fetchJSON<GetCharactersResult>(site + URL_GET_CHARACTERS, {
    method: "POST",
    body: form,
  });
}

export async function getItems(
  site: string,
  accountName: string,
  character: string,
  realm: string,
): Promise<GetItemsResult> {
  const form = new URLSearchParams();
  form.append("accountName", accountName);
  form.append("character", character);
  form.append("realm", realm);

  return await fetchJSON<GetItemsResult>(site + URL_GET_ITEMS, {
    method: "POST",
    body: form,
  });
}

export async function getPassiveSkills(
  site: string,
  accountName: string,
  character: string,
  realm: string,
): Promise<GetPassiveSkillsResult> {
  const form = new URLSearchParams();
  form.append("accountName", accountName);
  form.append("character", character);
  form.append("realm", realm);

  return await fetchJSON<GetPassiveSkillsResult>(
    site + URL_GET_PASSIVE_SKILLS,
    {
      method: "POST",
      body: form,
    },
  );
}
