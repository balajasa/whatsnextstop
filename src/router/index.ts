import { createRouter, createWebHistory } from 'vue-router'
import Home from '../components/Home.vue'
import FoodWheel from '../components/games/FoodWheel.vue'
import DropBlock from '../components/games/DropBlock.vue'
import Itinerary from '../components/itinerary/Itinerary.vue'
import WorldMap from '../components/footprint/WorldMap.vue'
import Tools from '../components/games/Tools.vue'

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'Home',
    component: Home
  },
  {
    path: '/itinerary',
    name: 'Itinerary',
    component: Itinerary
  },
  {
    path: '/worldmap',
    name: 'WorldMap',
    component: WorldMap
  },
  {
    path: '/tools',
    name: 'Tools',
    component: Tools,
    children: [
      {
        path: 'foodwheel',
        name: 'FoodWheel',
        component: FoodWheel
      },
      {
        path: 'dropblock',
        name: 'DropBlock',
        component: DropBlock
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router