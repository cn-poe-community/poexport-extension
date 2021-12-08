import { createApp } from 'vue'
import Export from './Export.vue'

(function () {
    let container = document.createElement("div")
    container.id = "pobCNExport"
    document.body.appendChild(container)
})()

createApp(Export).mount('#pobCNExport')
