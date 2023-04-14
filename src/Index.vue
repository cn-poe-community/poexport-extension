<script>
import axios from "axios";
const TEST_URL = "https://poe.game.qq.com/trade";

export default {
  data() {
    return {
      poeSessId: "",
    };
  },
  mounted() {
    const url = "https://poe.game.qq.com";
    const sessionName = "POESESSID";

    chrome.cookies.get({ url: url, name: sessionName }, (cookie) => {
      if (cookie) {
        const session = cookie.value;
        this.poeSessId = session;
        axios
          .get(TEST_URL, {
            maxRedirects: 0,
          })
          .catch(() => {
            this.poeSessId = "";
          })
          .then((res) => {
            if (res.data.includes("创建游戏账号")) {
              this.poeSessId = "";
            }
          });
      }
    });
  },
  methods: {
    copyPoeSessId() {
      navigator.clipboard.writeText(this.poeSessId);
    },
  },
};
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
      <button @click="copyPoeSessId" :disabled="poeSessId === ''">复制</button>
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
