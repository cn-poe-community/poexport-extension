import { wgTypes } from "cn-poe2-utils/api";

const WG_HOST = `https://www.wegame.com.cn`;
const WG_URL_GET_ROLE_INFO = "/api/v1/wegame.pallas.poe2.Profile/GetRoleInfo";
const WG_URL_GET_EQUIPMENTS =
  "/api/v1/wegame.pallas.poe2.Profile/GetEquipments";
const WG_URL_GET_TALENT_TREE =
  "/api/v1/wegame.pallas.poe2.Profile/GetTalentTree";
const WG_URL_GET_JEWELS = "/api/v1/wegame.pallas.poe2.Profile/GetJewels";
const WG_URL_GET_SKILLS = "/api/v1/wegame.pallas.poe2.Profile/GetSkills";

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) {
    new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return await response.json();
}

export async function getRoleInfo(
  shareCode: string,
): Promise<wgTypes.GetRoleInfoResult> {
  return await fetchJSON<wgTypes.GetRoleInfoResult>(
    WG_HOST + WG_URL_GET_ROLE_INFO,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        share_code: shareCode,
        area: 0,
        from_src: "poe2_helper",
      }),
    },
  );
}

export async function getEquipments(
  roleId: string,
  shareCode: string,
): Promise<wgTypes.GetRoleInfoResult> {
  return await fetchJSON<wgTypes.GetRoleInfoResult>(
    WG_HOST + WG_URL_GET_EQUIPMENTS,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        area: 0,
        openid: "",
        role_id: roleId,
        share_code: shareCode,
        from_src: "poe2_helper",
      }),
    },
  );
}

export async function getTalentTree(
  roleId: string,
  shareCode: string,
): Promise<wgTypes.GetRoleInfoResult> {
  return await fetchJSON<wgTypes.GetRoleInfoResult>(
    WG_HOST + WG_URL_GET_TALENT_TREE,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        area: 0,
        openid: "",
        role_id: roleId,
        share_code: shareCode,
        from_src: "poe2_helper",
      }),
    },
  );
}

export async function getJewels(
  roleId: string,
  shareCode: string,
): Promise<wgTypes.GetRoleInfoResult> {
  const response = await fetch(WG_HOST + WG_URL_GET_JEWELS, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      area: 0,
      openid: "",
      role_id: roleId,
      share_code: shareCode,
      from_src: "poe2_helper",
    }),
  });
  if (!response.ok) {
    throw new Error(response.statusText || `HTTP ${response.status}`);
  }
  return response.json();
}

export async function getSkills(
  roleId: string,
  shareCode: string,
): Promise<wgTypes.GetRoleInfoResult> {
  return await fetchJSON<wgTypes.GetRoleInfoResult>(
    WG_HOST + WG_URL_GET_SKILLS,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({
        area: 0,
        openid: "",
        role_id: roleId,
        share_code: shareCode,
        from_src: "poe2_helper",
      }),
    },
  );
}
