<template>
  <div class="panel-line">
    <label
      ><span v-if="goodsTransEnabled">开启市集物品翻译</span>
      <span v-else>关闭市集物品翻译</span
      ><input
        type="checkbox"
        v-model="goodsTransEnabled"
        @change="switchGoodsTrans"
    /></label>
  </div>
  <div class="panel-line">
    <label
      ><span v-if="bdExportEnabled">开启BD导出</span
      ><span v-else>关闭BD导出</span
      ><input
        type="checkbox"
        v-model="bdExportEnabled"
        @change="switchBDExport"
    /></label>
  </div>
  <div class="panel-line">
    <label
      ><span>后端监听端口</span
      ><input
        type="text"
        maxlength="5"
        class="port-input"
        v-model="listenPort"
      /><button type="button" class="update" @click="updateListenPort">
        更新
      </button></label
    >
  </div>
</template>
<script>
export default {
  name: "Options",
  data: function () {
    return {
      goodsTransEnabled: true,
      bdExportEnabled: true,
      listenPort: 0,
    };
  },
  methods: {
    switchGoodsTrans() {
      chrome.storage.local.set({
        goodsTransEnabled: this.goodsTransEnabled,
      });
    },
    switchBDExport() {
      chrome.storage.local.set({ bdExportEnabled: this.bdExportEnabled });
    },
    updateListenPort() {
      chrome.storage.local.set({ listenPort: this.listenPort });
      alert("success");
    },
  },
  mounted() {
    chrome.storage.local.get({ goodsTransEnabled: true }, (res) => {
      this.goodsTransEnabled = res.goodsTransEnabled;
    });
    chrome.storage.local.get({ bdExportEnabled: true }, (res) => {
      this.bdExportEnabled = res.bdExportEnabled;
    });
    chrome.storage.local.get({ listenPort: 8655 }, (res) => {
      this.listenPort = res.listenPort;
    });
  },
};
</script>

<style scoped>
* {
  font-size: 16px;
}

.panel-line {
  margin: 3px;
}

.panel-line button {
  user-select: none;
}

.panel-line > label > input {
  margin-left: 8px;
}

.port-input {
  width: 50px;
  height: 15px;
}

.update {
  margin-left: 10px;
  font-size: 14px;
  padding: 0px 4px;
}
</style>
