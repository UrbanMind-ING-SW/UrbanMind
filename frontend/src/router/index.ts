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
    // Se vuoi che la pagina iniziale sia una delle due, puoi aggiungere un redirect:
    {
      path: '/',
      redirect: '/users'
    }
  ],
})

export default router
