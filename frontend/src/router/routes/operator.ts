import type { RouteRecordRaw } from 'vue-router'

export const operatorRoutes: RouteRecordRaw[] = [
  {
    path: '/operator',
    redirect: '/operator/dashboard'
  },
  {
    path: '/operator/dashboard',
    name: 'home-operator',
    component: () => import('@/features/operator/views/OperatorDashboardView.vue')
  },
  {
    path: '/operator/users',
    name: 'users-operator',
    component: () => import('@/features/operator/views/OperatorUsersView.vue')
  },
  {
    path: '/operator/reports',
    name: 'reports-operator',
    component: () => import('@/features/operator/views/OperatorReportsView.vue')
  },
  {
    path: '/operator/budgets',
    name: 'budget-operator',
    component: () => import('@/features/operator/views/OperatorBudgetView.vue')
  },
  {
    path: '/operator/proposals',
    name: 'proposals-operator',
    component: () => import('@/features/operator/views/OperatorProposalsView.vue')
  }
]
