<script setup lang="ts">
import Exporter from './components/Exporter.vue'
import pako from 'Pako'

async function createBuilding(items: any, passiveSkills: any) {
  const building = { items, passiveSkills }
  const compressed = pako.deflate(JSON.stringify(building))
  const { code, data, msg } = await chrome.runtime.sendMessage({
    task: 'transform',
    compressed: Array.from(compressed)
  })
  if (code > 0) {
    throw new Error(msg)
  }

  return data
}

function startup() {}
</script>

<template>
  <Exporter :create-building="createBuilding" :startup="startup" />
</template>
