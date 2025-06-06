<script setup lang="ts">
import Exporter from "../components/Exporter.vue";
import { ZhToEn } from "cn-poe-translator";
import Assets from "cn-poe-export-db";
import { transform } from "pob-building-creator";

const factory = new ZhToEn.TranslatorFactory(Assets);
const jsonTranslator = factory.getJsonTranslator();

async function createBuilding(items: any, passiveSkills: any) {
  jsonTranslator.transItems(items);
  jsonTranslator.transPassiveSkills(passiveSkills);
  const building = transform(items, passiveSkills);

  const compressed = window.pako.deflate(building.toString());

  const code = btoa(String.fromCharCode(...compressed))
    .replaceAll("+", "-")
    .replaceAll("/", "_");

  return code;
}
</script>

<template>
  <Exporter :create-building="createBuilding" />
</template>
