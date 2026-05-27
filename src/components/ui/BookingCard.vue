<template>
  <div class="card p-4 hover:shadow-md transition-shadow">
    <div class="flex items-start justify-between mb-3">
      <div>
        <p class="text-xs font-mono text-salon-gold font-semibold">{{ booking.reference }}</p>
        <h4 class="font-semibold text-salon-dark mt-0.5">{{ booking.customerName }}</h4>
        <p class="text-xs text-beige-400">{{ booking.customerPhone }}</p>
      </div>
      <StatusBadge :status="booking.status" />
    </div>

    <div class="space-y-1.5 mb-3">
      <div class="flex items-center gap-2 text-sm text-salon-charcoal">
        <svg class="w-4 h-4 text-beige-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        {{ formatDate(booking.appointmentDate) }} at {{ booking.appointmentTime }}
      </div>
      <div class="flex items-start gap-2 text-sm text-salon-charcoal">
        <svg class="w-4 h-4 text-beige-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <span>{{ serviceNames }}</span>
      </div>
      <div class="flex items-center gap-2 text-sm font-semibold text-salon-gold">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Rs. {{ Number(booking.totalPrice).toLocaleString() }}
      </div>
    </div>

    <div class="flex flex-wrap gap-2 pt-3 border-t border-beige-100">
      <Button size="sm" variant="ghost" @click="$emit('view', booking)">Details</Button>
      <Button v-if="booking.status === 'PENDING'" size="sm" variant="success" @click="$emit('accept', booking)">Accept</Button>
      <Button v-if="booking.status === 'ACCEPTED'" size="sm" variant="gold" @click="$emit('complete', booking)">Complete</Button>
      <Button v-if="['PENDING','ACCEPTED'].includes(booking.status)" size="sm" variant="danger" @click="$emit('cancel', booking)">Cancel</Button>
      <Button v-if="booking.status === 'CANCELLED'" size="sm" variant="danger" @click="$emit('delete', booking)">Delete</Button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import StatusBadge from './StatusBadge.vue'
import Button from './Button.vue'
import { formatDateOnly } from '../../utils/date.js'

const props = defineProps({
  booking: { type: Object, required: true },
})
defineEmits(['view', 'accept', 'complete', 'cancel', 'delete'])

const serviceNames = computed(() =>
  props.booking.services?.map((s) => s.service?.name).join(', ') || ''
)

const formatDate = (d) => formatDateOnly(d, { day: '2-digit', month: 'short', year: 'numeric' })
</script>
