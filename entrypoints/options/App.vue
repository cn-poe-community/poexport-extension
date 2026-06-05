<script setup lang="ts">
import { defaultSettings, Settings } from "@/utils/app/setting";

const settings: Settings = reactive(defaultSettings());

async function loadSettings() {
  let values = await browser.storage.local.get(defaultSettings());
  Object.assign(settings, values);
}

function switchBool(event: MouseEvent, name: string) {
  const checked = (event.target as HTMLInputElement).checked;
  if (name in settings && typeof settings[name] === "boolean") {
    settings[name] = checked;
    browser.storage.local.set({ [name]: checked });
  }
}

onMounted(async () => {
  loadSettings();
});
</script>

<template>
  <div class="text-base min-w-50 max-w-150 mx-auto mt-5">
    <h1 class="text-2xl">PoeExport 设置</h1>
    <div class="divider divider-neutral"></div>
    <h2 class="text-lg">论坛网页优化</h2>
    <div class="grid grid-cols-2">
      <span class="">POE1导出POB</span>
      <input
        type="checkbox"
        class="toggle toggle-primary toggle-sm justify-self-end"
        v-model="settings.poe1ExportEnabled"
        @click="switchBool($event, 'poe1ExportEnabled')"
      />
    </div>
    <div class="divider"></div>
    <h2 class="text-lg">POE2交易网页优化</h2>
    <div class="grid grid-cols-2">
      <span>物品复制为文本（Beta）</span>
      <input
        type="checkbox"
        checked="true"
        class="toggle toggle-primary toggle-sm justify-self-end"
        v-model="settings.trade2ItemTextEnabled"
        @click="switchBool($event, 'trade2ItemTextEnabled')"
      />
    </div>
    <div class="divider"></div>
    <h2 class="text-lg">WeGame助手网页优化</h2>
    <div class="grid grid-cols-2">
      <span>POE2导出POB</span>
      <input
        type="checkbox"
        checked="true"
        class="toggle toggle-primary toggle-sm justify-self-end"
        v-model="settings.poe2ExportEnabled"
        @click="switchBool($event, 'poe2ExportEnabled')"
      />
    </div>
  </div>
</template>
