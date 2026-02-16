import { createRouter, createWebHistory } from 'vue-router'
import '../assets/main.css'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { 
      path: '/', 
      name: 'users-operator', 
      component: () => import('../views/OperatorUsers.vue')
    },
  ],
})

export default router