import { createRouter, createWebHistory } from 'vue-router'
import '../assets/main.css'
import BudgetView from '../views/BudgetView.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { 
      path: '/', 
      name: 'homepage-users', 
      component: () => import('../views/CitizenDashboardView.vue')
    },
    { path: '/', name: 'budget', component: BudgetView },
 ],
})

export default router
