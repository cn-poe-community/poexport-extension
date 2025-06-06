<script setup lang="ts">
import { computed, reactive, ref, onMounted } from "vue";
import * as poeapi from "./libs/poeapi";
import { CharacterTypes, ItemTypes } from "pathofexile-api-types";

const props = defineProps(["createBuilding", "startup"]);

const accountName = ref("");
const realm = "pc";
const characters = ref<CharacterTypes.GetCharactersResult>([]);
const leagues = ref<string[]>([]);
const charactersLeagueIdx = ref(new Map<string, CharacterTypes.Character[]>());
const currLeague = ref("");
const currCharacters = ref<CharacterTypes.Character[]>([]);
const currCharacter = ref("");
const buildingCode = ref("");
const state = reactive({
  accountName,
  realm,
  characters,
  leagues,
  charactersLeagueIdx,
  currLeague,
  currCharacters,
  currCharacter,
  buildingCode,
});

const getCharactersReady = computed(() => {
  return state.accountName.length > 0;
});
const selectReady = computed(() => {
  return state.characters.length > 0;
});
const exportReady = computed(() => {
  return state.characters.length > 0 && Boolean(state.currCharacter);
});

function handleLeagueSelect() {
  state.currCharacters = state.charactersLeagueIdx.get(state.currLeague)!;
  state.currCharacter = state.currCharacters[0].name;
}

async function handleCharactersQuery() {
  state.characters.length = 0;
  state.leagues.length = 0;

  const realm = state.realm;
  const accountName = state.accountName;

  let data: CharacterTypes.GetCharactersResult | null = null;
  try {
    data = await poeapi.getCharacters(
      poeapi.TENCENT_POE_SITE,
      accountName,
      realm,
    );
  } catch (e) {
    if (e instanceof Error) {
      alert(e.message);
    } else {
      alert(e);
    }
    return;
  }

  const characters = data;
  state.characters = characters;

  const charLeagueIdx = new Map<string, CharacterTypes.Character[]>();
  for (const character of characters) {
    const leagueName = character.league;
    let list = charLeagueIdx.get(leagueName);
    if (!list) {
      list = [];
      charLeagueIdx.set(leagueName, list);
    }
    list.push(character);
  }
  state.charactersLeagueIdx = charLeagueIdx;
  const leagues = Array.from(charLeagueIdx.keys());
  state.leagues = leagues;
  if (leagues.length > 0) {
    state.currLeague = leagues[0];
    handleLeagueSelect();
  }
}

async function handleExport() {
  state.buildingCode = "";

  const accountName = state.accountName;
  const character = state.currCharacter;
  const realm = state.realm;

  let items = null;
  let passiveSkills = null;

  try {
    items = await poeapi.getItems(
      poeapi.TENCENT_POE_SITE,
      accountName,
      character,
      realm,
    );
    passiveSkills = await poeapi.getPassiveSkills(
      poeapi.TENCENT_POE_SITE,
      accountName,
      character,
      realm,
    );

    removeInventoryItems(items);
    state.buildingCode = await props.createBuilding(items, passiveSkills);
  } catch (e) {
    if (e instanceof Error) {
      alert(e.message);
    } else {
      alert(e);
    }
    return;
  }
}

function removeInventoryItems(result: ItemTypes.GetItemsResult) {
  if (result.items) {
    const itemList = result.items;
    const remains = [];
    for (const item of itemList) {
      if (
        item.inventoryId !== "MainInventory" &&
        item.inventoryId !== "ExpandedMainInventory"
      ) {
        remains.push(item);
      }
    }
    if (remains.length < result.items.length) {
      result.items = remains;
    }
  }
}

function handleCopy() {
  navigator.clipboard.writeText(state.buildingCode);
}

function getInitialAccountName() {
  let accountName = getAccountNameFromProfileLink(window.location.href);
  if (accountName !== null) {
    return accountName;
  }

  const profileLinkNode = document.querySelector<HTMLLinkElement>(
    "#statusBar .profile-link a",
  );
  if (profileLinkNode !== null) {
    accountName = getAccountNameFromProfileLink(profileLinkNode.href);
    if (accountName !== null) {
      return accountName;
    }
  }

  return "";
}

const pattern = new RegExp("/account/view-profile/([^/?]+)"); //reusing non-global regexp is safe

function getAccountNameFromProfileLink(link: string) {
  const match = pattern.exec(link);
  if (match) {
    return decodeURI(match[1]);
  }
  return null;
}

onMounted(() => {
  state.accountName = getInitialAccountName();
  if (props.startup) {
    props.startup();
  }
});
</script>

<template>
  <span class="line-container">
    <input
      type="text"
      placeholder="输入论坛账户名"
      maxlength="50"
      v-model.trim="state.accountName"
    />
    <button @click="handleCharactersQuery" :disabled="!getCharactersReady">
      开始
    </button>
  </span>
  <span class="line-container">
    <div v-if="selectReady">
      <select
        v-model="state.currLeague"
        v-if="selectReady"
        @change="handleLeagueSelect"
      >
        <option v-for="item in leagues" :key="item" :value="item">
          {{ item }}
        </option>
      </select>
      <select v-model="state.currCharacter" v-if="selectReady">
        <option
          v-for="item in state.currCharacters"
          :key="item.name"
          :value="item.name"
        >
          {{ item.name }},{{ item.level }},{{ item.class }}
        </option>
      </select>
      <button :disabled="!exportReady" v-if="selectReady" @click="handleExport">
        导出
      </button>
    </div>
    <div v-else>
      <select disabled></select>
      <select disabled></select>
      <button disabled>导出</button>
    </div>
  </span>
  <span class="line-container">
    <input disabled maxlength="50" :value="state.buildingCode" />
    <button @click="handleCopy" :disabled="state.buildingCode.length === 0">
      复制
    </button>
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
