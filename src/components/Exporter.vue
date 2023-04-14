<script>
import axios from "axios";
import { deflate } from "pako";

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
      leagueMap: new Map(),
      currLeague: "",
      currCharacters: [],
      currCharacter: "",
      buildingCode: "",
      server: "",
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
      return this.characters.length > 0 && Boolean(this.currCharacter);
    },
    buildingCodePreview() {
      return this.buildingCode.substring(0, 50);
    },
  },
  methods: {
    selectNewLeague() {
      this.currCharacters = this.leagueMap.get(this.currLeague);
      this.currCharacter = this.currCharacters[0].name;
    },
    getCharacters() {
      const url = "/character-window/get-characters";
      const realm = this.realm;
      const accountName = this.accountName;

      let form = new FormData();
      form.append("accountName", accountName);
      form.append("realm", realm);

      this.currLeague = "";
      this.currCharacter = "";

      axios
        .post(url, form)
        .then((res) => {
          const characters = res.data;
          this.characters = characters;

          let leagueMap = new Map();
          for (const character of characters) {
            const leagueName = character.league;
            let list = leagueMap.get(leagueName);
            if (list === undefined) {
              list = [];
              leagueMap.set(leagueName, list);
            }
            list.push(character);
          }
          this.leagueMap = leagueMap;
          const leagues = Array.from(leagueMap.keys());
          this.leagues = leagues;
          if (leagues.length > 0) {
            this.currLeague = leagues[0];
            this.selectNewLeague();
          }
        })
        .catch((err) => {
          this.leagues = [];
          this.characters = [];
          this.itemsCode = "";
          console.log(err);
          alert(err);
        });
    },
    async exportBuild() {
      const items = await this.getItems();
      const passiveSkills = await this.getPassiveSkills();
      this.transform(items, passiveSkills);
    },
    async getItems() {
      const url = "/character-window/get-items";
      const realm = this.realm;
      const accountName = this.accountName;
      const character = this.currCharacter;

      let form = new FormData();
      form.append("accountName", accountName);
      form.append("realm", realm);
      form.append("character", character);

      const res = await axios.post(url, form);
      return res.data;
    },
    async getPassiveSkills() {
      const url = "/character-window/get-passive-skills";
      const realm = this.realm;
      const accountName = this.accountName;
      const character = this.currCharacter;

      let params = new URLSearchParams();
      params.append("accountName", accountName);
      params.append("realm", realm);
      params.append("character", character);

      const res = await axios.get(url, { params });
      return res.data;
    },
    async transform(items, passiveSkills) {
      const building = { items, passiveSkills };
      const compressed = deflate(JSON.stringify(building));
      const resp = await chrome.runtime.sendMessage({
        task: "transform",
        compressed: Array.apply(null, new Uint8Array(compressed)),
      });
      if (resp.code > 0) {
        alert(resp.msg);
        return;
      }
      this.buildingCode = resp.data;
    },
    copyBuildCode() {
      navigator.clipboard.writeText(this.buildingCode);
    },
  },
  async mounted() {
    chrome.runtime.sendMessage({ task: "load" });
  },
};
</script>

<template>
  <span class="line-container">
    <input type="text" placeholder="输入论坛账户名" maxlength="50" v-model.trim="accountName" />
    <button @click="getCharacters" :disabled="!getCharactersReady">开始</button>
  </span>
  <span class="line-container">
    <div v-if="selectReady">
      <select v-model="currLeague" v-if="selectReady" @change="selectNewLeague">
        <option v-for="item in leagues" :key="item" :value="item">
          {{ item }}
        </option>
      </select>
      <select v-model="currCharacter" v-if="selectReady">
        <option v-for="item in currCharacters" :key="item.name" :value="item.name">
          {{ item.name }},{{ item.level }},{{ item.class }}
        </option>
      </select>
      <button :disabled="!exportReady" v-if="selectReady" @click="exportBuild">导出</button>
    </div>
    <div v-else>
      <select disabled></select>
      <select disabled></select>
      <button disabled>导出</button>
    </div>
  </span>
  <span class="line-container">
    <input disabled maxlength="50" :value="buildingCodePreview" />
    <button @click="copyBuildCode" :disabled="buildingCodePreview.length == 0">复制</button>
  </span>
</template>

<style scoped>
.line-container {
  display: flex;
  margin: 3px 0;
  min-height: 25px;
}

.line-container select {
  min-height: 25px;
  margin-right: 4px;
  min-width: 100px;
}

.line-container input {
  margin-right: 4px;
}
</style>
