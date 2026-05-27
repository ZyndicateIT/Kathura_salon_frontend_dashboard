<template>
  <div class="space-y-6">

    <!-- Quick Filters -->
    <div class="inline-flex max-w-full flex-wrap gap-2 rounded-2xl border border-white/10 bg-black/35 p-2">
      <button
        v-for="f in filters"
        :key="f.value"
        :class="[
          'inline-flex min-h-[44px] min-w-[104px] items-center justify-center rounded-xl border px-4 py-2 text-sm font-semibold transition-all duration-200',
          activeFilter === f.value
            ? 'border-salon-gold bg-salon-gold text-white shadow-[0_10px_25px_rgba(214,145,47,0.28)]'
            : 'border-white/10 bg-salon-card text-white/85 hover:border-gold-400 hover:text-white',
        ]"
        @click="setFilter(f.value)"
      >{{ f.label }}</button>
    </div>

      <!-- Stats Cards (filtered) -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="stat in stats" :key="stat.label" class="card p-5">
        <div class="flex items-center gap-3">
          <div :class="['w-10 h-10 rounded-xl flex items-center justify-center', stat.bg]">
            <component :is="stat.icon" :class="['w-5 h-5', stat.color]" />
          </div>
          <div>
            <p class="text-xs text-beige-400 font-medium">{{ stat.label }}</p>
            <p class="text-2xl font-bold text-salon-dark">{{ loading ? '—' : stat.value }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Recent Bookings Table -->
      <div class="card lg:col-span-2">
        <div class="flex items-center justify-between px-5 py-4 border-b border-beige-100">
          <h3 class="font-serif font-semibold text-salon-dark">
            {{ activeFilter === 'all' ? 'All Bookings' : 'Recent Bookings' }}
          </h3>
          <RouterLink to="/Booking" class="text-sm text-salon-gold hover:text-gold-600 font-medium">View All →</RouterLink>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-beige-50">
              <tr>
                <th class="text-left px-5 py-3 text-xs font-semibold text-beige-400 uppercase tracking-wide">Customer</th>
                <th class="text-left px-5 py-3 text-xs font-semibold text-beige-400 uppercase tracking-wide">Service</th>
                <th class="text-left px-5 py-3 text-xs font-semibold text-beige-400 uppercase tracking-wide">Date</th>
                <th class="text-left px-5 py-3 text-xs font-semibold text-beige-400 uppercase tracking-wide">Status</th>
                <th class="text-right px-5 py-3 text-xs font-semibold text-beige-400 uppercase tracking-wide">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading"><td colspan="5" class="text-center py-8 text-beige-400">Loading...</td></tr>
              <tr v-else-if="!recent.length"><td colspan="5" class="text-center py-8 text-beige-400">No bookings found</td></tr>
              <tr
                v-for="b in recent"
                :key="b.id"
                class="border-t border-beige-50 hover:bg-beige-50 transition-colors"
              >
                <td class="px-5 py-3 font-medium text-salon-dark">{{ b.customerName }}</td>
                <td class="px-5 py-3 text-beige-400 text-xs">{{ b.services?.map(s => s.service?.name).join(', ') }}</td>
                <td class="px-5 py-3 text-beige-400">{{ formatDate(b.appointmentDate) }}</td>
                <td class="px-5 py-3"><StatusBadge :status="b.status" /></td>
                <td class="px-5 py-3 text-right font-semibold text-salon-dark">Rs. {{ Number(b.totalPrice).toLocaleString() }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Status Breakdown -->
      <div class="card">
        <div class="px-5 py-4 border-b border-beige-100">
          <h3 class="font-serif font-semibold text-salon-dark">Booking Status</h3>
          <p class="text-xs text-beige-400 mt-0.5 capitalize">{{ activeFilter === 'all' ? 'All time' : activeFilter }}</p>
        </div>
        <div class="p-5 space-y-3">
          <div v-for="item in statusBreakdown" :key="item.label" class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span :class="['w-2.5 h-2.5 rounded-full', item.dot]" />
              <span class="text-sm text-salon-charcoal">{{ item.label }}</span>
            </div>
            <span class="text-sm font-semibold text-salon-dark">{{ item.count }}</span>
          </div>
          <div class="pt-3 border-t border-beige-100 flex items-center justify-between">
            <span class="text-sm font-medium text-salon-charcoal">Total</span>
            <span class="text-sm font-bold text-salon-gold">{{ totalCount }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ── LIVE TIMER WIDGET ── -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

      <!-- Currently Running -->
      <div
        v-for="appt in runningNow"
        :key="'run-' + appt.id"
        class="card relative overflow-hidden border-l-4 border-green-500 p-4"
      >
        <div class="absolute top-2 right-3 flex items-center gap-1">
          <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span class="text-[10px] font-semibold text-green-600 uppercase tracking-wide">Live</span>
        </div>
        <p class="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">In Session Now</p>
        <p class="font-semibold text-salon-dark text-sm">{{ appt.customerName }}</p>
        <p class="text-xs text-beige-400 truncate">{{ appt.services?.map(s => s.service?.name).join(', ') }}</p>
        <p class="text-xs text-white/70 mt-1">Stylist: <strong class="text-white">{{ getStylistLabel(appt) }}</strong></p>
        <p class="text-xs text-salon-charcoal mt-1">Started: <strong>{{ appt.appointmentTime }}</strong> · Ends: <strong>{{ appt.endsAt }}</strong></p>

        <!-- Countdown ring -->
        <div class="mt-3 flex items-center gap-3">
          <div class="relative w-14 h-14 flex-shrink-0">
            <svg class="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(255, 255, 255, 0.2)" stroke-width="5"/>
              <circle
                cx="28" cy="28" r="24" fill="none"
                stroke="#22c55e" stroke-width="5"
                stroke-linecap="round"
                :stroke-dasharray="`${2 * Math.PI * 24}`"
                :stroke-dashoffset="`${2 * Math.PI * 24 * (1 - appt.progress)}`"
                style="transition: stroke-dashoffset 1s linear"
              />
            </svg>
            <span class="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-green-700">
              {{ Math.round(appt.progress * 100) }}%
            </span>
          </div>
          <div>
            <p class="text-2xl font-bold text-green-700 font-mono leading-none">{{ appt.timeLeft }}</p>
            <p class="text-xs text-green-600">remaining</p>
          </div>
        </div>
      </div>

      <!-- Next Upcoming today -->
      <div
        v-if="nextUpcoming"
        class="card border-l-4 border-white/40 p-4"
      >
        <p class="text-xs font-semibold text-salon-gold uppercase tracking-wide mb-1">Up Next Today</p>
        <p class="font-semibold text-salon-dark text-sm">{{ nextUpcoming.customerName }}</p>
        <p class="text-xs text-beige-400 truncate">{{ nextUpcoming.services?.map(s => s.service?.name).join(', ') }}</p>
        <p class="text-xs text-white/70 mt-1">Stylist: <strong class="text-white">{{ getStylistLabel(nextUpcoming) }}</strong></p>
        <p class="text-xs text-salon-charcoal mt-1">At <strong>{{ nextUpcoming.appointmentTime }}</strong></p>
        <div class="mt-3 flex items-center gap-3">
          <div class="relative w-14 h-14 flex-shrink-0">
            <svg class="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(255, 255, 255, 0.2)" stroke-width="5"/>
              <circle
                cx="28" cy="28" r="24" fill="none"
                stroke="#d6912f" stroke-width="5"
                stroke-linecap="round"
                :stroke-dasharray="`${2 * Math.PI * 24}`"
                :stroke-dashoffset="`${2 * Math.PI * 24 * nextUpcoming.countdownFraction}`"
                style="transition: stroke-dashoffset 1s linear"
              />
            </svg>
            <span class="absolute inset-0 flex items-center justify-center">
              <svg class="w-5 h-5 text-salon-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </span>
          </div>
          <div>
            <p class="text-2xl font-bold text-salon-gold font-mono leading-none">{{ nextUpcoming.countdownLabel }}</p>
            <p class="text-xs text-gold-600">until start</p>
          </div>
        </div>
      </div>

      <!-- No activity -->
      <div
        v-if="!runningNow.length && !nextUpcoming"
        class="card border-l-4 border-beige-300 p-4"
      >
        <p class="text-xs font-semibold text-beige-400 uppercase tracking-wide mb-1">Live Sessions</p>
        <p class="text-sm text-beige-400 mt-2">No active or upcoming appointments for today.</p>
      </div>

      <!-- Today's quick summary pill -->
      <div class="card p-4 flex flex-col justify-between">
        <p class="text-xs font-semibold text-beige-400 uppercase tracking-wide mb-3">Today at a Glance</p>
        <div class="space-y-2">
          <div class="flex justify-between items-center text-sm">
            <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-yellow-400"/><span class="text-salon-charcoal">Pending</span></span>
            <span class="font-bold text-salon-dark">{{ todayStats.pending }}</span>
          </div>
          <div class="flex justify-between items-center text-sm">
            <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-green-500"/><span class="text-salon-charcoal">Accepted</span></span>
            <span class="font-bold text-salon-dark">{{ todayStats.accepted }}</span>
          </div>
          <div class="flex justify-between items-center text-sm">
            <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-blue-500"/><span class="text-salon-charcoal">Completed</span></span>
            <span class="font-bold text-salon-dark">{{ todayStats.completed }}</span>
          </div>
          <div class="flex justify-between items-center text-sm">
            <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-red-500"/><span class="text-salon-charcoal">Cancelled</span></span>
            <span class="font-bold text-salon-dark">{{ todayStats.cancelled }}</span>
          </div>
        </div>
        <div class="mt-3 pt-3 border-t border-beige-100 flex justify-between">
          <span class="text-xs text-beige-400">Total Today</span>
          <span class="text-sm font-bold text-salon-gold">{{ todayStats.total }}</span>
        </div>
      </div>
    </div>
    <!-- ── END LIVE TIMER ── -->
  </div>
</template>

<script setup>
import { computed, h, onMounted, onUnmounted, ref } from 'vue'
import StatusBadge from '../../components/ui/StatusBadge.vue'
import api from '../../services/api.js'
import { formatDateOnly, formatLocalDateInput } from '../../utils/date.js'

// ─── Filters ────────────────────────────────────────────────
const activeFilter = ref('today')
const loading      = ref(false)
const statsData    = ref({ pending: 0, accepted: 0, completed: 0, cancelled: 0, total: 0 })
const todayStats   = ref({ pending: 0, accepted: 0, completed: 0, cancelled: 0, total: 0 })
const recent       = ref([])

const filters = [
  { label: 'Today',      value: 'today'    },
  { label: 'Tomorrow',   value: 'tomorrow' },
  { label: 'This Week',  value: 'week'     },
  { label: 'Next Week',  value: 'nextWeek' },
  { label: 'This Month', value: 'month'    },
  { label: 'All Booking', value: 'all'      },
]

// ─── Icons ──────────────────────────────────────────────────
const PendingIcon   = { render: () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' })]) }
const AcceptedIcon  = { render: () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' })]) }
const CompletedIcon = { render: () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M5 13l4 4L19 7' })]) }
const CancelledIcon = { render: () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z' })]) }

const stats = computed(() => [
  { label: 'Pending',   value: statsData.value.pending,   icon: PendingIcon,   color: 'text-yellow-600', bg: 'bg-yellow-100' },
  { label: 'Accepted',  value: statsData.value.accepted,  icon: AcceptedIcon,  color: 'text-green-600',  bg: 'bg-green-100' },
  { label: 'Completed', value: statsData.value.completed, icon: CompletedIcon, color: 'text-blue-600',   bg: 'bg-blue-100' },
  { label: 'Cancelled', value: statsData.value.cancelled, icon: CancelledIcon, color: 'text-red-600',    bg: 'bg-red-100' },
])

const statusBreakdown = computed(() => [
  { label: 'Pending',   count: statsData.value.pending,   dot: 'bg-yellow-500' },
  { label: 'Accepted',  count: statsData.value.accepted,  dot: 'bg-green-500' },
  { label: 'Completed', count: statsData.value.completed, dot: 'bg-blue-500' },
  { label: 'Cancelled', count: statsData.value.cancelled, dot: 'bg-red-500' },
])

const totalCount = computed(() => statsData.value.total || 0)
const formatDate = (d) => formatDateOnly(d, { day: '2-digit', month: 'short' })
const getStylistLabel = (booking) => booking?.stylist?.name || 'Not assigned'

// ─── Fetch filtered data ─────────────────────────────────────
const fetchData = async () => {
  loading.value = true
  try {
    const filter = activeFilter.value === 'all' ? '' : `?dateFilter=${activeFilter.value}`
    const { data } = await api.get(`/appointments/dashboard${filter}`)
    statsData.value = data.data.stats
    recent.value    = data.data.recent
  } catch { /* ignore */ } finally {
    loading.value = false
  }
}

// Always fetch today stats separately for the live widget glance card
const fetchTodayStats = async () => {
  try {
    const { data } = await api.get('/appointments/dashboard?dateFilter=today')
    todayStats.value = data.data.stats
  } catch { /* ignore */ }
}

const setFilter = (v) => { activeFilter.value = v; fetchData() }

// ─── LIVE TIMER ──────────────────────────────────────────────
const now          = ref(new Date())
const todayBookings = ref([])
let timerInterval  = null
let refreshInterval = null

// Fetch today's accepted+pending bookings for the live timer
const fetchTodayBookings = async () => {
  try {
    const todayStr = formatLocalDateInput(new Date())
    const { data } = await api.get(`/appointments?date=${todayStr}`)
    todayBookings.value = (data.data || []).filter(b => ['PENDING', 'ACCEPTED'].includes(b.status))
  } catch { /* ignore */ }
}

// Parse "HH:MM" into today's Date object
const parseTime = (timeStr, baseDate) => {
  const [h, m] = timeStr.split(':').map(Number)
  const d = new Date(baseDate || now.value)
  d.setHours(h, m, 0, 0)
  return d
}

const pad = (n) => String(n).padStart(2, '0')
const formatCountdown = (ms) => {
  if (ms <= 0) return '0:00'
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`
}

// Appointments currently in session
const runningNow = computed(() => {
  const current = now.value
  return todayBookings.value
    .filter(b => {
      const start    = parseTime(b.appointmentTime)
      const end      = new Date(start.getTime() + b.totalDuration * 60 * 1000)
      return current >= start && current < end
    })
    .map(b => {
      const start    = parseTime(b.appointmentTime)
      const end      = new Date(start.getTime() + b.totalDuration * 60 * 1000)
      const elapsed  = current - start
      const total    = end - start
      const remaining= end - current
      const progress = Math.min(elapsed / total, 1)
      const endsAt   = `${pad(end.getHours())}:${pad(end.getMinutes())}`
      return { ...b, endsAt, progress, timeLeft: formatCountdown(remaining) }
    })
})

// Next upcoming appointment today (not yet started)
const nextUpcoming = computed(() => {
  const current = now.value
  const future = todayBookings.value
    .filter(b => {
      const start = parseTime(b.appointmentTime)
      return current < start
    })
    .sort((a, b) => parseTime(a.appointmentTime) - parseTime(b.appointmentTime))

  if (!future.length) return null

  const appt  = future[0]
  const start = parseTime(appt.appointmentTime)
  const msLeft = start - current

  // countdownFraction: 1 = full circle (far away), 0 = empty (about to start)
  // We use 2 hours as "full" window
  const windowMs = 2 * 60 * 60 * 1000
  const fraction = Math.max(0, Math.min(1, msLeft / windowMs))

  return { ...appt, countdownLabel: formatCountdown(msLeft), countdownFraction: fraction }
})

// ─── Lifecycle ───────────────────────────────────────────────
onMounted(async () => {
  await Promise.all([fetchData(), fetchTodayBookings(), fetchTodayStats()])

  // Tick every second for the live timer
  timerInterval  = setInterval(() => { now.value = new Date() }, 1000)
  // Refresh booking data every 60 seconds
  refreshInterval = setInterval(() => { fetchTodayBookings(); fetchTodayStats() }, 60000)
})

onUnmounted(() => {
  clearInterval(timerInterval)
  clearInterval(refreshInterval)
})
</script>
