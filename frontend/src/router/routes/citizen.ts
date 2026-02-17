import type { RouteRecordRaw } from 'vue-router'

export const citizenRoutes: RouteRecordRaw[] = [
  {
    path: '/citizen',
    redirect: '/citizen/dashboard'
  },
  {
    path: '/citizen/dashboard',
    name: 'citizen-dashboard',
    component: () => import('@/features/citizen/views/CitizenDashboardView.vue')
  },
  {
    path: '/citizen/budget',
    name: 'budget',
    component: () => import('@/features/citizen/views/BudgetView.vue')
  },
  {
    path: '/citizen/proposals',
    name: 'proposals',
    component: () => import('@/features/citizen/views/ProposalsView.vue')
  },
  {
    path: '/citizen/proposals/new',
    name: 'proposal-new',
    component: () => import('@/features/citizen/views/NewProposalView.vue')
  },
  {
    path: '/citizen/reports/new',
    name: 'new-report',
    component: () => import('@/features/citizen/views/NewReportView.vue')
  }
]
