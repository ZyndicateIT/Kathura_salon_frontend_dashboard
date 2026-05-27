<template>
  <div class="space-y-6">
    <div class="flex gap-1 rounded-xl border border-beige-200 bg-white p-1 w-fit">
      <button
        v-for="t in tabs"
        :key="t.value"
        :class="[
          'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
          activeTab === t.value ? 'bg-salon-gold text-white' : 'text-beige-400 hover:text-salon-dark',
        ]"
        @click="setTab(t.value)"
      >
        {{ t.label }}
      </button>
    </div>

    <div v-if="activeTab === 'dashboard'" class="space-y-6">
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div class="card p-5">
          <h3 class="mb-4 font-serif font-semibold text-salon-dark">Bookings by Status</h3>
          <apexchart v-if="donutReady" type="donut" height="280" :options="donutOptions" :series="donutSeries" />
        </div>
        <div class="card p-5">
          <h3 class="mb-4 font-serif font-semibold text-salon-dark">Last 30 Days Trend</h3>
          <apexchart v-if="lineReady" type="area" height="280" :options="lineOptions" :series="lineSeries" />
        </div>
      </div>
    </div>

    <div v-else-if="activeTab === '7days'" class="space-y-4">
      <div class="card overflow-hidden">
        <div class="border-b border-beige-100 px-5 py-4">
          <h3 class="font-serif font-semibold text-salon-dark">Next 7 Days Overview</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-beige-50">
              <tr>
                <th
                  v-for="h in ['Date', 'Total', 'Pending', 'Accepted', 'Completed', 'Cancelled', 'Revenue']"
                  :key="h"
                  class="px-4 py-3 text-left text-xs font-semibold uppercase text-beige-400"
                >
                  {{ h }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="day in sevenDays" :key="day.date" class="border-t border-beige-50 hover:bg-beige-50">
                <td class="px-4 py-3 font-medium">{{ formatDate(day.date) }}</td>
                <td class="px-4 py-3 font-semibold text-salon-dark">{{ day.total }}</td>
                <td class="px-4 py-3 text-yellow-600">{{ day.pending }}</td>
                <td class="px-4 py-3 text-green-600">{{ day.accepted }}</td>
                <td class="px-4 py-3 text-blue-600">{{ day.completed }}</td>
                <td class="px-4 py-3 text-red-500">{{ day.cancelled }}</td>
                <td class="px-4 py-3 font-semibold text-salon-gold">Rs. {{ day.revenue.toLocaleString() }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="card p-5">
        <h3 class="mb-4 font-serif font-semibold text-salon-dark">Next 7 Days - Appointments Bar</h3>
        <apexchart v-if="barReady" type="bar" height="280" :options="barOptions" :series="barSeries" />
      </div>
    </div>

    <div v-else class="space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex flex-wrap items-center gap-3">
          <select v-model.number="selectedYear" class="input-field max-w-[120px]" @change="fetchMonthly">
            <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
          </select>
          <select v-model.number="selectedMonth" class="input-field max-w-[180px]">
            <option v-for="month in monthOptions" :key="month.value" :value="month.value">
              {{ month.label }}
            </option>
          </select>
        </div>

        <Button variant="dark" @click="downloadMonthlyReport">
          Download Excel
        </Button>
      </div>

      <div class="card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-beige-50">
              <tr>
                <th
                  v-for="h in ['Month', 'Total', 'Pending', 'Accepted', 'Completed', 'Cancelled', 'Revenue']"
                  :key="h"
                  class="px-4 py-3 text-left text-xs font-semibold uppercase text-beige-400"
                >
                  {{ h }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="selectedMonthData" class="border-t border-beige-50 hover:bg-beige-50">
                <td class="px-4 py-3 font-medium">{{ selectedMonthData.name }}</td>
                <td class="px-4 py-3 font-semibold text-salon-dark">{{ selectedMonthData.total }}</td>
                <td class="px-4 py-3 text-yellow-600">{{ selectedMonthData.pending }}</td>
                <td class="px-4 py-3 text-green-600">{{ selectedMonthData.accepted }}</td>
                <td class="px-4 py-3 text-blue-600">{{ selectedMonthData.completed }}</td>
                <td class="px-4 py-3 text-red-500">{{ selectedMonthData.cancelled }}</td>
                <td class="px-4 py-3 font-semibold text-salon-gold">Rs. {{ selectedMonthData.revenue.toLocaleString() }}</td>
              </tr>
              <tr v-else class="border-t border-beige-50">
                <td colspan="7" class="px-4 py-6 text-center text-sm text-beige-400">
                  No monthly report data available.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="card p-5">
        <h3 class="mb-4 font-serif font-semibold text-salon-dark">
          Monthly Summary - {{ selectedMonthLabel }} {{ selectedYear }}
        </h3>
        <apexchart v-if="monthlyChartReady" type="bar" height="300" :options="monthlyChartOptions" :series="monthlySeries" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import Button from '../../components/ui/Button.vue'
import api from '../../services/api.js'
import { dateOnlyFromValue, formatDateOnly } from '../../utils/date.js'

const activeTab = ref('dashboard')
const tabs = [
  { label: 'Dashboard', value: 'dashboard' },
  { label: 'Next 7 Days', value: '7days' },
  { label: 'Monthly', value: 'monthly' },
]

const donutReady = ref(false)
const lineReady = ref(false)
const donutSeries = ref([])
const lineSeries = ref([])
const donutOptions = {
  chart: { type: 'donut' },
  labels: ['Pending', 'Accepted', 'Completed', 'Cancelled'],
  colors: ['#eab308', '#22c55e', '#3b82f6', '#ef4444'],
  legend: { position: 'bottom', labels: { colors: '#ffffff' } },
  dataLabels: { style: { colors: ['#ffffff'] } },
}
const lineOptions = {
  chart: { type: 'area', toolbar: { show: false }, foreColor: '#ffffff' },
  colors: ['#d6912f'],
  stroke: { curve: 'smooth', width: 2 },
  fill: { type: 'gradient', gradient: { opacityFrom: 0.4, opacityTo: 0 } },
  xaxis: { type: 'datetime', labels: { style: { colors: '#ffffff' } } },
  yaxis: { labels: { style: { colors: '#ffffff' } } },
  grid: { borderColor: 'rgba(255, 255, 255, 0.12)' },
  dataLabels: { enabled: false },
  tooltip: { theme: 'dark' },
}

const sevenDays = ref([])
const barReady = ref(false)
const barSeries = ref([])
const barOptions = {
  chart: { type: 'bar', toolbar: { show: false }, foreColor: '#ffffff' },
  colors: ['#d6912f', '#22c55e', '#ef4444'],
  xaxis: { categories: [], labels: { style: { colors: '#ffffff' } } },
  yaxis: { labels: { style: { colors: '#ffffff' } } },
  legend: { position: 'top', labels: { colors: '#ffffff' } },
  grid: { borderColor: 'rgba(255, 255, 255, 0.12)' },
  dataLabels: { enabled: false },
  tooltip: { theme: 'dark' },
}

const selectedYear = ref(new Date().getFullYear())
const selectedMonth = ref(new Date().getMonth() + 1)
const monthlyData = ref([])
const monthlyChartReady = ref(false)
const monthlySeries = ref([])
const monthlyChartOptions = {
  chart: { type: 'bar', toolbar: { show: false }, foreColor: '#ffffff' },
  colors: ['#eab308', '#22c55e', '#3b82f6', '#ef4444'],
  xaxis: { categories: [], labels: { style: { colors: '#ffffff' } } },
  yaxis: { labels: { style: { colors: '#ffffff' } } },
  legend: { position: 'top', labels: { colors: '#ffffff' } },
  grid: { borderColor: 'rgba(255, 255, 255, 0.12)' },
  dataLabels: { enabled: false },
  tooltip: { theme: 'dark' },
}

const yearOptions = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)
const monthOptions = Array.from({ length: 12 }, (_, i) => ({
  value: i + 1,
  label: new Date(2000, i, 1).toLocaleString('default', { month: 'long' }),
  shortLabel: new Date(2000, i, 1).toLocaleString('default', { month: 'short' }),
}))

const formatDate = (d) => formatDateOnly(d, { day: '2-digit', month: 'short' })
const selectedMonthData = computed(() =>
  monthlyData.value.find((month) => month.month === selectedMonth.value) || null
)
const selectedMonthLabel = computed(() =>
  monthOptions.find((month) => month.value === selectedMonth.value)?.label || 'Month'
)

const escapeHtml = (value) =>
  String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

const updateMonthlyChart = () => {
  const reportMonth = selectedMonthData.value
  const shortLabel = monthOptions.find((month) => month.value === selectedMonth.value)?.shortLabel || ''

  monthlyChartOptions.xaxis = {
    categories: [shortLabel],
    labels: { style: { colors: '#ffffff' } },
  }
  monthlySeries.value = [
    { name: 'Pending', data: [Number(reportMonth?.pending || 0)] },
    { name: 'Accepted', data: [Number(reportMonth?.accepted || 0)] },
    { name: 'Completed', data: [Number(reportMonth?.completed || 0)] },
    { name: 'Cancelled', data: [Number(reportMonth?.cancelled || 0)] },
  ]
  monthlyChartReady.value = true
}

const downloadMonthlyReport = () => {
  const reportMonth = selectedMonthData.value || {
    name: selectedMonthLabel.value,
    total: 0,
    pending: 0,
    accepted: 0,
    completed: 0,
    cancelled: 0,
    revenue: 0,
  }

  const workbook = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:x="urn:schemas-microsoft-com:office:excel"
          xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="UTF-8" />
        <meta name="ProgId" content="Excel.Sheet" />
        <meta name="Generator" content="Kathura Salon Admin" />
        <style>
          body { font-family: Arial, sans-serif; }
          h2, p { margin: 0 0 8px; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #d1d5db; padding: 8px 10px; text-align: left; }
          th { background: #1f2937; color: #ffffff; }
        </style>
      </head>
      <body>
        <h2>Kathura Salon Monthly Report - ${escapeHtml(reportMonth.name)} ${selectedYear.value}</h2>
        <p>Generated on ${new Date().toLocaleString('en-GB')}</p>
        <table>
          <thead>
            <tr>
              <th>Month</th>
              <th>Total</th>
              <th>Pending</th>
              <th>Accepted</th>
              <th>Completed</th>
              <th>Cancelled</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${escapeHtml(reportMonth.name)}</td>
              <td>${reportMonth.total}</td>
              <td>${reportMonth.pending}</td>
              <td>${reportMonth.accepted}</td>
              <td>${reportMonth.completed}</td>
              <td>${reportMonth.cancelled}</td>
              <td>${Number(reportMonth.revenue || 0)}</td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  `

  const blob = new Blob([workbook], { type: 'application/vnd.ms-excel;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = `monthly-report-${selectedYear.value}-${String(selectedMonth.value).padStart(2, '0')}.xls`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const setTab = (value) => {
  activeTab.value = value
  if (value === 'dashboard') fetchDashboard()
  else if (value === '7days') fetch7Days()
  else fetchMonthly()
}

const fetchDashboard = async () => {
  try {
    const { data } = await api.get('/reports/charts')
    const summary = data.data.statusSummary
    donutSeries.value = [summary.PENDING, summary.ACCEPTED, summary.COMPLETED, summary.CANCELLED]
    donutReady.value = true

    const byDay = {}
    data.data.recentByDay.forEach((booking) => {
      const key = dateOnlyFromValue(booking.appointmentDate)
      if (!key) return
      byDay[key] = (byDay[key] || 0) + 1
    })
    lineSeries.value = [{ name: 'Bookings', data: Object.entries(byDay).map(([x, y]) => ({ x, y })) }]
    lineReady.value = true
  } catch {
    // ignore
  }
}

const fetch7Days = async () => {
  try {
    const { data } = await api.get('/reports/7days')
    sevenDays.value = data.data.days
    const categories = data.data.days.map((day) => formatDate(day.date))
    barOptions.xaxis = { categories }
    barSeries.value = [
      { name: 'Total', data: data.data.days.map((day) => day.total) },
      { name: 'Completed', data: data.data.days.map((day) => day.completed) },
      { name: 'Cancelled', data: data.data.days.map((day) => day.cancelled) },
    ]
    barReady.value = true
  } catch {
    // ignore
  }
}

const fetchMonthly = async () => {
  monthlyChartReady.value = false
  try {
    const { data } = await api.get(`/reports/monthly?year=${selectedYear.value}`)
    monthlyData.value = data.data.months
    updateMonthlyChart()
  } catch {
    // ignore
  }
}

watch(selectedMonth, () => {
  if (activeTab.value === 'monthly') updateMonthlyChart()
})

onMounted(fetchDashboard)
</script>
