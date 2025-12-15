import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import RoleSelectView from '@/views/RoleSelectView.vue'
import CitizenDashboardView from '@/views/CitizenDashboardView.vue'
import OperatorDashboardView from '@/views/OperatorDashboardView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'login', component: LoginView },
    { path: '/role-select', name: 'role-select', component: RoleSelectView },
    { path: '/citizen/dashboard', name: 'citizen-dashboard', component: CitizenDashboardView },
    { path: '/operator/dashboard', name: 'operator-dashboard', component: OperatorDashboardView },
  ],
})

export default router
