<template>
  <header class="sticky top-0 z-30 flex items-center justify-between border-b border-beige-200 bg-salon-dark px-6 py-3">
    <div class="flex items-center gap-4">
      <button
        class="p-2 rounded-lg hover:bg-beige-100 transition-colors text-salon-charcoal"
        @click="$emit('toggle-sidebar')"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <h2 class="text-lg font-semibold text-salon-dark font-serif">{{ title }}</h2>
    </div>

    <div class="flex items-center gap-3">
      <span class="text-sm text-beige-400 hidden sm:block">{{ currentDate }}</span>
      <div class="h-8 w-px bg-beige-200" />

      <!-- Profile Dropdown -->
      <div class="relative" ref="dropdownRef">
        <button
          class="flex items-center gap-2 hover:opacity-80 transition-opacity"
          @click="showDropdown = !showDropdown"
        >
          <div class="w-8 h-8 rounded-full bg-salon-gold flex items-center justify-center">
            <span class="text-white text-xs font-semibold">{{ initials }}</span>
          </div>
          <div class="hidden sm:block text-left">
            <p class="text-sm font-medium text-salon-dark leading-tight">{{ adminName }}</p>
            <p class="text-xs text-beige-400 leading-tight">{{ adminEmail }}</p>
          </div>
          <svg class="w-4 h-4 text-beige-400 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <!-- Dropdown Menu -->
        <Transition name="dropdown">
          <div
            v-if="showDropdown"
            class="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-beige-200 bg-salon-dark shadow-lg py-1"
          >
            <!-- Admin info header -->
            <div class="px-4 py-3 border-b border-beige-100">
              <p class="text-sm font-semibold text-salon-dark">{{ adminName }}</p>
              <p class="text-xs text-beige-400 break-all">{{ adminEmail }}</p>
            </div>

            <button
              class="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-salon-charcoal hover:bg-beige-50 transition-colors"
              @click="openProfile"
            >
              <svg class="w-4 h-4 text-salon-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Edit Profile
            </button>

            <button
              class="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-salon-charcoal hover:bg-beige-50 transition-colors"
              @click="openPassword"
            >
              <svg class="w-4 h-4 text-salon-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              Change Password
            </button>

            <div class="border-t border-beige-100 mt-1" />

            <button
              class="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
              @click="handleLogout"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </Transition>
      </div>
    </div>
  </header>

  <!-- Edit Profile Modal -->
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="showProfileModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showProfileModal = false" />
        <div class="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-salon-card shadow-2xl">
          <div class="flex items-center justify-between bg-salon-dark px-6 py-4">
            <h3 class="text-white font-semibold text-lg">Edit Profile</h3>
            <button class="text-white/80 hover:text-white" @click="showProfileModal = false">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="p-6 space-y-4">
            <!-- Current info display -->
            <div class="space-y-1 rounded-xl bg-salon-dark/15 p-4">
              <p class="text-xs text-beige-400 uppercase tracking-wide font-medium">Current Info</p>
              <p class="text-sm font-semibold text-salon-dark">{{ adminName }}</p>
              <p class="text-sm text-beige-400">{{ adminEmail }}</p>
            </div>

            <div v-if="profileSuccess" class="p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
              {{ profileSuccess }}
            </div>
            <div v-if="profileError" class="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {{ profileError }}
            </div>

            <div>
              <label class="label">Full Name</label>
              <input v-model="profileForm.name" type="text" placeholder="Your full name" class="input-field" />
            </div>
            <div>
              <label class="label">Email Address</label>
              <input v-model="profileForm.email" type="email" placeholder="your@email.com" class="input-field" />
            </div>
          </div>
          <div class="px-6 pb-6 flex gap-3 justify-end">
            <button class="btn-ghost" @click="showProfileModal = false">Cancel</button>
            <button class="btn-gold flex items-center gap-2" :disabled="savingProfile" @click="saveProfile">
              <svg v-if="savingProfile" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              {{ savingProfile ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- Change Password Modal -->
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="showPasswordModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showPasswordModal = false" />
        <div class="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-salon-card shadow-2xl">
          <div class="flex items-center justify-between bg-salon-dark px-6 py-4">
            <h3 class="text-white font-semibold text-lg">Change Password</h3>
            <button class="text-white/80 hover:text-white" @click="showPasswordModal = false">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="p-6 space-y-4">
            <div v-if="passwordSuccess" class="p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
              {{ passwordSuccess }}
            </div>
            <div v-if="passwordError" class="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {{ passwordError }}
            </div>

            <div>
              <label class="label">Current Password</label>
              <div class="relative">
                <input
                  v-model="passwordForm.currentPassword"
                  :type="showCurrent ? 'text' : 'password'"
                  placeholder="••••••••"
                  class="input-field pr-10"
                />
                <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-beige-400 hover:text-salon-charcoal" @click="showCurrent = !showCurrent">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path v-if="showCurrent" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
            </div>

            <div>
              <label class="label">New Password</label>
              <div class="relative">
                <input
                  v-model="passwordForm.newPassword"
                  :type="showNew ? 'text' : 'password'"
                  placeholder="Min. 6 characters"
                  class="input-field pr-10"
                />
                <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-beige-400 hover:text-salon-charcoal" @click="showNew = !showNew">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path v-if="showNew" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
            </div>

            <div>
              <label class="label">Confirm New Password</label>
              <input
                v-model="passwordForm.confirmPassword"
                :type="showNew ? 'text' : 'password'"
                placeholder="Repeat new password"
                class="input-field"
                :class="{ 'border-red-400': passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword }"
              />
              <p v-if="passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword" class="text-xs text-red-500 mt-1">
                Passwords do not match
              </p>
            </div>
          </div>
          <div class="px-6 pb-6 flex gap-3 justify-end">
            <button class="btn-ghost" @click="showPasswordModal = false">Cancel</button>
            <button
              class="flex items-center gap-2 rounded-lg border border-white/10 bg-salon-dark px-4 py-2 font-medium text-white transition-colors hover:bg-salon-black disabled:opacity-50"
              :disabled="savingPassword || passwordForm.newPassword !== passwordForm.confirmPassword"
              @click="savePassword"
            >
              <svg v-if="savingPassword" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              {{ savingPassword ? 'Updating...' : 'Update Password' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore.js'
import api from '../services/api.js'

defineProps({ title: { type: String, default: '' } })
defineEmits(['toggle-sidebar'])

const router = useRouter()
const auth   = useAuthStore()

const showDropdown     = ref(false)
const showProfileModal = ref(false)
const showPasswordModal= ref(false)
const dropdownRef      = ref(null)

// Profile form
const profileForm    = ref({ name: '', email: '' })
const savingProfile  = ref(false)
const profileError   = ref('')
const profileSuccess = ref('')

// Password form
const passwordForm    = ref({ currentPassword: '', newPassword: '', confirmPassword: '' })
const savingPassword  = ref(false)
const passwordError   = ref('')
const passwordSuccess = ref('')
const showCurrent     = ref(false)
const showNew         = ref(false)

const adminName  = computed(() => auth.user?.name  || 'Admin')
const adminEmail = computed(() => auth.user?.email || '')
const initials   = computed(() => adminName.value.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase())
const currentDate= computed(() => new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }))

// Close dropdown when clicking outside
const handleClickOutside = (e) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
    showDropdown.value = false
  }
}
onMounted(()  => document.addEventListener('mousedown', handleClickOutside))
onUnmounted(()=> document.removeEventListener('mousedown', handleClickOutside))

const openProfile = () => {
  profileForm.value = { name: adminName.value, email: adminEmail.value }
  profileError.value   = ''
  profileSuccess.value = ''
  showDropdown.value   = false
  showProfileModal.value = true
}

const openPassword = () => {
  passwordForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
  passwordError.value   = ''
  passwordSuccess.value = ''
  showCurrent.value = false
  showNew.value     = false
  showDropdown.value    = false
  showPasswordModal.value = true
}

const saveProfile = async () => {
  profileError.value   = ''
  profileSuccess.value = ''
  if (!profileForm.value.name && !profileForm.value.email) {
    profileError.value = 'Please fill in at least one field'
    return
  }
  savingProfile.value = true
  try {
    const { data } = await api.put('/auth/profile', {
      name:  profileForm.value.name  || undefined,
      email: profileForm.value.email || undefined,
    })
    // Update store with new values
    auth.user = { ...auth.user, ...data.data }
    localStorage.setItem('admin_user', JSON.stringify(auth.user))
    profileSuccess.value = 'Profile updated successfully!'
    setTimeout(() => { showProfileModal.value = false }, 1200)
  } catch (err) {
    profileError.value = err.response?.data?.message || 'Update failed'
  } finally {
    savingProfile.value = false
  }
}

const savePassword = async () => {
  passwordError.value   = ''
  passwordSuccess.value = ''
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordError.value = 'Passwords do not match'
    return
  }
  savingPassword.value = true
  try {
    await api.put('/auth/password', {
      currentPassword: passwordForm.value.currentPassword,
      newPassword:     passwordForm.value.newPassword,
    })
    passwordSuccess.value = 'Password updated successfully!'
    setTimeout(() => { showPasswordModal.value = false }, 1200)
  } catch (err) {
    passwordError.value = err.response?.data?.message || 'Password update failed'
  } finally {
    savingPassword.value = false
  }
}

const handleLogout = () => {
  auth.logout()
  router.push('/login')
}
</script>

<style scoped>
.dropdown-enter-active, .dropdown-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.dropdown-enter-from, .dropdown-leave-to { opacity: 0; transform: translateY(-6px); }
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.btn-ghost { @apply rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10; }
.btn-gold  { @apply rounded-lg border border-white/10 bg-salon-dark px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-salon-black disabled:cursor-not-allowed disabled:opacity-50; }
</style>
