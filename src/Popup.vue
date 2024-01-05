<script setup lang="ts">
import { ref, onMounted } from 'vue'
import * as poeapi from './lib/poeapi.js'

const POE_FORUM_URL = 'https://poe.game.qq.com'
const SESSION_NAME = 'POESESSID'

const poeSessId = ref('')

function handleClick() {
  navigator.clipboard.writeText(poeSessId.value)
}

onMounted(() => {
  chrome.cookies.get({ url: POE_FORUM_URL, name: SESSION_NAME }, async (cookie) => {
    if (cookie) {
      poeSessId.value = cookie.value
      const { error } = await poeapi.profile()
      if (error !== null) {
        poeSessId.value = ''
      }
    }
  })
})
</script>

<template>
  <div class="part">
    <label for="poeSessId">POESESSID:</label>
    <div class="line">
      <input
        name="poeSessId"
        disabled
        maxlength="25"
        :value="poeSessId"
        type="password"
        placeholder="论坛账户未登陆"
      />
      <button @click="handleClick" :disabled="poeSessId === ''">复制</button>
    </div>
  </div>
</template>

<style scoped>
.line {
  display: flex;
  margin: 3px 0;
  min-height: 25px;
}

.line button {
  margin-left: 4px;
}
</style>
