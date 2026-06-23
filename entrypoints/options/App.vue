<script setup lang="ts">
import { defaultSettings, Settings, TranslationTarget } from "@/utils/setting";
import { Switch } from "@/components/ui/switch";

const settings: Settings = reactive(defaultSettings());

async function loadSettings() {
  let values = await browser.storage.local.get(defaultSettings());
  Object.assign(settings, values);
}

function saveSetting(name: keyof Settings, value: boolean) {
  if (name in settings) {
    settings[name] = value;
    browser.storage.local.set({ [name]: value });
  }
}

function saveTranslationTarget(value: TranslationTarget) {
  settings.tranlationDefaultTarget = value;
  browser.storage.local.set({ tranlationDefaultTarget: value });
}

onMounted(async () => {
  loadSettings();
});
</script>

<template>
  <div class="min-w-[200px] max-w-[600px] mx-auto mt-5 px-4">
    <h1 class="text-2xl font-semibold mb-4">PoeExport 设置</h1>
    <hr class="border-border mb-4" />
    <h2 class="text-lg font-medium mb-3">论坛网页优化</h2>
    <div class="flex items-center justify-between mb-4">
      <span class="text-sm">POE1导出POB</span>
      <Switch
        :model-value="settings.poe1ExportEnabled"
        @update:model-value="
          (v: boolean) => saveSetting('poe1ExportEnabled', v)
        "
        size="sm"
      />
    </div>
    <hr class="border-border mb-4" />
    <h2 class="text-lg font-medium mb-3">POE2交易网页优化</h2>
    <div class="flex items-center justify-between mb-4">
      <span class="text-sm">复制物品</span>
      <Switch
        :model-value="settings.trade2ItemTextEnabled"
        @update:model-value="
          (v: boolean) => saveSetting('trade2ItemTextEnabled', v)
        "
        size="sm"
      />
    </div>
    <hr class="border-border mb-4" />
    <h2 class="text-lg font-medium mb-3">WeGame助手网页优化</h2>
    <div class="flex items-center justify-between mb-4">
      <span class="text-sm">POE2导出POB</span>
      <Switch
        :model-value="settings.poe2ExportEnabled"
        @update:model-value="
          (v: boolean) => saveSetting('poe2ExportEnabled', v)
        "
        size="sm"
      />
    </div>
    <hr class="border-border mb-4" />
    <h2 class="text-lg font-medium mb-3">物品翻译</h2>
    <div class="flex items-center justify-between mb-4">
      <span class="text-sm">默认翻译目标</span>
      <select
        :value="settings.tranlationDefaultTarget"
        @change="
          (e: Event) =>
            saveTranslationTarget(
              (e.target as HTMLSelectElement).value as TranslationTarget,
            )
        "
        class="px-3 py-1 text-sm border rounded-md"
      >
        <option value="POE1">POE1</option>
        <option value="POE2">POE2</option>
      </select>
    </div>
  </div>
</template>
