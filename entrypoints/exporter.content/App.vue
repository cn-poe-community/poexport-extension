<script setup lang="ts">
import {
  Poe1TransformMessage,
  Poe1TransformResponse,
  ExMessageType,
  ExResponseCode,
} from "@/entrypoints/background";
import Exporter from "@/components/Exporter.vue";

import { ItemTypes, PassiveSkillTypes } from "pathofexile-api-types";

async function createBuilding(
  items: ItemTypes.GetItemsResult,
  passiveSkills: PassiveSkillTypes.GetPassiveSkillsResult,
): Promise<string> {
  const message: Poe1TransformMessage = {
    type: ExMessageType.POE1_BUILDING_TRANSFORM,
    items: JSON.stringify(items),
    passiveSkills: JSON.stringify(passiveSkills),
  };
  const resp: Poe1TransformResponse =
    await browser.runtime.sendMessage(message);
  if (resp.code !== ExResponseCode.SUCCESS) {
    throw new Error(resp.msg);
  }

  return resp.building!;
}

function startup() {}
</script>

<template>
  <Exporter :create-building="createBuilding" :startup="startup" />
</template>
