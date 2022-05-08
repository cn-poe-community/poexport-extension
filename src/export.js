import { createApp } from 'vue'
import ExportTab from './ExportTab.vue'

const containerId = "exporterOfExileCN"


chrome.storage.local.get({ bdExportEnabled: true }, (res) => {
    if (res.bdExportEnabled) {
        let container = document.createElement("div")
        container.id = containerId
        document.body.appendChild(container)
        createApp(ExportTab).mount(`#${containerId}`)
    }
})
