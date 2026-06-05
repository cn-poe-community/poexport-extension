import { wgTypes } from "cn-poe2-utils/api";

export async function getRoleInfo(
  shareCode: string,
): Promise<wgTypes.GetRoleInfoResult> {
  const response = await fetch(
    "https://www.wegame.com.cn/api/v1/wegame.pallas.poe2.Profile/GetRoleInfo",
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
  if (!response.ok) {
    throw new Error(response.statusText || `HTTP ${response.status}`);
  }
  return response.json();
}

export async function getEquipments(
  roleId: string,
  shareCode: string,
): Promise<wgTypes.GetRoleInfoResult> {
  const response = await fetch(
    "https://www.wegame.com.cn/api/v1/wegame.pallas.poe2.Profile/GetEquipments",
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
  if (!response.ok) {
    throw new Error(response.statusText || `HTTP ${response.status}`);
  }
  return response.json();
}

export async function getTalentTree(
  roleId: string,
  shareCode: string,
): Promise<wgTypes.GetRoleInfoResult> {
  const response = await fetch(
    "https://www.wegame.com.cn/api/v1/wegame.pallas.poe2.Profile/GetTalentTree",
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
  if (!response.ok) {
    throw new Error(response.statusText || `HTTP ${response.status}`);
  }
  return response.json();
}

export async function getJewels(
  roleId: string,
  shareCode: string,
): Promise<wgTypes.GetRoleInfoResult> {
  const response = await fetch(
    "https://www.wegame.com.cn/api/v1/wegame.pallas.poe2.Profile/GetJewels",
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
  if (!response.ok) {
    throw new Error(response.statusText || `HTTP ${response.status}`);
  }
  return response.json();
}

export async function getSkills(
  roleId: string,
  shareCode: string,
): Promise<wgTypes.GetRoleInfoResult> {
  const response = await fetch(
    "https://www.wegame.com.cn/api/v1/wegame.pallas.poe2.Profile/GetSkills",
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
  if (!response.ok) {
    throw new Error(response.statusText || `HTTP ${response.status}`);
  }
  return response.json();
}
