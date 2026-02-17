import { createRouter, createWebHistory } from 'vue-router'
import { publicRoutes } from './routes/public'
import { citizenRoutes } from './routes/citizen'
import { operatorRoutes } from './routes/operator'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...publicRoutes,
    ...citizenRoutes,
    ...operatorRoutes,
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
})

export default router
