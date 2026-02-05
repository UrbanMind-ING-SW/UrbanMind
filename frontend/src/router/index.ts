import { createRouter, createWebHistory } from 'vue-router'
import '../assets/main.css'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { 
      path: '/', 
      name: 'reports-operator', 
      component: () => import('../views/OperatorReports.vue')
    },
  ],
})

export default router