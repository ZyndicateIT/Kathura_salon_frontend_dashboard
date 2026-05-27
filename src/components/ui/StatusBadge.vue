<template>
  <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', colorClass]">
    <span :class="['w-1.5 h-1.5 rounded-full mr-1.5', dotClass]" />
    {{ label }}
  </span>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  status: { type: String, required: true },
})
const map = {
  PENDING:   { color: 'border border-yellow-300/30 bg-yellow-500/15 text-white', dot: 'bg-yellow-300', label: 'Pending' },
  ACCEPTED:  { color: 'border border-green-300/30 bg-green-500/15 text-white',   dot: 'bg-green-300',  label: 'Accepted' },
  COMPLETED: { color: 'border border-blue-300/30 bg-blue-500/15 text-white',     dot: 'bg-blue-300',   label: 'Completed' },
  CANCELLED: { color: 'border border-red-300/30 bg-red-500/15 text-white',       dot: 'bg-red-300',    label: 'Cancelled' },
}
const current = computed(() => map[props.status?.toUpperCase()] || { color: 'border border-white/15 bg-white/10 text-white', dot: 'bg-white/70', label: props.status })
const colorClass = computed(() => current.value.color)
const dotClass   = computed(() => current.value.dot)
const label      = computed(() => current.value.label)
</script>
