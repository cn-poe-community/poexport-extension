<script setup lang="ts">
import Exporter from './components/Exporter.vue'
import { BasicTranslatorFactory } from 'cn-poe-translator'
import Assets from 'cn-poe-export-db'
import { transform } from 'pob-building-creater'

const factory = new BasicTranslatorFactory(Assets)
const jsonTranslator = factory.getJsonTranslator()

async function createBuilding(items: any, passiveSkills: any) {
  jsonTranslator.translateItems(items)
  jsonTranslator.translatePassiveSkills(passiveSkills)
  const building = transform(items, passiveSkills)

  const compressed = window.pako.deflate(building.toString())

  const code = btoa(String.fromCharCode(...compressed))
    .replaceAll('+', '-')
    .replaceAll('/', '_')

  return code
}
</script>

<template>
  <Exporter :create-building="createBuilding" />
</template>
