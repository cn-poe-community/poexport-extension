<script setup lang="ts">
import {
  ActionType,
  Poe1TransformMessage,
  TransformResult,
} from "@/entrypoints/background";
import Exporter from "@/components/Exporter.vue";
import { GetItemsResult, GetPassiveSkillsResult } from "cn-poe-utils/api";

async function createBuilding(
  items: GetItemsResult,
  passiveSkills: GetPassiveSkillsResult,
): Promise<string> {
  const message: Poe1TransformMessage = {
    action: ActionType.POE1_BUILDING_TRANSFORM,
    payload: {
      items: JSON.stringify(items),
      passiveSkills: JSON.stringify(passiveSkills),
    },
  };
  const result: TransformResult = await browser.runtime.sendMessage(message);
  if (!result.ok) {
    throw new Error(result.msg);
  }

  return result.payload!;
}

function startup() {}
</script>

<template>
  <Exporter :create-building="createBuilding" :startup="startup" />
</template>
