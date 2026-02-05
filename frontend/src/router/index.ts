import { createRouter, createWebHistory } from 'vue-router'
import '../assets/main.css'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { 
      path: '/', 
      name: 'homepage-users', 
      component: () => import('../views/CitizenDashboardView.vue')
    },
  ],
})

export default router
