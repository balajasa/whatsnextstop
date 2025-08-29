import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router/index'

import './styles/index.sass'
import '@monster/smeargle/style.css'

createApp(App).use(createPinia()).use(router).mount('#app')