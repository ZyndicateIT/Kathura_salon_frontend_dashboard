<template>
  <div class="admin-theme min-h-screen bg-salon-dark flex items-center justify-center p-4">
    <!-- Background pattern -->
    <div class="absolute inset-0 opacity-5" style="background-image: repeating-linear-gradient(45deg, #d6912f 0, #d6912f 1px, transparent 0, transparent 50%); background-size: 20px 20px;" />

    <div class="relative w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="mb-4 inline-flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-white p-0 shadow-lg shadow-black/30">
          <img src="/admin-logo.webp" alt="Salon Kathura logo" class="h-full w-full object-contain" />
        </div>
        <h1 class="font-serif text-3xl font-bold text-white">
          Salon <span class="text-salon-gold">Kathura</span>
        </h1>
        <p class="mt-1 text-sm text-white/70">Admin Management System</p>
      </div>

      <!-- Card -->
      <div class="overflow-hidden rounded-2xl border border-white/10 bg-salon-card shadow-2xl">
        <div class="bg-salon-dark px-6 py-4">
          <h2 class="text-white font-semibold text-lg">Sign in to continue</h2>
        </div>
        <div class="p-6">
          <form @submit.prevent="handleLogin" class="space-y-4">
            <div v-if="error" class="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
              {{ error }}
            </div>

            <div>
              <label class="label">Email Address</label>
              <input
                v-model="form.email"
                type="email"
                placeholder="admin@salonkathura.com"
                required
                class="input-field"
              />
            </div>

            <div>
              <label class="label">Password</label>
              <div class="relative">
                <input
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="••••••••"
                  required
                  class="input-field pr-10"
                />
                <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-white/70" @click="showPassword = !showPassword">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path v-if="showPassword" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
            </div>

            <button
              type="submit"
              :disabled="loading"
              class="w-full btn-gold py-2.5 flex items-center justify-center gap-2"
            >
              <svg v-if="loading" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              {{ loading ? 'Signing in...' : 'Sign In' }}
            </button>
          </form>
        </div>
      </div>

      <p class="mt-6 text-center text-xs text-white/60">&copy; {{ year }} Salon Kathura. All rights reserved.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore.js'

const router = useRouter()
const auth   = useAuthStore()

const form         = ref({ email: '', password: '' })
const showPassword = ref(false)
const error        = ref('')
const loading      = computed(() => auth.loading)
const year         = new Date().getFullYear()

const handleLogin = async () => {
  error.value = ''
  const ok = await auth.login(form.value.email, form.value.password)
  if (ok) {
    router.push('/dashboard')
  } else {
    error.value = auth.error || 'Login failed'
  }
}
</script>
