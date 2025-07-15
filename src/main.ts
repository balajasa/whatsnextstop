import './styles/index.sass'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router/index'
import { createHead } from '@unhead/vue/client'

const head = createHead();

createApp(App)
  .use(createPinia())
  .use(router)
  .use(head)
  .mount('#app')


head.push({
  title: '我的網站',
  meta: [
    { name: 'description', content: '旅行，在路上，是動詞' }, // SEO 每一站，是旅程中的一頁
    { property: 'og:title', content: '旅行，在路上，是動詞' },
    { property: 'og:description', content: '旅行從不是打卡拍照那麼簡單。這裡收藏那些「風景之後」才懂的故事：走過的路，計劃的方向，還有還沒說出口的嚮往。' },
    // { property: 'og:image', content: 'https://your-domain.com/images/og-image.jpg' }, // 尺寸：1200x630px（最佳比例 1.91:1）> 1MB
    // { property: 'og:url', content: 'https://your-domain.com' },
    { property: 'og:type', content: 'website' },
    // { name: 'twitter:card', content: 'summary_large_image' }
  ]
})