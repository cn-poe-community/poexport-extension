<script setup lang="ts">
import Button from "@/components/ui/button/Button.vue";
import { profile, POE_SITE_TENCENT } from "@/utils/poe1_api";
import { ref, onMounted } from "vue";
import { browser } from "wxt/browser";

const POE_FORUM_URL = "https://poe.game.qq.com";
const COOKIE_NAMES = ["POESESSID"];

const cookieStr = ref("");

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

onMounted(async () => {
  loadCookie();
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
    <div class="mt-0.5">
      <Button class="w-full" @click="handleSettingsBtnClick" variant="outline">
        设置
      </Button>
    </div>
  </div>
</template>
