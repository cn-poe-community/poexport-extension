<script setup lang="ts">
import Exporter from './components/Exporter.vue'
import CnPoeTranslator from 'cn-poe-translator'
import CnPoeExportDb from 'cn-poe-export-db'
import BuildingCreater from 'pob-building-creater'

const factory = new CnPoeTranslator.BasicTranslatorFactory(CnPoeExportDb)
const jsonTranslator = factory.getJsonTranslator()

async function createBuilding(items: any, passiveSkills: any) {
  jsonTranslator.translateItems(items)
  jsonTranslator.translatePassiveSkills(passiveSkills)
  const building = BuildingCreater.transform(items, passiveSkills)

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
