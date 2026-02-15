import { createRouter, createWebHistory } from 'vue-router'
import '../assets/main.css'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { 
      path: '/', 
      name: 'budget-operator', 
      component: () => import('../views/OperatorBudget.vue')
    },
  ],
})

export default router