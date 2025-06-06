<script setup lang="ts">
import { TransformMessage, TransformResponse } from "@/entrypoints/background";
import Exporter from "../../components/Exporter.vue";
import pako from "pako";
import { ItemTypes, PassiveSkillTypes } from "pathofexile-api-types";

async function createBuilding(
  items: ItemTypes.GetItemsResult,
  passiveSkills: PassiveSkillTypes.GetPassiveSkillsResult,
): Promise<string> {
  const building = { items, passiveSkills };
  const compressed = pako.deflate(JSON.stringify(building));
  const message: TransformMessage = {
    task: "transform",
    data: Array.from(compressed),
  };
  const resp: TransformResponse = await browser.runtime.sendMessage(message);
  if (resp.code > 0) {
    throw new Error(resp.msg);
  }

  return resp.data!;
}

function startup() {}
</script>

<template>
  <Exporter :create-building="createBuilding" :startup="startup" />
</template>
