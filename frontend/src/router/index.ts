import { createRouter, createWebHistory } from 'vue-router'
import '../assets/main.css'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { 
      path: '/', 
      name: 'proposals-operator', 
      component: () => import('../views/OperatorProposals.vue')
    },
  ],
})

export default router
