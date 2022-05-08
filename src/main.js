import { createApp } from 'vue'
import Index from './Index.vue'
import { VuesticPlugin } from 'vuestic-ui'
import 'vuestic-ui/dist/vuestic-ui.css'

createApp(Index).use(VuesticPlugin).mount('#app')
