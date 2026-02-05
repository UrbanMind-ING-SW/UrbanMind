import { createRouter, createWebHistory } from 'vue-router'
import '../assets/main.css'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { 
      path: '/', 
      name: 'homepage-operetor', 
      component: () => import('../views/operatorHomepage.vue')
    },
  ],
})

export default router