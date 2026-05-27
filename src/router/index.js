import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore.js'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../pages/admin/LoginPage.vue'),
    meta: { public: true },
  },
  {
    path: '/',
    component: () => import('../components/AdminLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '',         redirect: '/dashboard' },
      { path: 'dashboard',    name: 'Dashboard',    component: () => import('../pages/admin/Dashboard.vue') },
      { path: 'Booking',       name: 'Booking',       component: () => import('../pages/admin/OrdersPage.vue') },
      { path: 'calendar',     name: 'Calendar',     component: () => import('../pages/admin/CalendarPage.vue') },
      { path: 'services',     name: 'Services',     component: () => import('../pages/admin/ServicesPage.vue') },
      { path: 'stylists',     name: 'Stylists',     component: () => import('../pages/admin/StylistsPage.vue') },
      { path: 'working-hours',name: 'WorkingHours', component: () => import('../pages/admin/WorkingHoursPage.vue') },
      { path: 'reports',      name: 'Reports',      component: () => import('../pages/admin/ReportsPage.vue') },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return '/login'
  }
  if (to.meta.public && auth.isAuthenticated) {
    return '/dashboard'
  }
})

export default router
