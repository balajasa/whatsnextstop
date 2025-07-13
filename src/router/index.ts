import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'
import MainContent from '../components/layout/MainContent.vue'
import FoodWheel from '../views/games/FoodWheel.vue'
import DropBlock from '../views/games/DropBlock.vue'
import TakeMeTravel from '../views/games/TakeMeTravel.vue'
import CheckList from '../views/itinerary/CheckList.vue'
import Itinerary from '../views/itinerary/Itinerary.vue'
import ItineraryDetail from '../views/itinerary/ItineraryDetail.vue'
import TravelMap from '../views/travel/TravelMap.vue'
import TravelTrace from '../views/travel/TravelTrace.vue'

const routes = [
  {
    path: '/',
    component: Home,
    children: [
      {
        path: '',
        redirect: 'home'
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
          breadcrumb: [{ text: '行程規劃', icon: '🗓️' }]
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
        path: 'checklist',
        name: 'CheckList',
        component: CheckList,
        meta: {
          title: '攜帶清單',
          showBreadcrumb: true,
          breadcrumb: [{ text: '攜帶清單', icon: '📝' }]
        }
      },
      {
        path: 'travelmap',
        name: 'TravelMap',
        component: TravelMap,
        meta: {
          title: '旅行地圖',
          showBreadcrumb: true,
          breadcrumb: [{ text: '旅行地圖', icon: '🗺️' }]
        }
      },
      {
        path: 'travel-trace',
        name: 'TravelTrace',
        component: TravelTrace,
        meta: {
          title: '我的足跡',
          showBreadcrumb: true,
          breadcrumb: [{ text: '我的足跡', icon: '👣' }]
        }
      },
      {
        path: 'dropblock',
        name: 'DropBlock',
        component: DropBlock,
        meta: {
          title: '從天而降',
          showBreadcrumb: true,
          breadcrumb: [{ text: '從天而降', icon: '🧊' }]
        }
      },
      {
        path: 'foodwheel',
        name: 'FoodWheel',
        component: FoodWheel,
        meta: {
          title: '濟州島輪盤',
          showBreadcrumb: true,
          breadcrumb: [{ text: '濟州島輪盤', icon: '🍽️' }]
        }
      },
      {
        path: 'takemetravel',
        name: 'TakeMeTravel',
        component: TakeMeTravel,
        meta: {
          title: '帶我去旅行',
          showBreadcrumb: true,
          breadcrumb: [{ text: '帶我去旅行', icon: '📸' }]
        }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/home'
  }
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
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
  const title = to.meta?.title || '溫暖旅程'
  const randomSubtitle = getRandomTitle()
  document.title = `${title} | ${randomSubtitle}`

  next()
})

// 隨機文案陣列
const randomTitles = [
  '目前位置：沙發上，夢想著下一個目的地',
  '收集回憶中...進度：永遠不夠',
  '本站含有大量旅行毒素，可能引起 wanderlust 症狀',
  '小小的世界地圖，記錄著我去過的地方',
  '旅行夥伴：咖啡、相機、還有我的方向感',
  '世界很大，腳步很小，故事很多',
  '旅の途中'
]

// 取得隨機文案的函數
const getRandomTitle = () => {
  const randomIndex = Math.floor(Math.random() * randomTitles.length)
  return randomTitles[randomIndex]
}

export default router
