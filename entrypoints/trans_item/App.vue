<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { sendMessage } from "@/utils/messaging";

// Toast 系统
const toastMessage = ref("");
const toastType = ref<"success" | "error" | "info">("success");
const showToast = ref(false);

let toastTimeout: ReturnType<typeof setTimeout> | null = null;

function toast(
  message: string,
  type: "success" | "error" | "info" = "success",
) {
  if (toastTimeout) clearTimeout(toastTimeout);
  toastMessage.value = message;
  toastType.value = type;
  showToast.value = true;
  toastTimeout = setTimeout(() => {
    showToast.value = false;
  }, 2000);
}

// 解析URL参数中的version
const getVersion = (): "poe1" | "poe2" => {
  const params = new URLSearchParams(window.location.search);
  const version = params.get("version");
  return version === "poe2" ? "poe2" : "poe1";
};

const version = ref<"poe1" | "poe2">("poe1");

onMounted(() => {
  version.value = getVersion();
});

// 切换版本
function switchVersion(v: "poe1" | "poe2") {
  version.value = v;
}

const leftText = ref("");
const rightText = ref("");
const isTranslating = ref(false);

// 根据version动态设置placeholder
const leftPlaceholder = computed(() => {
  return version.value === "poe2" ? "在此输入文本或JSON" : "在此输入文本";
});

// 按钮禁用状态
const canTranslate = computed(
  () => !isTranslating.value && leftText.value.trim() !== "",
);
const canCopy = computed(() => rightText.value.trim() !== "");

// 检测是否为JSON并压缩
function parseContent(text: string): {
  item: string;
  isJSON: boolean;
  isText: boolean;
} {
  const trimmed = text.trim();
  try {
    const parsed = JSON.parse(trimmed);
    return {
      item: JSON.stringify(parsed), // 压缩JSON
      isJSON: true,
      isText: false,
    };
  } catch {
    return {
      item: trimmed,
      isJSON: false,
      isText: true,
    };
  }
}

// 复制到剪贴板
async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast("已复制", "success");
  } catch {
    toast("复制失败", "error");
  }
}

// 翻译功能
async function handleTranslate() {
  if (isTranslating.value || !leftText.value.trim()) return;
  isTranslating.value = true;
  rightText.value = ""; // 先清空右边内容

  try {
    const content = parseContent(leftText.value);

    let result: string;
    if (version.value === "poe1") {
      result = await sendMessage("translatePOE1Item", { item: content.item });
    } else {
      result = await sendMessage("translatePOE2Item", { item: content.item });
    }

    rightText.value = result;

    // 复制到剪贴板
    if (rightText.value) {
      await copyToClipboard(rightText.value);
    }
  } catch (error) {
    toast("翻译失败", "error");
    console.error("翻译错误:", error);
  } finally {
    isTranslating.value = false;
  }
}

// 手动复制功能
async function handleCopy() {
  if (rightText.value) {
    await copyToClipboard(rightText.value);
  } else {
    toast("没有可复制的内容", "info");
  }
}
</script>

<template>
  <div class="flex h-screen w-full flex-col">
    <!-- 版本切换 -->
    <div class="border-b border-border p-2 flex items-center gap-1">
      <Button
        :variant="version === 'poe1' ? 'default' : 'outline'"
        size="sm"
        :class="version !== 'poe1' ? 'opacity-50' : ''"
        @click="switchVersion('poe1')"
      >
        POE1
      </Button>
      <Button
        :variant="version === 'poe2' ? 'default' : 'outline'"
        size="sm"
        :class="version !== 'poe2' ? 'opacity-50' : ''"
        @click="switchVersion('poe2')"
      >
        POE2
      </Button>
    </div>

    <div class="flex flex-1 min-h-0">
      <div class="flex-1 min-w-0 flex flex-col border-r border-border p-4">
        <div class="mb-3 text-sm font-medium text-muted-foreground">输入</div>
        <div class="flex-1 min-h-0 min-w-0">
          <Textarea
            v-model="leftText"
            class="h-full resize-none overflow-y-auto overflow-x-hidden whitespace-pre-wrap break-words"
            :placeholder="leftPlaceholder"
          />
        </div>
      </div>

      <div class="flex-1 min-w-0 flex flex-col border-l border-border p-4">
        <div class="mb-3 text-sm font-medium text-muted-foreground">输出</div>
        <div class="flex-1 min-h-0 min-w-0">
          <Textarea
            v-model="rightText"
            class="h-full resize-none overflow-y-auto overflow-x-hidden whitespace-pre-wrap break-words"
            disabled
            placeholder="输出将在此显示..."
          />
        </div>
      </div>
    </div>

    <div class="border-t border-border p-4 flex gap-2">
      <Button @click="handleTranslate" :disabled="!canTranslate">
        {{ isTranslating ? "翻译中..." : "翻译" }}
      </Button>
      <Button variant="outline" @click="handleCopy" :disabled="!canCopy">
        复制
      </Button>
    </div>

    <!-- Toast -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-2"
    >
      <div
        v-if="showToast"
        class="fixed bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 rounded text-sm font-medium shadow-lg"
        :class="{
          'bg-green-500 text-white': toastType === 'success',
          'bg-red-500 text-white': toastType === 'error',
          'bg-gray-500 text-white': toastType === 'info',
        }"
      >
        {{ toastMessage }}
      </div>
    </Transition>
  </div>
</template>
