<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="$emit('update:modelValue', false)" />
        <div :class="['relative w-full overflow-hidden rounded-2xl border border-white/10 bg-salon-card shadow-2xl', sizeClass]">
          <div v-if="title" class="flex items-center justify-between border-b border-beige-200 bg-salon-dark px-6 py-4">
            <h3 class="text-lg font-semibold text-salon-dark font-serif">{{ title }}</h3>
            <button class="text-beige-400 transition-colors hover:text-white" @click="$emit('update:modelValue', false)">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="px-6 py-4"><slot /></div>
          <div v-if="$slots.footer" class="px-6 py-4 border-t border-beige-200 flex gap-3 justify-end">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title:      { type: String, default: '' },
  size:       { type: String, default: 'md' },
})
defineEmits(['update:modelValue'])
const sizeClass = computed(() => ({
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}[props.size] || 'max-w-lg'))
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
