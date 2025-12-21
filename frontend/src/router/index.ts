import { createRouter, createWebHistory } from 'vue-router'
import '../assets/main.css'
import LoginView from '@/views/LoginView.vue'
import RoleSelectView from '@/views/RoleSelectView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'login', component: LoginView },
    { path: '/role-select', name: 'role-select', component: RoleSelectView },
  ],
})

export default router
