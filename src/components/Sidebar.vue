<template>
  <aside
    :class="[
      'fixed left-0 top-0 h-full bg-salon-dark text-white flex flex-col transition-all duration-300 z-40',
      collapsed ? 'w-16' : 'w-64',
    ]"
  >
    <!-- Logo -->
    <div class="flex items-center gap-3 px-4 py-5 border-b border-white/10">
      <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-white p-0.5">
        <img src="/admin-logo.webp" alt="Salon Kathura logo" class="h-full w-full object-contain" />
      </div>
      <div v-if="!collapsed" class="overflow-hidden">
        <h1 class="font-serif text-base font-bold text-white leading-tight">Salon Kathura</h1>
        <p class="text-[10px] text-gold-300 uppercase tracking-widest">Admin Panel</p>
      </div>
    </div>

    <!-- Nav -->
    <nav class="flex-1 py-4 overflow-y-auto">
      <div v-for="item in navItems" :key="item.route">
        <RouterLink
          :to="item.route"
          :class="[
            'flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg transition-all text-sm font-medium',
            isActive(item.route)
              ? 'bg-salon-gold text-white'
              : 'text-white/80 hover:bg-white/10 hover:text-white',
          ]"
        >
          <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
          <span v-if="!collapsed" class="truncate">{{ item.label }}</span>
        </RouterLink>
      </div>
    </nav>

    <!-- Footer -->
    <div class="border-t border-white/10 p-4">
      <button
        :class="[
          'flex items-center gap-3 w-full px-2 py-2 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-all text-sm',
          collapsed ? 'justify-center' : '',
        ]"
        @click="handleLogout"
      >
        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        <span v-if="!collapsed">Logout</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore.js'

defineProps({ collapsed: { type: Boolean, default: false } })

const route  = useRoute()
const router = useRouter()
const auth   = useAuthStore()

const isActive = (path) => route.path === path || route.path.startsWith(path + '/')

const handleLogout = () => {
  auth.logout()
  router.push('/login')
}

// SVG icon components inline
const IconDashboard = { render: () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' })]) }
const IconBooking    = { render: () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' })]) }
const IconCalendar  = { render: () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' })]) }
const IconScissors  = { render: () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z' })]) }
const IconPeople    = { render: () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' })]) }
const IconClock     = { render: () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' })]) }
const IconChart     = { render: () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' })]) }

const navItems = [
  { route: '/dashboard',     label: 'Dashboard',      icon: IconDashboard },
  { route: '/Booking',        label: 'Booking',         icon: IconBooking },
  { route: '/calendar',      label: 'Calendar',       icon: IconCalendar },
  { route: '/services',      label: 'Services',       icon: IconScissors },
  { route: '/stylists',      label: 'Stylists',       icon: IconPeople },
  { route: '/working-hours', label: 'Working Hours',  icon: IconClock },
  { route: '/reports',       label: 'Reports',        icon: IconChart },
]
</script>
