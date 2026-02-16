import { createRouter, createWebHistory } from 'vue-router'
import '../assets/main.css'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/users',
      name: 'users-operator',
      component: () => import('../views/OperatorUsers.vue')
    },
    {
      path: '/reports',
      name: 'reports-operator',
      component: () => import('../views/OperatorReports.vue')
    },
    {
      path: '/budgets',
      name: 'budget-operator',
      component: () => import('../views/OperatorBudget.vue')
    },
    {
      path: '/proposals',
      name: 'proposals-operator',
      component: () => import('../views/OperatorProposals.vue')
    },
    // Redirect alla pagina degli utenti come home di default
    {
      path: '/',
      redirect: '/users'
    },
  ],
})

export default router
