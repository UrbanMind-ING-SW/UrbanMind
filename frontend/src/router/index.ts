import { createRouter, createWebHistory } from 'vue-router'
import '../assets/main.css'
import BudgetView from '../views/BudgetView.vue'
import NewReportView from '../views/NewReportView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'homepage-users',
      component: () => import('../views/CitizenDashboardView.vue')
    },
    {
      path: '/budget',
      name: 'budget',
      component: BudgetView
    },
    {
      path: '/proposals',
      name: 'proposals',
      component: () => import('../views/ProposalsView.vue')
    },
    {
      path: '/proposals/new',
      name: 'proposal-new',
      component: () => import('../views/NewProposalView.vue')
    },
    { 
      path: '/reports/new', 
      name: 'new-report', 
      component: NewReportView 
    },
  ],
})

export default router
