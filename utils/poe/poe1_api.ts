import {
  GetCharactersResult,
  GetItemsResult,
  GetPassiveSkillsResult,
} from "cn-poe-utils/api";

export const TENCENT_POE_SITE = "https://poe.game.qq.com";

const PROFILE_URL = "/api/profile";
const GET_CHARACTERS_URL = "/character-window/get-characters";
const GET_ITEMS_URL = "/character-window/get-items";
const GET_PASSIVE_SKILLS_URL = "/character-window/get-passive-skills";

async function fetchJson(url: string, init?: RequestInit): Promise<unknown> {
  try {
    const response = await fetch(url, init);
    if (!response.ok) {
      throw createFetchError(response);
    }
    return response.json();
  } catch (err) {
    throw requestError(err);
  }
}

function createFetchError(response: Response): Error {
  const error = new Error(response.statusText || `HTTP ${response.status}`);
  (error as FetchError).response = response;
  return error;
}

interface FetchError extends Error {
  response?: Response;
}

export async function profile(site: string): Promise<unknown> {
  return fetchJson(site + PROFILE_URL);
}

export async function getCharacters(
  site: string,
  accountName: string,
  realm: string,
): Promise<GetCharactersResult> {
  const form = new URLSearchParams();
  form.append("accountName", accountName);
  form.append("realm", realm);

  return fetchJson(site + GET_CHARACTERS_URL, {
    method: "POST",
    body: form,
  }) as Promise<GetCharactersResult>;
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

  return fetchJson(site + GET_ITEMS_URL, {
    method: "POST",
    body: form,
  }) as Promise<GetItemsResult>;
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

  return fetchJson(site + GET_PASSIVE_SKILLS_URL, {
    method: "POST",
    body: form,
  }) as Promise<GetPassiveSkillsResult>;
}

function requestError(err: unknown) {
  if (err instanceof Error) {
    const response = (err as FetchError).response;
    if (response) {
      const status = response.status;
      if (status === 401) {
        const rtnErr = new Error("未登陆");
        rtnErr.stack = String(err);
        return rtnErr;
      } else if (status === 403) {
        const rtnErr = new Error("账户不存在或已隐藏");
        rtnErr.stack = String(err);
        return rtnErr;
      } else if (status === 429) {
        const limit = rateLimit(response.headers);
        if (limit.length > 0) {
          const rtnErr = new Error(`请求过于频繁，请等待 ${limit} 后再试`);
          rtnErr.stack = String(err);
          return rtnErr;
        }
        const rtnErr = new Error("请求过于频繁，请稍后再试");
        rtnErr.stack = String(err);
        return rtnErr;
      }
    }
    return err;
  }

  return new Error(String(err));
}

function rateLimit(headers: Headers) {
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
