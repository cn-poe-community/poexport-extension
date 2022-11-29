<script>
export default {
  data() {
    return {
      poeSessionId: "",
    };
  },
  mounted() {
    const url = "https://poe.game.qq.com";
    const sessionName = "POESESSID";

    const that = this;
    chrome.cookies.get({ url: url, name: sessionName }, function (cookie) {
      if (cookie) {
        that.poeSessionId = cookie.value;
      }
    });
  },
  methods: {
    copyPOESessionId() {
      navigator.clipboard.writeText(this.poeSessionId);
    },
  },
};
</script>

<template>
  <div class="part">
    <label for="poeSessionId">POESESSID:</label>
    <div class="line">
      <input
        name="poeSessionId"
        disabled
        maxlength="25"
        :value="poeSessionId"
        type="password"
        placeholder="POE论坛账户未登陆"
      />
      <button @click="copyPOESessionId" :disabled="poeSessionId === ''">
        复制
      </button>
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
