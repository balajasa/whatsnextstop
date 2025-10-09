import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createGtag } from 'vue-gtag'
import App from './App.vue'
import router from './router/index'

import './styles/index.sass'
import '@monster/smeargle/style.css'

const gtag = createGtag({
  tagId: import.meta.env.VITE_GA_ID || 'G-CE53S045GX'
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(gtag)

app.mount('#app')
