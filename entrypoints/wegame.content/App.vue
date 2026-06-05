<script setup lang="ts">
import {
  ActionType,
  Poe2TransformMessage,
  TransformResult,
} from "@/entrypoints/background";
import {
  getEquipments,
  getJewels,
  getRoleInfo,
  getSkills,
  getTalentTree,
} from "@/utils/poe/poe2_wg_api";
import { ref } from "vue";

const pattern = new RegExp("/helper/poe2/#/share/([^/?]+)");

function getShareCode(link: string): string | null {
  const match = pattern.exec(link);
  if (match) {
    const shareCode = decodeURIComponent(match[1]);
    return shareCode;
  }
  return null;
}

async function createBuilding(): Promise<string> {
  const shareCode = getShareCode(window.location.href);
  if (!shareCode) {
    throw new Error("无法从当前链接中提取分享码");
  }

  const roleInfo = await getRoleInfo(shareCode);
  const roleId = roleInfo.role.role_id;

  const [equipments, jewels, skills, talentTree] = await Promise.all([
    getEquipments(roleId, shareCode),
    getJewels(roleId, shareCode),
    getSkills(roleId, shareCode),
    getTalentTree(roleId, shareCode),
  ]);

  const message: Poe2TransformMessage = {
    action: ActionType.POE2_BUILDING_TRANSFORM,
    payload: {
      equipments: JSON.stringify(equipments),
      jewels: JSON.stringify(jewels),
      roleInfo: JSON.stringify(roleInfo),
      skills: JSON.stringify(skills),
      talentTree: JSON.stringify(talentTree),
    },
  };
  const result: TransformResult = await browser.runtime.sendMessage(message);
  if (!result.ok) {
    throw new Error(result.message);
  }

  return result.payload!;
}

const loading = ref(false);
const code = ref("");

async function handleCreateClick() {
  loading.value = true;
  code.value = "";
  try {
    const payload = await createBuilding();
    code.value = payload;
    try {
      await navigator.clipboard.writeText(payload);
    } catch (e) {
      console.warn("Clipboard write failed:", e);
    }
  } catch (err: any) {
    const message = err?.message ?? String(err);
    window.alert(message);
  } finally {
    loading.value = false;
  }
}

async function handleCopy() {
  navigator.clipboard.writeText(code.value);
}
</script>

<template>
  <span class="line-container">
    <button @click="handleCreateClick" :disabled="loading">导出POB</button>
  </span>
  <span class="line-container">
    <input disabled maxlength="50" :value="code" />
    <button @click="handleCopy" :disabled="code.length === 0">复制</button>
  </span>
</template>

<style scoped>
.line-container {
  display: flex;
  margin: 3px 0;
  min-height: 25px;
}

.line-container select {
  min-height: 25px;
  margin-right: 4px;
  min-width: 100px;
}

.line-container input {
  margin-right: 4px;
}
</style>
