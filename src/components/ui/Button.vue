<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="classes"
    v-bind="$attrs"
  >
    <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
    <slot />
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: { type: String, default: 'gold' },
  size:    { type: String, default: 'md' },
  type:    { type: String, default: 'button' },
  disabled:{ type: Boolean, default: false },
  loading: { type: Boolean, default: false },
})

const classes = computed(() => {
  const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    gold:    'border border-gold-400 bg-salon-gold text-white hover:bg-gold-600',
    outline: 'border border-salon-gold text-salon-gold hover:bg-gold-500/10',
    ghost:   'text-white hover:bg-white/10',
    danger:  'border border-red-300/30 bg-red-600/85 text-white hover:bg-red-700',
    success: 'border border-green-300/30 bg-green-600/85 text-white hover:bg-green-700',
    dark:    'border border-white/10 bg-salon-black text-white hover:bg-black',
  }
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }
  return [base, variants[props.variant] || variants.gold, sizes[props.size] || sizes.md]
})
</script>
