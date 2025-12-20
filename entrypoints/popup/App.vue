<script setup lang="ts">
import { ref, onMounted } from "vue";
import { browser } from "wxt/browser";

const POE_FORUM_URL = "https://poe.game.qq.com";
const COOKIE_NAMES = ["POESESSID"];

const cookiesStr = ref("");

function handleCookiesCopyBtnClick() {
  navigator.clipboard.writeText(cookiesStr.value);
}

function handleSettingsBtnClick() {
  browser.runtime.openOptionsPage();
}

async function loadCookies() {
  let str = "";
  for (const name of COOKIE_NAMES) {
    const cookie = await browser.cookies.get({ url: POE_FORUM_URL, name });
    if (cookie) {
      str = str + `${name}=${cookie.value};`;
    }
  }

  cookiesStr.value = str.substring(0, str.length - 1);
}

onMounted(async () => {
  loadCookies();
});
</script>

<template>
  <div class="min-w-[200px] mx-1 my-1">
    <div class="w-full">
      <button
        class="btn btn-sm btn-wide btn-outline"
        @click="handleCookiesCopyBtnClick"
        :disabled="cookiesStr === ''"
      >
        复制Cookies
      </button>
    </div>
    <div class="w-full mt-0.5">
      <button
        class="btn btn-sm btn-wide btn-dash"
        @click="handleSettingsBtnClick"
      >
        设置
      </button>
    </div>
  </div>
</template>
