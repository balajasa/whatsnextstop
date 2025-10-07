import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'
import MainContent from '../components/layout/MainContent.vue'
import FoodWheel from '../views/games/FoodWheel.vue'
import DropBlock from '../views/games/DropBlock.vue'
import TakeMeTravel from '../views/games/TakeMeTravel.vue'
import Itinerary from '../views/itinerary/Itinerary.vue'
import ItineraryDetail from '../views/itinerary/ItineraryDetail.vue'
import TravelMap from '../views/travel-map/TravelMap.vue'
import TravelGallery from '../views/history-travel/TravelGallery.vue'
import TravelReview from '../views/history-travel/TravelReview.vue'
import FinalResultPage from '../components/cat-photo/FinalResultPage.vue'
import SpotsPage from '../views/spots/SpotsPage.vue'
import TripsPage from '../views/trips/TripsPage.vue'

const routes = [
  {
    path: '/',
    component: Home,
    children: [
      {
        path: '',
        redirect: 'home',
      },
      {
        path: 'home',
        name: 'Home',
        component: MainContent,
        meta: {
          title: '首頁',
          showBreadcrumb: false,
        },
      },
      {
        path: 'itinerary',
        name: 'Itinerary',
        component: Itinerary,
        meta: {
          title: '行程規劃',
          showBreadcrumb: true,
          breadcrumb: [{ text: '行程規劃' }],
        },
      },
      {
        path: 'itinerary-detail',
        name: 'ItineraryDetail',
        component: ItineraryDetail,
        meta: {
          title: '詳細行程',
          showBreadcrumb: true,
          breadcrumb: [
            { text: '行程規劃', path: '/itinerary' },
            { text: '詳細行程' },
          ],
        },
      },
      {
        path: 'travelmap',
        name: 'TravelMap',
        component: TravelMap,
        meta: {
          title: '旅行地圖',
          showBreadcrumb: true,
          breadcrumb: [{ text: '旅行地圖' }],
        },
      },
      {
        path: 'travel-gallery',
        name: 'TravelGallery',
        component: TravelGallery,
        meta: {
          title: '旅遊回憶',
          showBreadcrumb: true,
          breadcrumb: [{ text: '旅遊回憶' }],
        },
      },
      {
        path: 'travel-review',
        name: 'TravelReview',
        component: TravelReview,
        meta: {
          title: '旅程回顧',
          showBreadcrumb: true,
          breadcrumb: [{ text: '旅程回顧' }],
        },
      },
      {
        path: 'dropblock',
        name: 'DropBlock',
        component: DropBlock,
        meta: {
          title: '從天而降',
          showBreadcrumb: true,
          breadcrumb: [{ text: '從天而降' }],
        },
      },
      {
        path: 'foodwheel',
        name: 'FoodWheel',
        component: FoodWheel,
        meta: {
          title: '命運輪盤',
          showBreadcrumb: true,
          breadcrumb: [{ text: '命運輪盤' }],
        },
      },
      {
        path: 'takemetravel',
        name: 'TakeMeTravel',
        component: TakeMeTravel,
        meta: {
          title: '帶我去旅行',
          showBreadcrumb: true,
          breadcrumb: [{ text: '帶我去旅行' }],
        },
      },
      {
        path: 'final',
        component: FinalResultPage,
      },
      {
        path: 'trips',
        name: 'TripsPage',
        component: TripsPage,
        meta: {
          title: '旅程列表',
          showBreadcrumb: true,
          breadcrumb: [{ text: '旅程列表' }],
        },
      },
      {
        path: 'trips/:shortId/spots',
        name: 'TripSpotsPage',
        component: SpotsPage,
        meta: {
          title: '景點探索',
          showBreadcrumb: true,
          breadcrumb: [
            { text: '旅程列表', path: '/trips' },
            { text: '景點探索' },
          ],
        },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/home',
  },
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
        top: 80,
      }
    }

    return { top: 0, behavior: 'smooth' }
  },
})

router.beforeEach((to, _from, next) => {
  const title = to.meta?.title || '暖心的旅程'
  const randomSubtitle = getRandomTitle()
  document.title = `${title} | ${randomSubtitle}`

  next()
})

const randomTitles = [
  '目前位置：沙發上，夢想著下一個目的地',
  '收集回憶中...進度：永遠不夠',
  '本站含有大量旅行毒素，可能引起 wanderlust 症狀',
  '小小的世界地圖，記錄著我去過的地方',
  '旅行夥伴：咖啡、相機、還有我的方向感',
  '世界很大，腳步很小，故事很多',
  '旅の途中',
  '為什麼出發？因為有空',
  '這是我的旅行人生，方向感一條都沒有，但還是走了很遠',
  '這裡是一張沒有盡頭的備忘錄，歡迎加入我亂走人生的現場直播',
]

const getRandomTitle = () => {
  const randomIndex = Math.floor(Math.random() * randomTitles.length)
  return randomTitles[randomIndex]
}

export default router
