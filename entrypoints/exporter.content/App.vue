<script setup lang="ts">
import Exporter from "./Exporter.vue";
import { GetItemsResult, GetPassiveSkillsResult } from "cn-poe-utils/api";
import { sendMessage } from "@/utils/messaging";

async function createBuilding(
  items: GetItemsResult,
  passiveSkills: GetPassiveSkillsResult,
): Promise<string> {
  return await sendMessage("createPOE1Build", {
    items: JSON.stringify(items),
    passiveSkills: JSON.stringify(passiveSkills),
  });
}

function startup() {}
</script>

<template>
  <Exporter :create-building="createBuilding" :startup="startup" />
</template>
