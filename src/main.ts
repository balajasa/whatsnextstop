import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createGtag } from 'vue-gtag'
import App from './App.vue'
import router from './router/index'
import { getGaId } from '@/config/ga.config'

// 字型（@fontsource 會依 unicode-range 切片，只下載頁面用到的字）
import '@fontsource/noto-sans-tc/400.css'
import '@fontsource/noto-sans-tc/500.css'
import '@fontsource/noto-sans-tc/700.css'
import '@fontsource/lxgw-wenkai-tc/700.css'

// smeargle 的樣式先載入，讓專案自己的全域樣式可以覆蓋它
import '@monster/smeargle/style.css'
import './styles/index.sass'

const gtag = createGtag({
  tagId: getGaId()
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(gtag)

app.mount('#app')
