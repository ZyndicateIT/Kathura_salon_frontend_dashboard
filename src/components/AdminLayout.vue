<template>
  <div class="admin-theme flex min-h-screen bg-salon-dark">
    <Sidebar :collapsed="sidebarCollapsed" />
    <div :class="['flex-1 flex flex-col transition-all duration-300', sidebarCollapsed ? 'ml-16' : 'ml-64']">
      <Topbar :title="pageTitle" @toggle-sidebar="sidebarCollapsed = !sidebarCollapsed" />
      <main class="flex-1 overflow-y-auto p-6 text-white">
        <div class="mx-auto max-w-7xl">
          <RouterView />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from './Sidebar.vue'
import Topbar from './Topbar.vue'

const sidebarCollapsed = ref(false)
const route = useRoute()

const titles = {
  '/dashboard':     'Dashboard',
  '/Booking':        'Booking Management',
  '/calendar':      'Calendar & Schedule',
  '/services':      'Services Management',
  '/stylists':      'Stylists Management',
  '/working-hours': 'Working Hours',
  '/reports':       'Reports & Analytics',
}
const pageTitle = computed(() => titles[route.path] || 'Admin Panel')
</script>
