import { createRouter, createWebHistory } from 'vue-router'
import Home from '../components/Home.vue'
import FoodWheel from '../components/FoodWheel.vue'
import DropBlock from '../components/DropBlock.vue'
import Itinerary from '../components/Itinerary.vue'

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
    path: '/foodwheel',
    name: 'FoodWheel',
    component: FoodWheel
  },
  {
    path: '/itinerary',
    name: 'Itinerary',
    component: Itinerary
  },
  {
    path: '/dropblock',
    name: 'DropBlock',
    component: DropBlock
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router