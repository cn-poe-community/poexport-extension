import { createApp } from 'vue'
import Export from './Export.vue'

chrome.storage.local.get({ bdExportEnabled: true }, (res) => {
    if (res.bdExportEnabled) {
        let container = document.createElement("div")
        container.id = "pobCNExport"
        document.body.appendChild(container)
        createApp(Export).mount('#pobCNExport')
    }
})
