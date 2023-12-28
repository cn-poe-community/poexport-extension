import './assets/exporter.css'

import { createApp } from 'vue'
import Monkey from './Monkey.vue'

const container = document.createElement('div')
container.id = 'exportContainer'
document.body.appendChild(container)

createApp(Monkey).mount('#exportContainer')
