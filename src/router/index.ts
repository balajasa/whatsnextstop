import { createRouter, createWebHistory } from 'vue-router'
import Home from '../components/Home.vue'
import MainContent from '../components/layout/MainContent.vue'
import FoodWheel from '../components/games/FoodWheel.vue'
import DropBlock from '../components/games/DropBlock.vue'
import Itinerary from '../components/itinerary/Itinerary.vue'
import ItineraryDetail from '../components/itinerary/ItineraryDetail.vue'
import TravelMap from '../components/travel/TravelMap.vue'
import TravelTrace from '../components/travel/TravelTrace.vue'
import MiniGame from '../components/games/MiniGame.vue'

const routes = [
  {
    path: '/',
    component: Home,
    children: [
      {
        path: '',
        redirect: '/home'
      },
      {
        path: 'home',
        name: 'Home',
        component: MainContent,
        meta: {
          title: '首頁',
          showBreadcrumb: false
        }
      },
      {
        path: 'itinerary',
        name: 'Itinerary',
        component: Itinerary,
        meta: {
          title: '行程規劃',
          showBreadcrumb: true,
          breadcrumb: [
            { text: '行程規劃', icon: '🗓️' }
          ]
        }
      },
      {
        path: 'itinerary-detail',
        name: 'ItineraryDetail',
        component: ItineraryDetail,
        meta: {
          title: '詳細行程',
          showBreadcrumb: true,
          breadcrumb: [
            { text: '行程規劃', icon: '🗓️', path: '/itinerary' },
            { text: '詳細行程', icon: '📋' }
          ]
        }
      },
      {
        path: 'travelmap',
        name: 'TravelMap',
        component: TravelMap,
        meta: {
          title: '世界地圖',
          showBreadcrumb: true,
          breadcrumb: [
            { text: '世界地圖', icon: '🗺️' }
          ]
        }
      },
      {
        path: 'travel-trace',
        name: 'TravelTrace',
        component: TravelTrace,
        meta: {
          title: '我的足跡',
          showBreadcrumb: true,
          breadcrumb: [
            { text: '我的足跡', icon: '👣' }
          ]
        }
      },
      {
        path: 'minigame',
        name: 'MiniGame',
        component: MiniGame,
        meta: {
          title: '小遊戲',
          showBreadcrumb: true,
          breadcrumb: [
            { text: '小遊戲', icon: '🎮' }
          ]
        }
      },
      {
        path: 'minigame/foodwheel',
        name: 'FoodWheel',
        component: FoodWheel,
        meta: {
          title: '美食輪盤',
          showBreadcrumb: true,
          breadcrumb: [
            { text: '小遊戲', icon: '🎮', path: '/minigame' },
            { text: '美食輪盤', icon: '🍽️' }
          ]
        }
      },
      {
        path: 'minigame/dropblock',
        name: 'DropBlock',
        component: DropBlock,
        meta: {
          title: '方塊遊戲',
          showBreadcrumb: true,
          breadcrumb: [
            { text: '小遊戲', icon: '🎮', path: '/minigame' },
            { text: '方塊遊戲', icon: '🧊' }
          ]
        }
      }
    ]
  },
  // 所有未匹配的路由都導回首頁
  {
    path: '/:pathMatch(.*)*',
    redirect: '/home'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  // 滾動行為設定
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }

    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
        top: 80
      }
    }

    return { top: 0, behavior: 'smooth' }
  }
})

// 全域路由守衛 - 設定頁面標題
router.beforeEach((to, _from, next) => {
  const title = to.meta?.title || '旅行規劃助手'
  document.title = `${title} | 溫暖旅程`

  next()
})

export default router