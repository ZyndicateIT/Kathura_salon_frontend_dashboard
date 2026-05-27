<template>
  <div class="space-y-4">
    <!-- View toggle + navigation -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div class="flex gap-1 bg-white rounded-xl p-1 border border-beige-200">
        <button v-for="v in views" :key="v.value"
          :class="['px-3 py-1.5 rounded-lg text-sm font-medium transition-colors', viewMode === v.value ? 'bg-salon-gold text-white' : 'text-beige-400 hover:text-salon-dark']"
          @click="viewMode = v.value">{{ v.label }}</button>
      </div>
      <div class="flex items-center gap-2">
        <button class="p-2 rounded-lg border border-beige-200 hover:bg-beige-50" @click="prevPeriod">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <span class="text-sm font-semibold text-salon-dark min-w-[140px] text-center">{{ periodLabel }}</span>
        <button class="p-2 rounded-lg border border-beige-200 hover:bg-beige-50" @click="nextPeriod">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
        </button>
        <button class="rounded-lg border border-white/10 bg-salon-dark px-3 py-1.5 text-sm text-white" @click="goToday">Today</button>
      </div>
    </div>

    <!-- Legend -->
    <div class="flex flex-wrap gap-3">
      <span v-for="l in legend" :key="l.label" class="flex items-center gap-1.5 text-xs text-salon-charcoal">
        <span :class="['w-2.5 h-2.5 rounded-full', l.dot]" />{{ l.label }}
      </span>
    </div>

    <!-- Monthly View -->
    <div v-if="viewMode === 'month'" class="card overflow-hidden">
      <!-- Day headers -->
      <div class="grid grid-cols-7 bg-beige-50 border-b border-beige-200">
        <div v-for="d in dayHeaders" :key="d" class="py-2 text-center text-xs font-semibold text-beige-400 uppercase">{{ d }}</div>
      </div>
      <!-- Day cells -->
      <div class="grid grid-cols-7">
        <div
          v-for="cell in monthCells"
          :key="cell.key"
          :class="['min-h-[90px] p-1.5 border-r border-b border-beige-100 last:border-r-0', !cell.currentMonth ? 'bg-beige-50' : 'bg-white hover:bg-beige-50', cell.isToday ? 'ring-1 ring-inset ring-salon-gold' : '']"
        >
          <div :class="['text-xs font-medium mb-1 w-5 h-5 flex items-center justify-center rounded-full', cell.isToday ? 'bg-salon-gold text-white' : 'text-beige-400']">
            {{ cell.day }}
          </div>
          <div class="space-y-0.5">
            <div
              v-for="b in cell.bookings.slice(0, 3)"
              :key="b.id"
              :class="['text-[10px] px-1 py-0.5 rounded truncate cursor-pointer', statusBg(b.status)]"
              @click="openDetail(b)"
            >{{ b.appointmentTime }} {{ b.customerName }}</div>
            <div v-if="cell.bookings.length > 3" class="text-[10px] text-beige-400">+{{ cell.bookings.length - 3 }} more</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Weekly View -->
    <div v-else-if="viewMode === 'week'" class="card overflow-hidden">
      <div class="grid grid-cols-7 bg-beige-50 border-b border-beige-200">
        <div v-for="d in weekDays" :key="d.key"
          :class="['py-3 text-center border-r border-beige-200 last:border-0', d.isToday ? 'bg-gold-50' : '']">
          <p class="text-xs text-beige-400 uppercase">{{ d.dayName }}</p>
          <p :class="['text-sm font-semibold mt-0.5', d.isToday ? 'text-salon-gold' : 'text-salon-dark']">{{ d.date }}</p>
        </div>
      </div>
      <div class="grid grid-cols-7 min-h-[400px]">
        <div v-for="d in weekDays" :key="d.key + 'b'" class="p-2 border-r border-beige-100 last:border-0 space-y-1">
          <div
            v-for="b in d.bookings"
            :key="b.id"
            :class="['text-xs p-1.5 rounded-lg cursor-pointer', statusBg(b.status)]"
            @click="openDetail(b)"
          >
            <p class="font-semibold">{{ b.appointmentTime }}</p>
            <p class="truncate">{{ b.customerName }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Daily View -->
    <div v-else class="card overflow-hidden">
      <div class="px-5 py-3 border-b border-beige-100 bg-beige-50">
        <p class="font-medium text-salon-dark">{{ dailyDate }}</p>
        <p class="text-sm text-beige-400">{{ dailyBookings.length }} appointment(s)</p>
      </div>
      <div class="p-4 space-y-3">
        <div v-if="!dailyBookings.length" class="text-center py-8 text-beige-400">No appointments for this day</div>
        <div
          v-for="b in dailyBookings"
          :key="b.id"
          :class="['flex items-start gap-4 p-3 rounded-xl cursor-pointer hover:opacity-90 transition', statusBg(b.status)]"
          @click="openDetail(b)"
        >
          <div class="text-xs font-bold min-w-[40px]">{{ b.appointmentTime }}</div>
          <div>
            <p class="font-medium text-sm">{{ b.customerName }}</p>
            <p class="text-xs opacity-75">{{ b.services?.map(s => s.service?.name).join(', ') }}</p>
            <p class="text-xs font-semibold mt-0.5">Rs. {{ Number(b.totalPrice).toLocaleString() }}</p>
          </div>
          <div class="ml-auto"><StatusBadge :status="b.status" /></div>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <Modal v-model="showDetail" :title="`${selected?.reference}`" size="md">
      <div v-if="selected" class="space-y-3 text-sm">
        <div class="grid grid-cols-2 gap-3">
          <div><p class="text-xs text-beige-400">Customer</p><p class="font-medium">{{ selected.customerName }}</p><p class="text-beige-400">{{ selected.customerPhone }}</p></div>
          <div><p class="text-xs text-beige-400">Date & Time</p><p class="font-medium">{{ formatDate(selected.appointmentDate) }}</p><p class="text-beige-400">{{ selected.appointmentTime }}</p></div>
        </div>
        <div><p class="text-xs text-beige-400 mb-1">Services</p>
          <p v-for="s in selected.services" :key="s.id" class="text-salon-charcoal">{{ s.service?.name }} — Rs. {{ Number(s.price).toLocaleString() }}</p>
        </div>
        <div class="flex items-center justify-between pt-2 border-t border-beige-100">
          <StatusBadge :status="selected.status" />
          <span class="font-bold text-salon-gold">Rs. {{ Number(selected.totalPrice).toLocaleString() }}</span>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Modal from '../../components/ui/Modal.vue'
import StatusBadge from '../../components/ui/StatusBadge.vue'
import api from '../../services/api.js'
import { dateOnlyFromValue, formatDateOnly, isSameDateOnly } from '../../utils/date.js'

const viewMode    = ref('month')
const currentDate = ref(new Date())
const bookings    = ref([])
const showDetail  = ref(false)
const selected    = ref(null)

const views = [{ label: 'Month', value: 'month' }, { label: 'Week', value: 'week' }, { label: 'Day', value: 'day' }]
const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const legend = [
  { label: 'Pending',   dot: 'bg-yellow-400' },
  { label: 'Accepted',  dot: 'bg-green-500' },
  { label: 'Completed', dot: 'bg-blue-500' },
  { label: 'Cancelled', dot: 'bg-red-500' },
]

const statusBg = (s) => ({
  PENDING:   'bg-yellow-100 text-yellow-800',
  ACCEPTED:  'bg-green-100 text-green-800',
  COMPLETED: 'bg-blue-100 text-blue-800',
  CANCELLED: 'bg-red-100 text-red-800',
}[s] || 'bg-gray-100 text-gray-600')

const formatDate = (d) => formatDateOnly(d, { day: '2-digit', month: 'short', year: 'numeric' })

const periodLabel = computed(() => {
  const d = currentDate.value
  if (viewMode.value === 'month') return d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
  if (viewMode.value === 'week') {
    const start = new Date(d); start.setDate(d.getDate() - d.getDay())
    const end   = new Date(start); end.setDate(start.getDate() + 6)
    return `${start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – ${end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
  }
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
})

const dailyDate = computed(() => currentDate.value.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }))

const bookingsByDate = computed(() => {
  const map = {}
  bookings.value.forEach((b) => {
    const k = dateOnlyFromValue(b.appointmentDate)
    if (!k) return
    if (!map[k]) map[k] = []
    map[k].push(b)
  })
  return map
})

const monthCells = computed(() => {
  const d = currentDate.value
  const year = d.getFullYear(), month = d.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()
  const cells = []
  // Previous month padding
  const prevDays = new Date(year, month, 0).getDate()
  for (let i = firstDay - 1; i >= 0; i--) {
    const dt = new Date(year, month - 1, prevDays - i)
    cells.push({ key: `prev-${dateOnlyFromValue(dt)}`, day: prevDays - i, currentMonth: false, isToday: false, bookings: [] })
  }
  // Current month
  for (let i = 1; i <= daysInMonth; i++) {
    const dt = new Date(year, month, i)
    const k  = dateOnlyFromValue(dt)
    cells.push({ key: k, day: i, currentMonth: true, isToday: isSameDateOnly(dt, today), bookings: bookingsByDate.value[k] || [] })
  }
  // Next month padding
  const remaining = 42 - cells.length
  for (let i = 1; i <= remaining; i++) {
    const dt = new Date(year, month + 1, i)
    cells.push({ key: `next-${dateOnlyFromValue(dt)}`, day: i, currentMonth: false, isToday: false, bookings: [] })
  }
  return cells
})

const weekDays = computed(() => {
  const d    = new Date(currentDate.value)
  const start = new Date(d); start.setDate(d.getDate() - d.getDay())
  return Array.from({ length: 7 }, (_, i) => {
    const dt   = new Date(start); dt.setDate(start.getDate() + i)
    const k    = dateOnlyFromValue(dt)
    const today = new Date()
    return {
      key: k, dayName: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][i],
      date: dt.getDate(), isToday: isSameDateOnly(dt, today),
      bookings: bookingsByDate.value[k] || [],
    }
  })
})

const dailyBookings = computed(() => {
  const k = dateOnlyFromValue(currentDate.value)
  return (bookingsByDate.value[k] || []).sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime))
})

const goToday = () => { currentDate.value = new Date() }
const prevPeriod = () => {
  const d = new Date(currentDate.value)
  if (viewMode.value === 'month') d.setMonth(d.getMonth() - 1)
  else if (viewMode.value === 'week') d.setDate(d.getDate() - 7)
  else d.setDate(d.getDate() - 1)
  currentDate.value = d
}
const nextPeriod = () => {
  const d = new Date(currentDate.value)
  if (viewMode.value === 'month') d.setMonth(d.getMonth() + 1)
  else if (viewMode.value === 'week') d.setDate(d.getDate() + 7)
  else d.setDate(d.getDate() + 1)
  currentDate.value = d
}

const openDetail = (b) => { selected.value = b; showDetail.value = true }

const fetchBookings = async () => {
  try {
    const { data } = await api.get('/appointments')
    bookings.value = data.data
  } catch { /* ignore */ }
}

onMounted(fetchBookings)
</script>
