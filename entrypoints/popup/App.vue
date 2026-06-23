<script setup lang="ts">
import Button from "@/components/ui/button/Button.vue";
import { profile, POE_SITE_TENCENT } from "@/utils/poe1_api";
import { ref, onMounted } from "vue";
import { browser } from "wxt/browser";
import { sendMessage } from "@/utils/messaging";
import { defaultSettings, Settings, TranslationTarget } from "@/utils/setting";

const POE_FORUM_URL = "https://poe.game.qq.com";
const COOKIE_NAMES = ["POESESSID"];

const cookieStr = ref("");
const translationTarget = ref<TranslationTarget>("POE1");

async function handleCookieCopyBtnClick() {
  try {
    await profile(POE_SITE_TENCENT);
  } catch (e) {
    await browser.tabs.create({ url: "https://poe.game.qq.com/login" });
    return;
  }

  await navigator.clipboard.writeText(cookieStr.value);
}

function handleSettingsBtnClick() {
  browser.runtime.openOptionsPage();
}

async function handleTranslateClick() {
  await sendMessage("openTransItemPage", {
    version: translationTarget.value.toLowerCase(),
  });
}

async function loadCookie() {
  let str = "";
  for (const name of COOKIE_NAMES) {
    const cookie = await browser.cookies.get({ url: POE_FORUM_URL, name });
    if (cookie) {
      str = str + `${name}=${cookie.value};`;
    }
  }

  cookieStr.value = str.substring(0, str.length - 1);
}

async function loadSettings() {
  const values = await browser.storage.local.get(defaultSettings());
  const settings = values as Settings;
  translationTarget.value = settings.tranlationDefaultTarget;
}

onMounted(async () => {
  loadCookie();
  loadSettings();
});
</script>

<template>
  <div class="min-w-50 my-1 ml-1 mr-0.5">
    <div>
      <Button
        class="w-full"
        @click="handleCookieCopyBtnClick"
        variant="outline"
      >
        复制Cookie
      </Button>
    </div>
    <div>
      <Button class="w-full" @click="handleTranslateClick" variant="outline">
        翻译物品
      </Button>
    </div>
    <div class="mt-0.5">
      <Button class="w-full" @click="handleSettingsBtnClick" variant="outline">
        设置
      </Button>
    </div>
  </div>
</template>
