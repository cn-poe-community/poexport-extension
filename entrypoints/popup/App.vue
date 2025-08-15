<script setup lang="ts">
import { ref, onMounted } from "vue";
import { browser } from "wxt/browser";

const POE_FORUM_URL = "https://poe.game.qq.com";
const COOKIE_NAMES = ["POESESSID"];

const cookiesStr = ref("");
const panelEnabled = ref(false);

function handleCookiesCopyBtnClick() {
  navigator.clipboard.writeText(cookiesStr.value);
}

function handlePanelEnabledBtnClick(event: MouseEvent) {
  const input = event.target as HTMLInputElement;
  browser.storage.local.set({ panelEnabled: input.checked });
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

async function loadSettings() {
  let values = await browser.storage.local.get({
    panelEnabled: true,
  });
  panelEnabled.value = values.panelEnabled;
}

onMounted(async () => {
  loadCookies();
  loadSettings();
});
</script>

<template>
  <div class="part">
    <div class="line">
      <span class="line-item">Cookies</span>
      <button
        id="cookie-copy-btn"
        class="line-item"
        @click="handleCookiesCopyBtnClick"
        :disabled="cookiesStr === ''"
      >
        复制
      </button>
    </div>
    <div class="line">
      <label for="panel-enabled-btn" class="line-item">面板(刷新生效)</label>
      <input
        id="panel-enabled-btn"
        v-model="panelEnabled"
        @click="handlePanelEnabledBtnClick"
        type="checkbox"
        class="line-item"
      />
    </div>
  </div>
</template>

<style scoped>
.line {
  display: flex;
  align-items: center;
  line-height: 2em;
  min-width: 180px;
  user-select: none;
}

.line-item {
  flex: 1 1 auto;
}

.line button {
  margin-left: 4px;
  flex: 0 1 auto;
}

.line [type="checkbox"] {
  margin-left: 4px;
  flex: 0 1 20px;
}
</style>
