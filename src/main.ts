import './styles/index.sass'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './firebase'
import router from './router/index'

createApp(App).use(createPinia()).use(router).mount('#app')
