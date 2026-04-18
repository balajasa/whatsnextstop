import { createApp } from 'vue'
import { registerSW } from 'virtual:pwa-register'

registerSW({
  onRegisteredSW() {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload()
    })
  }
})
import { createPinia } from 'pinia'
import { createGtag } from 'vue-gtag'
import App from './App.vue'
import router from './router/index'
import { getGaId } from '@/config/ga.config'

import './styles/index.sass'
import '@monster/smeargle/style.css'

const gtag = createGtag({
  tagId: getGaId()
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(gtag)

app.mount('#app')
