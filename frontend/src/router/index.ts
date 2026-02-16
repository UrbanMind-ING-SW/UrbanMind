import { createRouter, createWebHistory } from 'vue-router'
import '../assets/main.css'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {     
      path: '/home',
      name: 'home-operator',
      component: () => import('../views/OperatorHomepage.vue')
    },
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
    { 
      path: '/',
      redirect: '/home'
    } 
  ], // Chiusura corretta dell'array routes
})

export default router
