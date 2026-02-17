import type { RouteRecordRaw } from 'vue-router'

export const publicRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'login',
    component: () => import('@/features/auth/views/LoginView.vue')
  },
  {
    path: '/role-select',
    name: 'role-select',
    component: () => import('@/features/auth/views/RoleSelectView.vue')
  }
]
