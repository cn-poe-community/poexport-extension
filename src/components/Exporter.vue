<template>
  <span class="line-container">
    <input
      type="text"
      placeholder="输入论坛账户名"
      maxlength="50"
      v-model.trim="accountName"
    />
    <button @click="getCharacters" :disabled="!getCharactersReady">开始</button>
  </span>
  <span class="line-container">
    <div v-if="selectReady">
      <select
        v-model="leagueSelected"
        v-if="selectReady"
        @change="leagueSelectedChanged"
      >
        <option v-for="item in leagues" :key="item" :value="item">
          {{ item }}
        </option>
      </select>
      <select v-model="characterSelected" v-if="selectReady">
        <option
          v-for="item in charactersShown"
          :key="item.name"
          :value="item.name"
        >
          {{ item.name }},{{ item.level }},{{ item.class }}
        </option>
      </select>
      <button :disabled="!exportReady" v-if="selectReady" @click="exportData">
        导出
      </button>
    </div>
  </span>
  <span class="line-container">
    <input disabled maxlength="50" :value="itemsCodePreview" />
    <button @click="copyItemsCode">复制</button>
  </span>
  <span class="line-container">
    <input disabled maxlength="50" :value="passiveSkillsCodePreview" />
    <button @click="copyPassiveSkillsCode">复制</button>
  </span>
</template>
<script>
import axios from "axios";
import {
  translateItems,
  translatePassiveSkills,
} from "poe-cn-export-translator";
const { deflate } = require("zlib");

export default {
  name: "Exporter",
  props: {
    initialAccountName: String,
  },
  data: function () {
    return {
      accountName: this.initialAccountName,
      realm: "pc",
      characters: [],
      leagues: [],
      leagueSelected: "",
      charactersShown: [],
      characterSelected: "",
      itemsCode: "",
      passiveSkillsCode: "",
    };
  },
  computed: {
    getCharactersReady() {
      return Boolean(this.accountName);
    },
    selectReady() {
      return this.characters.length > 0;
    },
    exportReady() {
      return this.characters.length > 0 && this.characterSelected;
    },
    itemsCodePreview() {
      return this.itemsCode.substring(0, 50);
    },
    passiveSkillsCodePreview() {
      return this.passiveSkillsCode.substring(0, 50);
    },
  },
  methods: {
    leagueSelectedChanged() {
      let list = [];
      for (let c of this.characters) {
        if (c.league === this.leagueSelected) {
          list.push(c);
        }
      }

      if (list) {
        this.characterSelected = list[0].name;
      }
      this.charactersShown = list;
    },
    getCharacters() {
      const url = "/character-window/get-characters";
      const realm = this.realm;
      const accountName = this.accountName;

      let form = new FormData();
      form.append("accountName", accountName);
      form.append("realm", realm);

      const vm = this;
      vm.leagueSelected = "";
      vm.characterSelected = "";

      axios
        .post(url, form)
        .then(function (res) {
          let data = res.data;
          vm.characters = data;

          let leagues = new Set();
          for (let character of data) {
            leagues.add(character.league);
          }
          let leaguesArray = Array.from(leagues);
          vm.leagues = leaguesArray;

          if (leaguesArray.length > 0) {
            vm.leagueSelected = leaguesArray[0];
            vm.leagueSelectedChanged();
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    exportData() {
      this.getItems();
      this.getPassiveSkills();
    },
    getItems() {
      const url = "/character-window/get-items";
      const realm = this.realm;
      const accountName = this.accountName;
      const character = this.characterSelected;

      let form = new FormData();
      form.append("accountName", accountName);
      form.append("realm", realm);
      form.append("character", character);

      const vm = this;
      axios
        .post(url, form)
        .then(function (res) {
          let data = res.data;
          translateItems(data);
          deflate(Buffer.from(JSON.stringify(data), "utf-8"), (err, buffer) => {
            if (err) {
              console.error("An error occurred:", err);
              process.exitCode = 1;
            }
            vm.itemsCode = buffer
              .toString("base64")
              .replaceAll("+", "-")
              .replaceAll("/", "_");
          });
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    getPassiveSkills() {
      const url = "/character-window/get-passive-skills";
      const realm = this.realm;
      const accountName = this.accountName;
      const character = this.characterSelected;

      let params = new URLSearchParams();
      params.append("accountName", accountName);
      params.append("realm", realm);
      params.append("character", character);

      const vm = this;
      axios
        .get(url, {
          params,
        })
        .then(function (res) {
          let data = res.data;
          translatePassiveSkills(data);
          deflate(Buffer.from(JSON.stringify(data), "utf-8"), (err, buffer) => {
            if (err) {
              console.error("An error occurred:", err);
              process.exitCode = 1;
            }
            vm.passiveSkillsCode = buffer
              .toString("base64")
              .replaceAll("+", "-")
              .replaceAll("/", "_");
          });
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    copyItemsCode() {
      navigator.clipboard.writeText(this.itemsCode);
    },
    copyPassiveSkillsCode() {
      navigator.clipboard.writeText(this.passiveSkillsCode);
    },
  },
};
</script>

<style scoped>
.line-container {
  display: flex;
  margin: 3px 0;
  min-height: 25px;
}

.line-container select {
  min-height: 25px;
  margin-right: 4px;
}

.line-container input {
  margin-right: 4px;
}
</style>
